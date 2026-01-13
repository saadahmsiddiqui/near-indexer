import { JsonRpcProvider } from "@near-js/providers";
import {
  Block,
  getMaximumStoredHeight,
  storeBlocks,
} from "../../repository/block";
import { createLogger } from "../../logger";
import { sleep } from "../../utils";
import { getBlock } from "../../rpc";
import { processChunk } from "../process-chunk";

export async function catchUp(provider: JsonRpcProvider): Promise<void> {
  const logger = createLogger("catchUp");
  // * Get Last Stored Maximum Height from DB
  // * If the height doesn't exist then check
  // * environment variable for a starting point
  let startingPoint = await getMaximumStoredHeight();

  if (startingPoint) {
    startingPoint.height = startingPoint.height + BigInt(1);
  }

  if (!startingPoint) {
    // TODO: retry getting latest block
    // TODO: from the DB
    if (!process.env.START_BLOCK) {
      await sleep(1000);
      return;
    }

    const startFrom = BigInt(process.env.START_BLOCK);
    startingPoint = {
      height: startFrom,
      chunks_included: BigInt(0),
      gas_price: BigInt(0),
      hash: "<doesn't need hash here>",
      latest_protocol_version: 1,
      timestamp: new Date(),
      total_supply: "0",
      id: BigInt(0),
    };
  }

  logger.info(`Starting ${startingPoint.height}`);
  const currentChainHeight = await getBlock({ finality: "final" }, provider);
  logger.info(`Chain Height ${startingPoint.height}`);
  const chainHeightBig = BigInt(currentChainHeight.header.height);
  const difference = chainHeightBig - startingPoint.height;

  logger.info(`Difference ${difference}`);
  if (difference <= 0n) {
    await sleep(1000);
    return;
  }

  let blocks: Array<Block> = [];

  blocks.push({
    height: BigInt(currentChainHeight.header.height),
    chunks_included: BigInt(currentChainHeight.header.chunks_included),
    gas_price: BigInt(currentChainHeight.header.gas_price),
    hash: currentChainHeight.header.hash,
    latest_protocol_version: currentChainHeight.header.latest_protocol_version,
    timestamp: new Date(Math.floor(currentChainHeight.header.timestamp / 1e6)),
    total_supply: currentChainHeight.header.total_supply,
    id: BigInt(0),
  });

  for (let i = startingPoint.height; i < chainHeightBig; i++) {
    try {
      const num = Number(i);
      const block = await getBlock({ blockId: num }, provider);
      for (const chunk of block.chunks) {
        await processChunk(provider, chunk.chunk_hash);
        const { height, hash } = block.header;
        const { chunk_hash } = chunk;
        const log = `Block Height: ${height} Block Hash: ${hash} Chunk ${chunk_hash}`;
        logger.info(log);
      }

      blocks.push({
        height: BigInt(block.header.height),
        chunks_included: BigInt(block.header.chunks_included),
        gas_price: BigInt(block.header.gas_price),
        hash: block.header.hash,
        latest_protocol_version: block.header.latest_protocol_version,
        timestamp: new Date(Math.floor(block.header.timestamp / 1e6)),
        total_supply: block.header.total_supply,
        id: BigInt(0),
      });
    } catch (error: any) {
      logger.error(error.message);
    }
  }

  try {
    await storeBlocks(blocks);
  } catch (error: any) {
    console.error(error)
    const message = error.message;
    logger.error(`Failure: ${message}`);
  } finally {
    blocks = [];
    await sleep(2000);
  }
}

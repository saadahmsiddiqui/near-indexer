import { JsonRpcProvider } from "@near-js/providers";
import {
  Block,
  getMaximumStoredHeight,
  storeBlocks,
} from "../../repository/block";
import pino from "pino";
import { base64ToBytes, sleep } from "../../utils";
import { Chunk, storeChunks } from "../../repository/chunks";

export async function catchUp(provider: JsonRpcProvider) {
  const logger = pino();

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
      return;
    }

    const startFrom = BigInt(process.env.START_BLOCK);
    startingPoint = {
      height: startFrom,
      chunks_included: BigInt(0),
      gas_price: BigInt(0),
      hash: Buffer.from("Hello World", "utf8"),
      latest_protocol_version: 1,
      prev_hash: Buffer.from("Hello World", "utf8"),
      timestamp: new Date(),
      total_supply: "0",
    };
  }

  logger.info(`Starting ${startingPoint.height}`);
  const currentChainHeight = await provider.block({ finality: "final" });
  logger.info(`Chain Height ${startingPoint.height}`);
  const chainHeightBig = BigInt(currentChainHeight.header.height);
  const difference = chainHeightBig - startingPoint.height;

  logger.info(`Difference ${difference}`);
  if (difference <= 0n) {
    await sleep(1000);
    return await catchUp(provider);
  }

  let blocks: Array<Block> = [];
  let chunks: Array<Chunk> = [];

  blocks.push({
    height: BigInt(currentChainHeight.header.height),
    chunks_included: BigInt(currentChainHeight.header.chunks_included),
    gas_price: BigInt(currentChainHeight.header.gas_price),
    hash: Buffer.from(base64ToBytes(currentChainHeight.header.hash)),
    latest_protocol_version: currentChainHeight.header.latest_protocol_version,
    prev_hash: Buffer.from(base64ToBytes(currentChainHeight.header.prev_hash)),
    timestamp: new Date(Math.floor(currentChainHeight.header.timestamp / 1e6)),
    total_supply: currentChainHeight.header.total_supply,
  });

  for (let i = startingPoint.height; i < chainHeightBig; i++) {
    logger.info(`Querying Block ${i}`);
    const num = Number(i);
    const block = await provider.block({ blockId: num });
    for (const chunk of block.chunks) {
      logger.info(`Block ${block.header.height} Chunk ${chunk.chunk_hash}`);
      chunks.push({
        height: BigInt(block.header.height),
        chunk_hash: Buffer.from(base64ToBytes(chunk.chunk_hash)),
        height_created: BigInt(chunk.height_created),
        height_included: BigInt(chunk.height_included),
        shard_id: BigInt(chunk.shard_id),
        gas_used: BigInt(chunk.gas_used),
        gas_limit: BigInt(chunk.gas_limit),
        rent_paid: chunk.rent_paid,
      });
    }

    blocks.push({
      height: BigInt(block.header.height),
      chunks_included: BigInt(block.header.chunks_included),
      gas_price: BigInt(block.header.gas_price),
      hash: Buffer.from(base64ToBytes(block.header.hash)),
      latest_protocol_version: block.header.latest_protocol_version,
      prev_hash: Buffer.from(base64ToBytes(block.header.prev_hash)),
      timestamp: new Date(Math.floor(block.header.timestamp / 1e6)),
      total_supply: block.header.total_supply,
    });
  }

  try {
    await storeBlocks(blocks);
    await storeChunks(chunks);
    return await catchUp(provider);
  } catch (error: any) {
    const message = error.message;
    console.error(error);
    logger.error(`Failure: ${message}`);
  }
}

import { JsonRpcProvider } from "@near-js/providers";
import { config } from "dotenv";
import { storeBlocks } from "./repository/block";
import { initializeNewHeights } from "./repository/block-index-state";
import pino from "pino";
import { initialize } from "./init";

config();

async function getBlock(provider: JsonRpcProvider) {
  const maybeBlock = await provider.block({ finality: "final" });
  return maybeBlock;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function chaseHeight() {
  const logger = pino();
  const init = await initialize();
  const provider = init.provider;
  let lastObservedHeight = init.lastObservedHeight;

  while (true) {
    let block = null;
    let blocks = [];
    let difference = BigInt(0);
    let height = BigInt(0);

    try {
      block = await getBlock(provider);
      height = BigInt(block.header.height);
      logger.info(`Current Height: ${block.header.height}`);

      if (height <= lastObservedHeight) {
        logger.info("Block already observed, awaiting new block ...");
        await sleep(1000);
        continue;
      }

      difference = height - lastObservedHeight;
      logger.info(`Catch up difference: ${difference}`);
    } catch (error: any) {
      logger.error("Error Fetching Latest Block: ", error.message);
      await sleep(1000);
      continue;
    }

    for (let i = lastObservedHeight; i < lastObservedHeight; i++) {
      try {
        const num = Number(i);
        const info = await provider.block(num);
        blocks.push(info);
      } catch (error: any) {
        // TODO: try these blocks later
        logger.error("Error Fetching Block: ", error.message);
      }
    }

    blocks.push(block);
    let chunks = [];

    for (const block of blocks) {
      for (const chunk of block.chunks) {
        chunks.push({
          height: BigInt(block.header.height),
          chunk_hash: Buffer.from(atob(chunk.chunk_hash)),
        });
      }
    }

    await storeBlocks(blocks.map((block) => block.header));
    await initializeNewHeights(chunks);
    lastObservedHeight = height;
  }
}

function exit() {
  process.exit(0);
}

chaseHeight().then(exit).catch(exit);

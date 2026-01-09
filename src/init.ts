import { JsonRpcProvider } from "@near-js/providers";
import { getLatestBlock } from "./repository/block";
import pino from "pino";

export async function initialize(): Promise<{
  provider: JsonRpcProvider;
  lastObservedHeight: bigint;
}> {
  const logger = pino();
  const nodeEndpoint = process.env.NEAR_NODE_ENDPOINT;
  if (!nodeEndpoint) {
    logger.fatal("Node Endpoint Missing");
    throw new Error("Node Enpoint Missing");
  }

  const dbParams = ["DB_NAME", "PGHOST", "PGUSER", "PGPASSWORD", "PGPORT"];
  for (const param of dbParams) {
    if (!process.env[param]) {
      logger.fatal("Missing DB Configurations");
      throw new Error("Missing DB Configurations");
    }
  }

  let lastObservedHeight = null;
  const latestBlock = await getLatestBlock();
  if (latestBlock) {
    lastObservedHeight = BigInt(latestBlock.height);
  } else {
    if (!process.env.START_BLOCK) {
      logger.fatal("Missing StartHeight");
      throw new Error("Missing StartHeight");
    }
    lastObservedHeight = BigInt(process.env.START_BLOCK);
  }

  const provider = new JsonRpcProvider({ url: nodeEndpoint });
  return { provider, lastObservedHeight };
}

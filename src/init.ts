import { JsonRpcProvider } from "@near-js/providers";
import { getLatestBlock } from "./repository/block";

export async function initialize(): Promise<{
  provider: JsonRpcProvider;
  lastObservedHeight: bigint;
}> {
  const nodeEndpoint = process.env.NEAR_NODE_ENDPOINT;
  if (!nodeEndpoint) throw new Error("Node Enpoint Missing");

  const dbParams = ["DB_NAME", "DB_HOST", "DB_USER", "DB_PASSWORD", "DB_PORT"];
  for (const param of dbParams) {
    if (!process.env[param]) {
      console.error("Missing DB Configurations");
      throw new Error("Missing DB Configurations");
    }
  }

  let lastObservedHeight = null;
  const latestBlock = await getLatestBlock();
  if (latestBlock) {
    lastObservedHeight = BigInt(latestBlock.height);
  } else {
    if (!process.env.START_BLOCK) throw new Error("Missing StartHeight");
    lastObservedHeight = BigInt(process.env.START_BLOCK);
  }

  const provider = new JsonRpcProvider({ url: nodeEndpoint });
  return { provider, lastObservedHeight };
}

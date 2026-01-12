import { JsonRpcProvider } from "@near-js/providers";

function fatalExit(message: string) {
  console.error(message);
  process.exit(1);
}

export async function initialize(): Promise<{
  provider: JsonRpcProvider;
}> {
  const nodeEndpoint = process.env.NEAR_NODE_ENDPOINT;
  if (nodeEndpoint === undefined) {
    fatalExit("Node Endpoint Missing");
  }

  const dbParams = ["DB_NAME", "PGHOST", "PGUSER", "PGPASSWORD", "PGPORT"];
  for (const param of dbParams) {
    if (!process.env[param]) {
      fatalExit("Missing DB Configurations");
    }
  }

  const provider = new JsonRpcProvider({ url: nodeEndpoint! });
  return { provider };
}

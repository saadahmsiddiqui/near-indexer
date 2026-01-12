import { JsonRpcProvider } from "@near-js/providers";
import { createLogger } from "../../logger";

export async function processChunks(
  provider: JsonRpcProvider
): Promise<number> {
  // logger.info("Successfully processing chunks");
  return Date.now();
}

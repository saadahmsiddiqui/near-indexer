import { JsonRpcProvider } from "@near-js/providers";

type BlockHash = string;
type BlockHeight = number;
type BlockId = BlockHash | BlockHeight;
type Finality = "optimistic" | "near-final" | "final";
type FinalityReference = {
  finality: Finality;
};

type BlockReference =
  | {
      blockId: BlockId;
    }
  | FinalityReference
  | {
      /** @deprecated */
      sync_checkpoint: "genesis" | "earliest_available";
    };

export async function getBlock(
  args: BlockReference,
  provider: JsonRpcProvider,
  retryCount = 0
): ReturnType<JsonRpcProvider["block"]> {
  try {
    return await provider.block(args);
  } catch (error) {
    return retryCount < 5
      ? await getBlock(args, provider, retryCount + 1)
      : Promise.reject(error);
  }
}

export async function getChunk(
  chunk_id: string,
  provider: JsonRpcProvider,
  retryCount = 0
): ReturnType<JsonRpcProvider["chunk"]> {
  try {
    return await provider.chunk(chunk_id);
  } catch (error) {
    return retryCount < 5
      ? await getChunk(chunk_id, provider, retryCount + 1)
      : Promise.reject(error);
  }
}

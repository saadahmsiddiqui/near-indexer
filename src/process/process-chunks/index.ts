import { JsonRpcProvider } from "@near-js/providers";
import { createLogger } from "../../logger";
import {
  getIndexableChunks,
  IndexState,
  updateIndexedState,
} from "../../repository/chunks";
import { storeTransactions, Transaction } from "../../repository/transaction";
import { sleep } from "../../utils";

export async function processChunks(provider: JsonRpcProvider): Promise<void> {
  const logger = createLogger("processChunks");

  const indexableChunks = await getIndexableChunks(500);
  if (indexableChunks.length === 0) return;

  let fetchedIds: Set<bigint> = new Set();
  let failedFetchIds: Set<bigint> = new Set();

  const created_at = new Date();

  let transactionsToStore: Array<Transaction> = [];
  for (const chunk of indexableChunks) {
    try {
      const chunkId = chunk.chunk_hash.toString("base64");
      const chunkData = await provider.chunk(chunkId);
      fetchedIds.add(chunk.id);

      chunkData.transactions.forEach((tx) => {
        transactionsToStore.push({
          hash: tx.hash,
          nonce: BigInt(tx.nonce),
          priority_fee: BigInt(0),
          public_key: tx.public_key,
          receiver_id: tx.receiver_id,
          signature: tx.signature,
          signer_id: tx.signer_id,
          actions: tx.actions,
          id: BigInt(0),
          created_at,
        });
      });
    } catch (error: any) {
      failedFetchIds.add(chunk.id);
    }
  }

  if (failedFetchIds.size > 0) {
    logger.info(`Updating Index State FAILED ${failedFetchIds.size}`);
    await updateIndexedState(failedFetchIds, IndexState.FAILED);
  }

  if (fetchedIds.size > 0) {
    logger.info(`Updating Index State INDEXED ${fetchedIds.size}`);
    await updateIndexedState(fetchedIds, IndexState.INDEXED);
  }

  if (transactionsToStore.length > 0) {
    logger.info(`Storing Transactions ${transactionsToStore.length}`);
    await storeTransactions(transactionsToStore);
  }

  await sleep(1000);
  return;
}

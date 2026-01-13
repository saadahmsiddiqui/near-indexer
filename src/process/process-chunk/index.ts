import { JsonRpcProvider } from "@near-js/providers";
import { createLogger } from "../../logger";
import { storeTransactions, Transaction } from "../../repository/transaction";

export async function processChunk(
  provider: JsonRpcProvider,
  chunk_hash: string
): Promise<void> {
  const logger = createLogger("processChunk");
  let transactionsToStore: Array<Transaction> = [];

  try {
    const chunkData = await provider.chunk(chunk_hash);
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
        created_at: new Date(),
      });
    });

    if (transactionsToStore.length > 0) {
      await storeTransactions(transactionsToStore);
    }
  } catch (error: any) {
    logger.error(error.message);
  } finally {
    transactionsToStore = [];
    return;
  }
}

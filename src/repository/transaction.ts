import { runInTransaction } from "../database";

export interface Transaction {
  id: bigint;
  hash: string;
  nonce: bigint;
  height: bigint;
  priority_fee: bigint;
  public_key: string;
  receiver_id: string;
  signature: string;
  signer_id: string;
  actions: any;
  created_at: Date;
}

export async function storeTransactions(
  transactions: Array<Transaction>
): Promise<void> {
  let statement = `INSERT INTO transactions (hash, height, nonce, priority_fee, public_key, receiver_id, signature, signer_id, actions) VALUES `;

  let elements = [];
  for (const transaction of transactions) {
    elements.push(
      `('${transaction.hash}', ${transaction.height}, ${transaction.nonce}, ${
        transaction.priority_fee
      }, '${transaction.public_key}', '${transaction.receiver_id}', '${
        transaction.signature
      }', '${transaction.signer_id}', '${JSON.stringify(
        transaction.actions
      )}'::jsonb)`
    );
  }

  await runInTransaction([[`${statement} ${elements.join(",")}`, []]]);
}

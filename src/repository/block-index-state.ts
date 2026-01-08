import { getDbPooledConnection, runInTransaction } from "../database";

enum State {
  FAILED = "FAILED",
  COMPLETED = "COMPLETED",
  READY = "READY",
}

interface BlockIndexState {
  state: State;
  chunk_hash: Buffer;
  height: BigInt;
  created_at: string;
}

export async function initializeNewHeights(
  heights: Array<{ height: BigInt; chunk_hash: Buffer }>
): Promise<void> {
  let query = `INSERT INTO block_index_state(height, chunk_hash, state) VALUES `;
  let values = [];

  for (const height of heights) {
    const chunk_hash = `'${height.chunk_hash.toString("hex")}'`;
    const state = `'READY'`;
    const heightStr = `${height.height.toString()}`;
    values.push(`(${heightStr}, ${chunk_hash}, ${state})`);
  }

  query += values.join(",");
  await runInTransaction([[query, []]]);
}

export async function getReadyHeights(
  limit: number = 250
): Promise<Array<BlockIndexState>> {
  const query = `SELECT * FROM block_index_state WHERE state = "READY" LIMIT ${limit}`;
  const client = getDbPooledConnection();
  const response = await client.query<BlockIndexState>(query);
  return response.rows;
}

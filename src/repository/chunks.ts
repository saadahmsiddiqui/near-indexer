import { runInTransaction } from "../database";

export interface Chunk {
  height: bigint;
  chunk_hash: Buffer;
  height_created: bigint;
  height_included: bigint;
  shard_id: bigint;
  gas_used: bigint;
  gas_limit: bigint;
  rent_paid: string;
}

export async function storeChunks(chunks: Array<Chunk>): Promise<void> {
  let statement =
    "INSERT INTO chunks (height, chunk_hash, height_created, height_included, shard_id, gas_used, gas_limit, rent_paid) VALUES ";

  const values = [];
  for (const chunk of chunks) {
    const height = chunk.height;
    const height_created = chunk.height_created;
    const height_included = chunk.height_included;
    const shard_id = chunk.shard_id;
    const gas_limit = chunk.gas_limit;
    const gas_used = chunk.gas_used;
    const rent_paid = chunk.rent_paid;
    const chunk_hash = chunk.chunk_hash.toString("hex");
    const value = `(${height}, decode('${chunk_hash}', 'hex'), ${height_created}, ${height_included}, ${shard_id}, ${gas_used}, ${gas_limit}, ${rent_paid})`;
    values.push(value);
  }

  statement += values.join(",");
  await runInTransaction([[statement, []]]);
}

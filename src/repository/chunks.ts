import { getDbPooledConnection, runInTransaction } from "../database";

export enum IndexState {
  READY,
  FAILED,
  INDEXED,
}

export interface Chunk {
  id: bigint;
  height: bigint;
  chunk_hash: Buffer;
  height_created: bigint;
  height_included: bigint;
  shard_id: bigint;
  gas_used: bigint;
  gas_limit: bigint;
  rent_paid: string;
  index_state: IndexState;
}

export interface ChunkSerialized {
  id: number | string;
  height: number | string;
  chunk_hash: Buffer;
  height_created: number | string;
  height_included: number | string;
  shard_id: number | string;
  gas_used: number | string;
  gas_limit: number | string;
  rent_paid: string;
  index_state: IndexState;
}

function deserialize(data: ChunkSerialized): Chunk {
  return {
    id: BigInt(data.id),
    height: BigInt(data.height),
    chunk_hash: data.chunk_hash,
    height_created: BigInt(data.height_created),
    height_included: BigInt(data.height_included),
    shard_id: BigInt(data.shard_id),
    gas_used: BigInt(data.gas_used),
    gas_limit: BigInt(data.gas_limit),
    rent_paid: data.rent_paid,
    index_state: data.index_state,
  };
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

export async function getIndexableChunks(limit = 250): Promise<Array<Chunk>> {
  let statement = `SELECT * from chunks WHERE index_state = 0 ORDER BY height DESC LIMIT ${limit}`;
  const client = getDbPooledConnection();
  const results = await client.query<ChunkSerialized>(statement, []);
  await client.end();
  return results.rows.map((row) => deserialize(row));
}

export async function updateIndexedState(
  chunksIds: Set<bigint>,
  state: IndexState
) {
  const ids = Array.from(chunksIds).join(",");
  let statement = `UPDATE chunks SET index_state = ${state} WHERE id IN (${ids})`;
  await runInTransaction([[statement, []]]);
}

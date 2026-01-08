interface Chunk {
  height: string;
  chunk_hash: Buffer;
  height_created: bigint;
  height_included: bigint;
  shard_id: bigint;
  gas_used: bigint;
  gas_limit: bigint;
  rent_paid: string;
}
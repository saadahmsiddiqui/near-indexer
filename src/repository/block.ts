import {
  getDbPooledConnection,
  runInTransaction,
  Statements,
} from "../database";

interface BlockInfo {
  height: number;
  block_merkle_root: string;
  chunk_receipts_root: string;
  chunk_tx_root: string;
  chunk_headers_root: string;
  chunks_included: number;
  gas_price: string;
  hash: string;
  latest_protocol_version: number;
  prev_hash: string;
  prev_state_root: string;
  timestamp: number;
  timestamp_nanosec: string;
  total_supply: string;
}

export async function storeBlocks(blocks: BlockInfo[]) {
  let statements: Statements = [];

  for (const block of blocks) {
    const args = [
      Buffer.from(atob(block.block_merkle_root)),
      Buffer.from(atob(block.chunk_headers_root)),
      Buffer.from(atob(block.chunk_receipts_root)),
      Buffer.from(atob(block.chunk_tx_root)),
      block.chunks_included,
      block.gas_price,
      Buffer.from(atob(block.hash)),
      block.height,
      block.latest_protocol_version,
      Buffer.from(atob(block.prev_hash)),
      Buffer.from(atob(block.prev_state_root)),
      new Date(Math.floor(block.timestamp / 1e6)).toISOString(),
      block.timestamp_nanosec,
      block.total_supply,
    ];

    const keys = [
      "block_merkle_root",
      "chunk_headers_root",
      "chunk_receipts_root",
      "chunk_tx_root",
      "chunks_included",
      "gas_price",
      "hash",
      "height",
      "latest_protocol_version",
      "prev_hash",
      "prev_state_root",
      "timestamp",
      "timestamp_nanosec",
      "total_supply",
    ]
      .sort()
      .join(",");
    const params = [...Array(14).keys()].map((i) => `$${i + 1}`).join(",");
    const statement = `INSERT INTO blocks (${keys}) VALUES (${params})`;
    statements.push([statement, args]);
  }

  await runInTransaction(statements);
}

interface Block {
  height: bigint;
  block_merkle_root: Buffer;
  chunk_receipts_root: Buffer;
  chunk_tx_root: Buffer;
  chunk_headers_root: Buffer;
  chunks_included: bigint;
  gas_price: bigint;
  hash: Buffer;
  latest_protocol_version: number;
  prev_hash: Buffer;
  prev_state_root: Buffer;
  timestamp: number;
  timestamp_nanosec: Buffer;
  total_supply: string;
}

export async function getBlock(height: number): Promise<Block | null> {
  const client = getDbPooledConnection();
  const query = `SELECT * FROM blocks WHERE height = $1`;
  const queryResult = await client.query<Block>(query, [height]);

  if (queryResult.rows) {
    return queryResult.rows[0];
  }

  return null;
}

export async function getLatestBlock(): Promise<Block | null> {
  const client = getDbPooledConnection();
  const query = `SELECT * FROM blocks WHERE height = (SELECT MAX(height) FROM blocks)`;
  const queryResult = await client.query<Block>(query, []);

  if (queryResult.rows) {
    return queryResult.rows[0];
  }

  return null;
}
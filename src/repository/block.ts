import {
  getDbPooledConnection,
  runInTransaction,
  Statements,
} from "../database";

interface BlockInfo {
  height: number;
  chunks_included: number;
  gas_price: string;
  hash: string;
  latest_protocol_version: number;
  prev_hash: string;
  timestamp: number;
  total_supply: string;
}

export async function storeBlocks(blocks: BlockInfo[]) {
  let statements: Statements = [];

  for (const block of blocks) {
    const args = [
      block.chunks_included,
      block.gas_price,
      Buffer.from(atob(block.hash)),
      block.height,
      block.latest_protocol_version,
      Buffer.from(atob(block.prev_hash)),
      new Date(Math.floor(block.timestamp / 1e6)).toISOString(),
      block.total_supply,
    ];

    const keys = [
      "chunks_included",
      "gas_price",
      "hash",
      "height",
      "latest_protocol_version",
      "prev_hash",
      "timestamp",
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
  chunks_included: bigint;
  gas_price: bigint;
  hash: Buffer;
  latest_protocol_version: number;
  prev_hash: Buffer;
  timestamp: number;
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

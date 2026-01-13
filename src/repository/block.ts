import {
  getDbPooledConnection,
  runInTransaction,
  Statements,
} from "../database";

export interface Block {
  id: bigint;
  height: bigint;
  chunks_included: bigint;
  gas_price: bigint;
  hash: string;
  latest_protocol_version: number;
  timestamp: Date;
  total_supply: string;
}

interface BlockSerialized {
  id: number | string;
  height: number | string;
  chunks_included: number | string;
  gas_price: number | string;
  hash: string;
  latest_protocol_version: number;
  timestamp: string;
  total_supply: string;
}

function deserialize(data: BlockSerialized): Block {
  return {
    height: BigInt(data.height),
    chunks_included: BigInt(data.chunks_included),
    gas_price: BigInt(data.gas_price),
    hash: data.hash,
    latest_protocol_version: data.latest_protocol_version,
    timestamp: new Date(data.timestamp),
    total_supply: data.total_supply,
    id: BigInt(data.id),
  };
}

export async function storeBlocks(blocks: Block[]) {
  let statements: Statements = [];

  for (const block of blocks) {
    const args = [
      block.chunks_included,
      block.gas_price,
      block.hash,
      block.height,
      block.latest_protocol_version,
      block.timestamp.toISOString(),
      block.total_supply,
    ];

    const keys = [
      "chunks_included",
      "gas_price",
      "hash",
      "height",
      "latest_protocol_version",
      "timestamp",
      "total_supply",
    ]
      .sort()
      .join(",");
    const params = [...Array(7).keys()].map((i) => `$${i + 1}`).join(",");
    const statement = `INSERT INTO blocks (${keys}) VALUES (${params})`;
    statements.push([statement, args]);
  }

  await runInTransaction(statements);
}

export async function getBlock(height: number): Promise<Block | null> {
  const client = getDbPooledConnection();
  const query = `SELECT * FROM blocks WHERE height = $1`;
  const queryResult = await client.query<BlockSerialized>(query, [height]);

  if (queryResult.rows) {
    return deserialize(queryResult.rows[0]);
  }

  return null;
}

export async function getMaximumStoredHeight(): Promise<Block | null> {
  const client = getDbPooledConnection();
  const query = `SELECT * FROM blocks WHERE height = (SELECT MAX(height) FROM blocks)`;
  const queryResult = await client.query<BlockSerialized>(query, []);

  if (queryResult.rowCount && queryResult.rowCount > 0) {
    return deserialize(queryResult.rows[0]);
  }

  return null;
}

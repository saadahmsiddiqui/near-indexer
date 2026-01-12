import { Pool } from "pg";

export function getDbPooledConnection() {
  return new Pool({
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT || 5432),
    database: process.env.DB_NAME,
  });
}

export type Statements = Array<[string, Array<any>]>;

export async function runInTransaction(statements: Statements) {
  const client = getDbPooledConnection();

  try {
    await client.query("BEGIN");

    for (const [query, args] of statements) {
      await client.query(query, args);
    }

    await client.query("COMMIT");
  } catch (error: any) {
    await client.query("ROLLBACK");
  } finally {
    client.end();
  }
}

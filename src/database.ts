import { Pool } from "pg";
import pino from "pino";

export function getDbPooledConnection() {
  const logger = pino();
  logger.info("Creating a connection pool");

  return new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    database: process.env.DB_NAME,
  });
}

export type Statements = Array<[string, Array<any>]>;

export async function runInTransaction(statements: Statements) {
  const logger = pino();
  const client = getDbPooledConnection();
  logger.info(`Executing ${statements.length} statements`);

  try {
    logger.info("PG Transaction Initiated");
    await client.query("BEGIN");

    for (const [query, args] of statements) {
      await client.query(query, args);
    }

    await client.query("COMMIT");
    logger.error("PG Transaction Successful");
  } catch (error: any) {
    logger.error("PG Transaction Failed " + error.message);
    await client.query("ROLLBACK");
  } finally {
    client.end();
  }
}

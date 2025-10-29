import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL // defina em .env
});

export const db = drizzle(pool);
export { schema };

// opcional: função para fechar o pool em scripts/tests
export const closeDb = async () => {
  await pool.end();
};

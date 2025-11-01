import 'dotenv/config';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
export * from './schema';

//Conexoes abertas com o banco
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export const db = drizzle(pool);


//Aquela função para fechar o pool em scripts/tests mais zomenos
export const closeDb = async () => {
  await pool.end();
};

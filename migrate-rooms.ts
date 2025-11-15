import { db } from './src/lib/server/db';
import { sql } from 'drizzle-orm';

async function migrateRooms() {
	try {
		console.log('🔧 Iniciando migração da tabela rooms...');

		console.log('Removendo constraints...');
		await db.execute(sql`
			ALTER TABLE IF EXISTS "courses" 
			DROP CONSTRAINT IF EXISTS "room"
		`);

		console.log('Dropando tabela antiga...');
		await db.execute(sql`DROP TABLE IF EXISTS "rooms" CASCADE`);

		console.log('Criando nova tabela...');
		await db.execute(sql`
			CREATE TABLE "rooms" (
				"id" SERIAL PRIMARY KEY,
				"name" VARCHAR(255) NOT NULL,
				"number" INTEGER NOT NULL,
				"description" TEXT,
				"image_url" VARCHAR(500),
				"capacity" INTEGER,
				"status" BOOLEAN DEFAULT true,
				"created_at" TIMESTAMP DEFAULT NOW()
			)
		`);

		console.log('Recriando constraints...');
		const tableExists = await db.execute(sql`
			SELECT EXISTS (
				SELECT FROM information_schema.tables 
				WHERE table_name = 'courses'
			)
		`);

		if (tableExists[0]?.exists) {
			await db.execute(sql`
				ALTER TABLE "courses" 
				ADD CONSTRAINT "room" 
				FOREIGN KEY ("room") 
				REFERENCES "rooms"("id") 
				ON DELETE CASCADE
			`);
		}

		console.log(' Migração concluída com sucesso!');
		process.exit(0);
	} catch (error) {
		console.error(' Erro na migração:', error);
		process.exit(1);
	}
}

migrateRooms();

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL não está definida no .env');
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

async function fixRoomsTable() {
	try {
		console.log('🔧 Iniciando correção da tabela rooms...');

		console.log('1. Removendo foreign keys...');
		await db.execute(sql`
			ALTER TABLE IF EXISTS "courses" 
			DROP CONSTRAINT IF EXISTS "room"
		`);

		console.log('2. Recriando tabela rooms...');
		await db.execute(sql`DROP TABLE IF EXISTS "rooms" CASCADE`);
		
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

		console.log('3. Verificando tabela courses...');
		const tableExists = await db.execute(sql`
			SELECT EXISTS (
				SELECT FROM information_schema.tables 
				WHERE table_name = 'courses'
			)
		`);
		
		if (tableExists[0]?.exists) {
			console.log('4. Alterando tipo da coluna room em courses para integer...');
			
			const hasData = await db.execute(sql`
				SELECT COUNT(*) as count FROM "courses" WHERE "room" IS NOT NULL
			`);
			
			if ((hasData[0] as any).count > 0) {
				console.log('⚠️  ATENÇÃO: Existem cursos com salas atribuídas!');
				console.log('   Limpando referências antigas...');
				await db.execute(sql`UPDATE "courses" SET "room" = NULL`);
			}
			
			await db.execute(sql`
				ALTER TABLE "courses" 
				ALTER COLUMN "room" TYPE INTEGER USING NULL
			`);
			
			await db.execute(sql`
				ALTER TABLE "courses" 
				ADD CONSTRAINT "room" 
				FOREIGN KEY ("room") 
				REFERENCES "rooms"("id") 
				ON DELETE CASCADE
			`);
			
			console.log('✅ Foreign key recriada com sucesso!');
		}

		console.log('✅ Migração concluída com sucesso!');
		console.log('✅ Tabela rooms agora tem id SERIAL que auto-incrementa');
		
		await client.end();
		process.exit(0);
	} catch (error) {
		console.error('❌ Erro na migração:', error);
		await client.end();
		process.exit(1);
	}
}

fixRoomsTable();

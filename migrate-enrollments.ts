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

async function migrateEnrollments() {
	try {
		console.log('🔧 Iniciando migração da tabela course_enrollments...');

		console.log('1. Criando enum enrollment_status...');
		await db.execute(sql`
			DO $$ BEGIN
				CREATE TYPE enrollment_status AS ENUM ('active', 'cancelled', 'completed', 'pending');
			EXCEPTION
				WHEN duplicate_object THEN null;
			END $$;
		`);

		console.log('2. Verificando se tabela course_enrollments existe...');
		const tableExists = await db.execute(sql`
			SELECT EXISTS (
				SELECT FROM information_schema.tables 
				WHERE table_name = 'course_enrollments'
			)
		`);

		if (!(tableExists[0] as any)?.exists) {
			console.log('3. Criando tabela course_enrollments...');
			await db.execute(sql`
				CREATE TABLE "course_enrollments" (
					"id" SERIAL PRIMARY KEY,
					"user_id" TEXT NOT NULL,
					"course_id" INTEGER NOT NULL,
					"status" enrollment_status DEFAULT 'active' NOT NULL,
					"amount" DOUBLE PRECISION NOT NULL,
					"enrolled_at" TIMESTAMP DEFAULT NOW() NOT NULL,
					"cancelled_at" TIMESTAMP,
					"notes" TEXT,
					CONSTRAINT "course_enrollments_user_id_fk" 
						FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE,
					CONSTRAINT "course_enrollments_course_id_fk" 
						FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE
				)
			`);
		} else {
			console.log('3. Tabela já existe, adicionando novas colunas...');
			
			console.log('   - Adicionando coluna status...');
			await db.execute(sql`
				DO $$ BEGIN
					ALTER TABLE "course_enrollments" 
					ADD COLUMN "status" enrollment_status DEFAULT 'active' NOT NULL;
				EXCEPTION
					WHEN duplicate_column THEN null;
				END $$;
			`);

			console.log('   - Adicionando coluna amount...');
			await db.execute(sql`
				DO $$ BEGIN
					ALTER TABLE "course_enrollments" 
					ADD COLUMN "amount" DOUBLE PRECISION NOT NULL DEFAULT 0;
				EXCEPTION
					WHEN duplicate_column THEN null;
				END $$;
			`);

			console.log('   - Adicionando coluna cancelled_at...');
			await db.execute(sql`
				DO $$ BEGIN
					ALTER TABLE "course_enrollments" 
					ADD COLUMN "cancelled_at" TIMESTAMP;
				EXCEPTION
					WHEN duplicate_column THEN null;
				END $$;
			`);

			console.log('   - Adicionando coluna notes...');
			await db.execute(sql`
				DO $$ BEGIN
					ALTER TABLE "course_enrollments" 
					ADD COLUMN "notes" TEXT;
				EXCEPTION
					WHEN duplicate_column THEN null;
				END $$;
			`);

			console.log('   - Renomeando coluna student_id para user_id...');
			await db.execute(sql`
				DO $$ BEGIN
					ALTER TABLE "course_enrollments" 
					RENAME COLUMN "student_id" TO "user_id";
				EXCEPTION
					WHEN undefined_column THEN null;
				END $$;
			`);
		}

		console.log('✅ Migração concluída com sucesso!');
		
		await client.end();
		process.exit(0);
	} catch (error) {
		console.error('❌ Erro na migração:', error);
		await client.end();
		process.exit(1);
	}
}

migrateEnrollments();

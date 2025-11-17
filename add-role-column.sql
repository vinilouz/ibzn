-- Adicionar coluna role na tabela user (sem afetar outras tabelas)

-- Criar o enum de roles
DO $$ BEGIN
    CREATE TYPE "public"."role" AS ENUM('admin', 'manager', 'user', 'guest');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Adicionar coluna role
ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS "role" "public"."role" DEFAULT 'user' NOT NULL;

-- Verificar
SELECT id, email, role FROM "user" LIMIT 5;

-- Migration segura para adicionar coluna role sem perder dados
-- Execute este arquivo ANTES de rodar drizzle-kit push

-- Adiciona a coluna role como text primeiro (para evitar conflito com o enum)
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "role" text DEFAULT 'user';

-- Atualiza todos os usuários existentes que não tem role
UPDATE "user" SET "role" = 'user' WHERE "role" IS NULL;

-- Agora o drizzle-kit push pode converter de text para enum sem problemas

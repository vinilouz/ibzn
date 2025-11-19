-- Migration: Add participant_id to payments table
-- Este script adiciona suporte para participantes na tabela de pagamentos

-- 1. Adicionar coluna participant_id (nullable para permitir transição gradual)
ALTER TABLE "payments" ADD COLUMN IF NOT EXISTS "participant_id" integer;

-- 2. Adicionar foreign key para participants
ALTER TABLE "payments"
ADD CONSTRAINT "payments_participant_id_fk"
FOREIGN KEY ("participant_id")
REFERENCES "participants"("id")
ON DELETE CASCADE;

-- 3. Tornar user_id nullable (já é nullable no schema)
ALTER TABLE "payments" ALTER COLUMN "user_id" DROP NOT NULL;

-- Nota: Para dados existentes, você pode querer migrar userId para participantId
-- ou manter ambos os campos por um tempo durante a transição

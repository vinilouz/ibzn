-- Migration: Add participant_id to course_enrollments table
-- Este script adiciona suporte para participantes na tabela de matrículas

-- 1. Adicionar coluna participant_id (nullable)
ALTER TABLE "course_enrollments" ADD COLUMN IF NOT EXISTS "participant_id" integer;

-- 2. Tornar user_id nullable
ALTER TABLE "course_enrollments" ALTER COLUMN "user_id" DROP NOT NULL;

-- 3. Adicionar foreign key para participants
ALTER TABLE "course_enrollments"
ADD CONSTRAINT "course_enrollments_participant_id_fk"
FOREIGN KEY ("participant_id")
REFERENCES "participants"("id")
ON DELETE CASCADE;

-- Nota: Agora as matrículas podem ser vinculadas a participantes ou usuários

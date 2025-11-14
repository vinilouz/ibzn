-- Migration: Add role column to user table
-- Safe migration that preserves existing data

-- Step 1: Create the role enum type if it doesn't exist
DO $$ BEGIN
    CREATE TYPE "public"."role" AS ENUM('admin', 'manager', 'user', 'guest');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Step 2: Add role column with default value
ALTER TABLE "user" 
ADD COLUMN IF NOT EXISTS "role" "public"."role" DEFAULT 'user' NOT NULL;

-- Step 3: Update any existing users to have 'user' role (already handled by default)
-- This ensures all existing records have a valid role value

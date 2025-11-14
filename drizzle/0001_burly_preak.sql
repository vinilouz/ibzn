CREATE TYPE "public"."role" AS ENUM('admin', 'manager', 'user', 'guest');--> statement-breakpoint
DROP TABLE "rooms" CASCADE;--> statement-breakpoint
DROP TABLE "courses" CASCADE;--> statement-breakpoint
DROP TABLE "account" CASCADE;--> statement-breakpoint
DROP TABLE "session" CASCADE;--> statement-breakpoint
DROP TABLE "verification" CASCADE;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" "role" DEFAULT 'user' NOT NULL;--> statement-breakpoint
DROP TYPE "public"."weekday";
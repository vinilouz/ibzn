ALTER TABLE "rooms" ALTER COLUMN "id" SET DATA TYPE serial;--> statement-breakpoint
ALTER TABLE "user" DROP COLUMN "role";--> statement-breakpoint
DROP TYPE "public"."role";
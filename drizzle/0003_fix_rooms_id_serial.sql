-- Remover constraints de foreign key que referenciam rooms
ALTER TABLE IF EXISTS "courses" DROP CONSTRAINT IF EXISTS "room";
ALTER TABLE IF EXISTS "courses" DROP CONSTRAINT IF EXISTS "courses_room_rooms_id_fk";

-- Dropar a tabela rooms antiga
DROP TABLE IF EXISTS "rooms" CASCADE;

-- Recriar a tabela rooms com id serial
CREATE TABLE "rooms" (
    "id" SERIAL PRIMARY KEY,
    "name" VARCHAR(255) NOT NULL,
    "number" INTEGER NOT NULL,
    "description" TEXT,
    "image_url" VARCHAR(500),
    "capacity" INTEGER,
    "status" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP DEFAULT NOW()
);

-- Recriar a constraint de foreign key se a tabela courses existir
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'courses') THEN
        ALTER TABLE "courses" 
        ADD CONSTRAINT "courses_room_rooms_id_fk" 
        FOREIGN KEY ("room") 
        REFERENCES "rooms"("id") 
        ON DELETE CASCADE 
        ON UPDATE NO ACTION;
    END IF;
END $$;

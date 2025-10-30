import { pgTable, serial, integer, timestamp, boolean, varchar, text } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
    id: serial('id').primaryKey(),
    age: integer('age')
});

export const rooms = pgTable('rooms', {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    number: integer('number').notNull(),
    capacity: integer('capacity'),
    description: text('description'),
    imageUrl: text('image_url'),
    status: boolean('status').default(true),
    createdAt: timestamp('created_at').defaultNow()
});

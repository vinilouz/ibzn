import { pgTable, integer, timestamp, boolean, text, varchar, serial } from 'drizzle-orm/pg-core';

export const rooms = pgTable('rooms', {
	id: serial('id').primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	number: integer('number').notNull(),
	description: text('description'),
	imageUrl: varchar('image_url', { length: 500 }),
	capacity: integer('capacity'),
	status: boolean('status').default(true),
	createdAt: timestamp('created_at').defaultNow()
});
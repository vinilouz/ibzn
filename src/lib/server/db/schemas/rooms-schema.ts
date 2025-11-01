import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core';

export const rooms = pgTable('rooms', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	capacity: integer('capacity').notNull(),
	description: text('description'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});
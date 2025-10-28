import { pgTable, serial, integer, timestamp, boolean } from 'drizzle-orm/pg-core';

export const user = pgTable('user', {
	id: serial('id').primaryKey(),
	age: integer('age')
});

export const rooms = pgTable('rooms', {
	id: serial('id').primaryKey(),
	number: integer('number').notNull(),
	capacity: integer('capacity'),
	status: boolean('status').default(true),
	createdAt: timestamp('created_at').defaultNow()
});

import { pgTable, serial, integer, text, pgEnum, boolean, timestamp, doublePrecision } from 'drizzle-orm/pg-core';
import { user } from './auth-schema';
import { rooms } from './rooms-schema';

export const courses = pgTable('courses', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	is_full: boolean('is_full').default(false).notNull(),
	hourly: text('hourly').notNull(),
	price: doublePrecision('price').notNull(),
	duration: integer('duration').notNull(),
	capacity: integer('capacity').notNull(),
	description: text('description').notNull(),
	teacherId: integer('teacher_id')
		.references(() => user.id, { onDelete: 'cascade' })
		.notNull(),
	roomId: integer('room_id')
		.references(() => rooms.id, { onDelete: 'cascade' })
		.notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});
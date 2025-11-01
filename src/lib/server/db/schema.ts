import { updated } from '$app/state';
import { pgTable, serial, integer, text, pgEnum,boolean, timestamp, doublePrecision, } from 'drizzle-orm/pg-core';

// Define a PostgreSQL enum type for user roles
export const Role = pgEnum('role', ['admin', 'user']);

// Define the 'user' table schema

export const user = pgTable('user', {
	id: serial('id').primaryKey(),
	username: text('username').notNull().unique(),
	password: text('password').notNull(),
	role: Role('role').default('user').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
	updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// define the sessions table schema

export const sessions = pgTable('sessions', {
	id: serial('id').primaryKey(),
	userId: integer('user_id')
		.references(() => user.id, { onDelete: 'cascade' })
		.notNull(),
	sessionToken: text('session_token').notNull().unique(),
	expiresAt: timestamp('expires_at').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Define the 'courses' table schema

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

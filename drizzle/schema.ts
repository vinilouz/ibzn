import { pgTable, text, integer, boolean, timestamp, varchar, unique, foreignKey, doublePrecision, interval, date, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const weekday = pgEnum("weekday", ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'])


export const rooms = pgTable("rooms", {
	id: text().default(nextval(\'rooms_id_seq\'::regclass)).primaryKey().notNull(),
	number: integer().notNull(),
	capacity: integer(),
	status: boolean().default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	name: varchar({ length: 255 }).notNull(),
	description: text(),
	imageUrl: varchar("image_url", { length: 500 }),
});

export const user = pgTable("user", {
	id: text().primaryKey().notNull(),
	name: text().notNull(),
	email: text().notNull(),
	emailVerified: boolean("email_verified").notNull(),
	image: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const courses = pgTable("courses", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "courses_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	courseName: text().notNull(),
	description: text(),
	price: doublePrecision().notNull(),
	capacity: integer().notNull(),
	isFull: boolean().default(false).notNull(),
	duration: integer().notNull(),
	hourly: interval(),
	weekdays: weekday(),
	dates: date(),
	startDate: date(),
	createdAt: timestamp({ mode: 'string' }).notNull(),
	updatedAt: timestamp({ mode: 'string' }).notNull(),
	teacher: text().notNull(),
	room: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teacher],
			foreignColumns: [user.id],
			name: "teacher"
		}),
	foreignKey({
			columns: [table.room],
			foreignColumns: [rooms.id],
			name: "room"
		}).onDelete("cascade"),
]);

export const account = pgTable("account", {
	id: text().primaryKey().notNull(),
	accountId: text("account_id").notNull(),
	providerId: text("provider_id").notNull(),
	userId: text("user_id").notNull(),
	accessToken: text("access_token"),
	refreshToken: text("refresh_token"),
	idToken: text("id_token"),
	accessTokenExpiresAt: timestamp("access_token_expires_at", { mode: 'string' }),
	refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { mode: 'string' }),
	scope: text(),
	password: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "account_user_id_user_id_fk"
		}).onDelete("cascade"),
]);

export const session = pgTable("session", {
	id: text().primaryKey().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	token: text().notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	ipAddress: text("ip_address"),
	userAgent: text("user_agent"),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "session_user_id_user_id_fk"
		}).onDelete("cascade"),
	unique("session_token_unique").on(table.token),
]);

export const verification = pgTable("verification", {
	id: text().primaryKey().notNull(),
	identifier: text().notNull(),
	value: text().notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }),
	updatedAt: timestamp("updated_at", { mode: 'string' }),
});

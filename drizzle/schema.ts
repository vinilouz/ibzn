import { pgTable, text, integer, boolean, timestamp, varchar, unique, foreignKey, doublePrecision, interval, date, pgEnum } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"

export const weekday = pgEnum("weekday", ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'])


export const rooms = pgTable("rooms", {
	id: text("id").default(sql`nextval('rooms_id_seq'::regclass)`).primaryKey().notNull(),
	number: integer("number").notNull(),
	capacity: integer("capacity"),
	status: boolean("status").default(true),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	name: varchar("name", { length: 255 }).notNull(),
	description: text("description"),
	imageUrl: varchar("image_url", { length: 500 }),
});

export const user = pgTable("user", {
	id: text("id").primaryKey().notNull(),
	name: text("name").notNull(),
	email: text("email").notNull(),
	emailVerified: boolean("email_verified").notNull(),
	image: text("image"),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	role: text("role").default('user').notNull(),
}, (table) => [
	unique("user_email_unique").on(table.email),
]);

export const courses = pgTable("courses", {
	id: integer("id").primaryKey().generatedAlwaysAsIdentity({ name: "courses_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	courseName: text("course_name").notNull(),
	description: text("description"),
	price: doublePrecision("price").notNull(),
	capacity: integer("capacity").notNull(),
	isFull: boolean("is_full").default(false).notNull(),
	duration: integer("duration").notNull(),
	hourly: interval("hourly"),
	weekdays: weekday("weekdays"),
	dates: date("dates"),
	startDate: date("start_date"),
	createdAt: timestamp("created_at", { mode: 'string' }).notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).notNull(),
	teacher: text("teacher").notNull(),
	room: text("room").notNull(),
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

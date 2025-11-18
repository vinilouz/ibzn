import { pgTable, serial, text, date, timestamp } from "drizzle-orm/pg-core";

export const facilitators = pgTable("facilitators", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	email: text(),
	phone: text().notNull(),
	role: text(),
	birthdate: date(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	joinedAt: timestamp("joined_at", { mode: 'string' }).defaultNow(),
	lastSessionAt: timestamp("last_session_at", { mode: 'string' }),
});
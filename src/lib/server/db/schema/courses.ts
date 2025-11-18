// src/lib/server/db/schema/courses.ts
import { pgTable, pgEnum, integer, text, doublePrecision, boolean, date, time, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { facilitators } from "./facilitators";
import { rooms } from "./rooms";

export const weekday = pgEnum("weekday", ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'])

export const courses = pgTable("courses", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "courses_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	courseName: text().notNull(),
	description: text(),
	price: doublePrecision().notNull(),
	capacity: integer().notNull(),
	isFull: boolean().default(false).notNull(),
	duration: integer().notNull(),
	weekdays: weekday(),
	startDate: date(),
	createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
	room: integer().notNull(),
	sessionsInfo: text(),
	startTime: time(),
	endTime: time(),
	teacher: integer().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.room],
			foreignColumns: [rooms.id],
			name: "room"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.teacher],
			foreignColumns: [facilitators.id],
			name: "teacher"
		}).onDelete("cascade"),
]);
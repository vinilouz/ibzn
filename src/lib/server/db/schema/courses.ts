import { pgTable, pgEnum,integer, text, doublePrecision, boolean, interval, date, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { user } from "./user";
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
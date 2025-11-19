import { pgTable, text, timestamp, time, boolean, foreignKey, integer } from "drizzle-orm/pg-core";
import { facilitators } from "./facilitators";
import { rooms } from "./rooms";
import { participants } from "./participants"

export const appointments = pgTable("appointments", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "appointments_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	name: text().notNull(),
	email: text(),
	phone: text(),
	reason: text(),
	dateTime: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	isSignedUp: boolean("IsSignedUp").default(false).notNull(),
	endTime: time(),
	facilitatorId: integer(),
	roomId: integer(),
	participantId: integer(),
	createdAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
	updatedAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
}, (table) => [
	foreignKey({
			columns: [table.facilitatorId],
			foreignColumns: [facilitators.id],
			name: "facilitatorId"
		}),
	foreignKey({
			columns: [table.roomId],
			foreignColumns: [rooms.id],
			name: "roomId"
		}),
	foreignKey({
			columns: [table.participantId],
			foreignColumns: [participants.id],
			name: "participantId"
		}),
]);


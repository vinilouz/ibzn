import { pgTable,integer, text, boolean, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { user } from "./user";
import { rooms } from "./rooms";


export const courses = pgTable("courses", {
	id: text('id').primaryKey(),
	courseName: text('courseName').notNull(),
	description: text('description'),
	price: integer('price').notNull(),
	pricePerMonth: boolean('pricePerMonth').notNull().default(false),
	pricePerSession: boolean('pricePerSession').notNull().default(false),
	capacity: integer('capacity').notNull(),
	erroledStudents: integer('enroledStudents').notNull().default(0),
	duration: integer('duration').notNull(),
	createdAt: timestamp('createdAt').notNull().defaultNow(),
	updatedAt: timestamp('updatedAt').notNull().$onUpdate(() => new Date()),
	teacher: text('teacher').notNull(),
	room: text('room').notNull(),
}, (table) => [
	foreignKey({
			columns: [table.teacher],
			foreignColumns: [user.id],
			name: "teacher"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.room],
			foreignColumns: [rooms.id],
			name: "room"
		}).onDelete("cascade"),
]);
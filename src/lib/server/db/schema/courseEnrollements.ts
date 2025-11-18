import { pgTable, integer, text, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { user } from "./user";
import { courses } from "./courses";


export const courseEnrollments = pgTable("course_enrollments", {
	id: integer().primaryKey().generatedAlwaysAsIdentity({ name: "course_enrollments_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 2147483647, cache: 1 }),
	courseId: integer("course_id").notNull(),
	enrolledAt: timestamp("enrolled_at", { mode: 'string' }).defaultNow().notNull(),
	userId: text("user_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [user.id],
			name: "course_enrollments_user_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.courseId],
			foreignColumns: [courses.id],
			name: "course_enrollments_course_id_fk"
		}).onDelete("cascade"),
]);
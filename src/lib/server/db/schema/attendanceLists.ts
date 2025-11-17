import { pgTable, integer, date, text, timestamp, foreignKey } from "drizzle-orm/pg-core";
import { courses } from "./courses";
import { user } from "./user";

export const attendanceLists = pgTable("attendance_lists", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    courseId: integer("course_id").notNull(),
    date: date("date").notNull(),
    notes: text("notes"),
    createdBy: text("created_by").notNull(),
    createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    foreignKey({
        columns: [table.courseId],
        foreignColumns: [courses.id],
        name: "attendance_lists_course_id_fkey"
    }),
    foreignKey({
        columns: [table.createdBy],
        foreignColumns: [user.id],
        name: "attendance_lists_created_by_fkey"
    })
]);

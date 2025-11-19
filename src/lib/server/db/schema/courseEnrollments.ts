import { pgTable, integer, text, timestamp, foreignKey, pgEnum, doublePrecision } from "drizzle-orm/pg-core";
import { participants } from "./participants";
import { courses } from "./courses";

export const enrollmentStatus = pgEnum("enrollment_status", ['active', 'cancelled', 'completed', 'pending']);

export const courseEnrollments = pgTable("course_enrollments", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    participantId: integer("participant_id").notNull(),
    courseId: integer("course_id").notNull(),
    status: enrollmentStatus("status").default('active').notNull(),
    amount: doublePrecision("amount").notNull(),
    enrolledAt: timestamp("enrolled_at", { mode: 'string' }).defaultNow().notNull(),
    cancelledAt: timestamp("cancelled_at", { mode: 'string' }),
    notes: text("notes"),
}, (table) => [
    foreignKey({
        columns: [table.participantId],
        foreignColumns: [participants.id],
        name: "course_enrollments_participant_id_fk"
    }).onDelete("cascade"),
    foreignKey({
        columns: [table.courseId],
        foreignColumns: [courses.id],
        name: "course_enrollments_course_id_fk"
    }).onDelete("cascade"),
]);
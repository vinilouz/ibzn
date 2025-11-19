import { pgTable, integer, text, timestamp, doublePrecision, foreignKey, pgEnum } from "drizzle-orm/pg-core";
import { courses } from "./courses";
import { participants } from "./participants";

// Status da matrícula
export const enrollmentStatusEnum = pgEnum("enrollment_status", [
    'active',     // Ativo
    'completed',  // Concluído
    'cancelled',  // Cancelado
    'dropped'     // Desistente
]);

export const courseEnrollments = pgTable("course_enrollments", {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    participantId: integer("participant_id").notNull(),
    courseId: integer("course_id").notNull(),
    enrolledAt: timestamp("enrolled_at", { mode: 'string' }).defaultNow().notNull(),
    status: enrollmentStatusEnum("status").default('active').notNull(),
    amount: doublePrecision("amount").notNull(),
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
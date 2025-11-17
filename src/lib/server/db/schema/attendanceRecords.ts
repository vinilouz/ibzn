import { pgTable, integer, text, timestamp, pgEnum, foreignKey } from "drizzle-orm/pg-core";
import { attendanceLists } from "./attendanceLists";
import { user } from "./user";

// Status de presença
export const attendanceStatusEnum = pgEnum("attendance_status", [
    'present',   // Presente
    'absent',    // Ausente
    'late',      // Atrasado
    'excused'    // Justificado
]);

export const attendanceRecords = pgTable("attendance_records", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    listId: integer("list_id").notNull(),
    studentId: text("student_id").notNull(),
    status: attendanceStatusEnum("status").default('present').notNull(),
    notes: text("notes"),
    markedAt: timestamp("marked_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
    foreignKey({
        columns: [table.listId],
        foreignColumns: [attendanceLists.id],
        name: "attendance_records_list_id_fkey"
    }).onDelete("cascade"),
    foreignKey({
        columns: [table.studentId],
        foreignColumns: [user.id],
        name: "attendance_records_student_id_fkey"
    })
]);

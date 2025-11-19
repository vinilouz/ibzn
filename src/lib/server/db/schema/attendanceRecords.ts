import { pgTable, integer, timestamp, pgEnum, foreignKey } from "drizzle-orm/pg-core";
import { attendanceLists } from "./attendanceLists";
import { participants } from "./participants";
import { text } from "drizzle-orm/pg-core";

export const attendanceStatusEnum = pgEnum("attendance_status", [
    'present',
    'absent',
    'late',
    'excused'
]);

export const attendanceRecords = pgTable("attendance_records", {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    listId: integer("list_id").notNull(),
    participantId: integer("participant_id").notNull(),
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
        columns: [table.participantId],
        foreignColumns: [participants.id],
        name: "attendance_records_participant_id_fkey"
    })
]);

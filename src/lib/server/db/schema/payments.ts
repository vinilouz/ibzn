import { pgTable, serial, text, integer, doublePrecision, pgEnum, foreignKey } from "drizzle-orm/pg-core";
import { user } from "./user";
import { courses } from "./courses";
import { participants } from "./participants";

export const paymentStatusEnum = pgEnum("payment_status", [
    'pending',
    'paid',
    'cancelled',
    'refunded'
]);

export const paymentMethodEnum = pgEnum("payment_method", [
    'pix',
    'credit_card',
    'debit_card',
    'bank_transfer',
    'boleto',
    'cash'
]);

export const payments = pgTable("payments", {
    id: serial("id").primaryKey(),

    // Relacionamentos
    userId: text("user_id"),
    participantId: integer("participant_id"),
    courseId: integer("course_id").notNull(),
    enrollmentId: integer("enrollment_id"),

    // Valores
    amount: doublePrecision("amount").notNull(), // Valor do curso
    discount: doublePrecision("discount").default(0), // Desconto aplicado
    finalAmount: doublePrecision("final_amount").notNull(),

    status: paymentStatusEnum("status").default('pending').notNull(),
    paymentMethod: paymentMethodEnum("payment_method"),

    transactionId: text("transaction_id"),
    paymentProof: text("payment_proof"),
    notes: text("notes"),

    createdAt: text("created_at").notNull(),
    updatedAt: text("updated_at").notNull(),
    paidAt: text("paid_at"),
    cancelledAt: text("cancelled_at"),
}, (table) => [
    foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "payments_user_id_fk"
    }).onDelete("cascade"),
    foreignKey({
        columns: [table.participantId],
        foreignColumns: [participants.id],
        name: "payments_participant_id_fk"
    }).onDelete("cascade"),
    foreignKey({
        columns: [table.courseId],
        foreignColumns: [courses.id],
        name: "payments_course_id_fk"
    }).onDelete("cascade"),
]);

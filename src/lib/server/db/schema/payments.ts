import { pgTable, serial, text, integer, doublePrecision, timestamp, pgEnum, foreignKey } from "drizzle-orm/pg-core";
import { user } from "./user";
import { courses } from "./courses";
import { courseEnrollments } from "./courseEnrollments";

// Status do pagamento
export const paymentStatusEnum = pgEnum("payment_status", [
    'pending',    // Aguardando pagamento
    'paid',       // Pago
    'cancelled',  // Cancelado
    'refunded'    // Reembolsado
]);

// Método de pagamento
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
    userId: text("user_id").notNull(),
    courseId: integer("course_id").notNull(),
    enrollmentId: integer("enrollment_id"),

    // Valores
    amount: doublePrecision("amount").notNull(), // Valor do curso
    discount: doublePrecision("discount").default(0), // Desconto aplicado
    finalAmount: doublePrecision("final_amount").notNull(), // Valor final = amount - discount

    // Status e método
    status: paymentStatusEnum("status").default('pending').notNull(),
    paymentMethod: paymentMethodEnum("payment_method"),

    // Informações adicionais
    transactionId: text("transaction_id"), // ID da transação (ex: do gateway de pagamento)
    paymentProof: text("payment_proof"), // URL do comprovante (se houver)
    notes: text("notes"), // Observações

    // Datas
    createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
    paidAt: timestamp("paid_at", { mode: 'string' }), // Quando foi pago
    cancelledAt: timestamp("cancelled_at", { mode: 'string' }), // Quando foi cancelado
}, (table) => [
    foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "payments_user_id_fk"
    }).onDelete("cascade"),
    foreignKey({
        columns: [table.courseId],
        foreignColumns: [courses.id],
        name: "payments_course_id_fk"
    }).onDelete("cascade"),
]);

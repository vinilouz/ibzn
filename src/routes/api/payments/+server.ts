import { db } from '$lib/server/db';
import { payments, courses, participants } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/middleware/auth';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * POST - Criar um novo pagamento
 * Usado quando um participante se inscreve em um curso
 */
export async function POST(event: RequestEvent) {
    const user = await requireAuth(event);

    const { courseId, participantId, paymentMethod, discount = 0 } = await event.request.json();

    if (!participantId) {
        return json({ error: 'ID do participante é obrigatório.' }, { status: 400 });
    }

    // Buscar informações do curso
    const [course] = await db.select().from(courses).where(eq(courses.id, courseId));

    if (!course) {
        return json({ error: 'Curso não encontrado.' }, { status: 404 });
    }

    // Verificar se já existe um pagamento pendente para este participante/curso
    const [existingPayment] = await db
        .select()
        .from(payments)
        .where(
            and(
                eq(payments.participantId, participantId),
                eq(payments.courseId, courseId),
                eq(payments.status, 'pending')
            )
        );

    if (existingPayment) {
        return json({
            error: 'Já existe um pagamento pendente para este curso.',
            paymentId: existingPayment.id
        }, { status: 400 });
    }

    // Calcular valor final
    const amount = course.price;
    const finalAmount = amount - discount;

    if (finalAmount < 0) {
        return json({ error: 'Desconto inválido.' }, { status: 400 });
    }

    // Criar pagamento
    const now = new Date().toISOString();
    const [payment] = await db
        .insert(payments)
        .values({
            participantId: participantId,
            courseId: courseId,
            amount,
            discount,
            finalAmount,
            status: 'pending',
            paymentMethod: paymentMethod || null,
            createdAt: now,
            updatedAt: now
        })
        .returning();

    return json({
        success: true,
        payment: {
            id: payment.id,
            amount: payment.amount,
            discount: payment.discount,
            finalAmount: payment.finalAmount,
            status: payment.status,
            courseName: course.courseName
        }
    });
}

/**
 * GET - Listar todos os pagamentos com informações dos participantes
 */
export async function GET(event: RequestEvent) {
    await requireAuth(event);

    const allPayments = await db
        .select({
            id: payments.id,
            participantId: payments.participantId,
            participantName: participants.name,
            participantPhone: participants.phone,
            courseId: payments.courseId,
            courseName: courses.courseName,
            amount: payments.amount,
            discount: payments.discount,
            finalAmount: payments.finalAmount,
            status: payments.status,
            paymentMethod: payments.paymentMethod,
            createdAt: payments.createdAt,
            paidAt: payments.paidAt
        })
        .from(payments)
        .leftJoin(courses, eq(payments.courseId, courses.id))
        .leftJoin(participants, eq(payments.participantId, participants.id))
        .orderBy(payments.createdAt);

    return json({ payments: allPayments });
}

import { db } from '$lib/server/db';
import { payments } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { json, error } from '@sveltejs/kit';
import { requireAuth } from '$lib/server/middleware/auth';
import type { RequestEvent } from '@sveltejs/kit';

/**
 * PATCH - Atualizar status do pagamento
 * Usado para confirmar pagamento, cancelar, etc
 */
export async function PATCH(event: RequestEvent) {
    await requireAuth(event);
    const paymentId = parseInt(event.params.id!);

    const { status, transactionId, paymentProof, notes } = await event.request.json();

    // Buscar pagamento
    const [payment] = await db
        .select()
        .from(payments)
        .where(eq(payments.id, paymentId));

    if (!payment) {
        throw error(404, 'Pagamento não encontrado.');
    }

    const updateData: any = {
        updatedAt: new Date().toISOString()
    };

    if (status) {
        updateData.status = status;

        // Se foi pago, adicionar data de pagamento
        if (status === 'paid') {
            updateData.paidAt = new Date().toISOString();
        }

        // Se foi cancelado, adicionar data de cancelamento
        if (status === 'cancelled') {
            updateData.cancelledAt = new Date().toISOString();
        }
    }

    if (transactionId) updateData.transactionId = transactionId;
    if (paymentProof) updateData.paymentProof = paymentProof;
    if (notes) updateData.notes = notes;

    // Atualizar pagamento
    const [updatedPayment] = await db
        .update(payments)
        .set(updateData)
        .where(eq(payments.id, paymentId))
        .returning();

    return json({
        success: true,
        payment: updatedPayment
    });
}

/**
 * GET - Buscar detalhes de um pagamento
 */
export async function GET(event: RequestEvent) {
    await requireAuth(event);
    const paymentId = parseInt(event.params.id!);

    const [payment] = await db
        .select()
        .from(payments)
        .where(eq(payments.id, paymentId));

    if (!payment) {
        throw error(404, 'Pagamento não encontrado.');
    }

    return json({ payment });
}

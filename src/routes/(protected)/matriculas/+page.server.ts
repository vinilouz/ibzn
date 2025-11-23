import type { Actions } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { courseEnrollments, courses, participants, payments } from '$lib/server/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { logger } from '$lib/utils/logger';
import { requireAuth } from '$lib/server/middleware/auth';
import { cache } from '$lib/server/cache';

export const load = async () => {
	try {
		const [enrollments, allCourses, allParticipants] = await Promise.all([
			db
				.select({
					id: courseEnrollments.id,
					participantId: courseEnrollments.participantId,
					courseId: courseEnrollments.courseId,
					status: courseEnrollments.status,
					amount: courseEnrollments.amount,
					enrolledAt: courseEnrollments.enrolledAt,
					cancelledAt: courseEnrollments.cancelledAt,
					notes: courseEnrollments.notes,
					courseName: courses.courseName,
					participantName: participants.name,
					participantPhone: participants.phone
				})
				.from(courseEnrollments)
				.leftJoin(courses, eq(courseEnrollments.courseId, courses.id))
				.leftJoin(participants, eq(courseEnrollments.participantId, participants.id))
				.orderBy(desc(courseEnrollments.enrolledAt)),

			db.select({
				id: courses.id,
				courseName: courses.courseName,
				price: courses.price
			}).from(courses),

			db.select({
				id: participants.id,
				name: participants.name,
				phone: participants.phone
			}).from(participants)
		]);

		return {
			enrollments,
			courses: allCourses,
			participants: allParticipants
		};
	} catch (error) {
		logger.error('Erro ao carregar matrículas:', error);
		return { enrollments: [], courses: [], participants: [] };
	}
};

export const actions: Actions = {
	create: async (event: any) => {
		try {
			const authUser = await requireAuth(event);
			if (!authUser?.id) {
				return fail(401, { error: 'Não autorizado' });
			}

			const formData = await event.request.formData();
			const participantId = parseInt(formData.get('participantId') as string);
			const courseId = parseInt(formData.get('courseId') as string);
			const amount = parseFloat(formData.get('amount') as string);
			const notes = formData.get('notes') as string;

			// Verificar se já existe matrícula ativa para este participante/curso
			const existingEnrollment = await db
				.select()
				.from(courseEnrollments)
				.where(
					and(
						eq(courseEnrollments.participantId, participantId),
						eq(courseEnrollments.courseId, courseId),
						eq(courseEnrollments.status, 'active')
					)
				)
				.limit(1);

			if (existingEnrollment.length > 0) {
				return fail(400, { error: 'Este participante já está matriculado neste curso' });
			}

			// Verificar se já existe pagamento pendente para este participante/curso
			const existingPayment = await db
				.select()
				.from(payments)
				.where(
					and(
						eq(payments.participantId, participantId),
						eq(payments.courseId, courseId),
						eq(payments.status, 'pending')
					)
				)
				.limit(1);

			// Criar matrícula
			const [newEnrollment] = await db.insert(courseEnrollments).values({
				participantId,
				courseId,
				status: 'active',
				amount,
				notes: notes || null
			}).returning();

			// Criar pagamento pendente se não existir
			if (existingPayment.length === 0) {
				await db.insert(payments).values({
					participantId,
					courseId,
					amount,
					discount: 0,
					finalAmount: amount,
					status: 'pending',
					paymentMethod: null,
					notes: `Pagamento criado automaticamente pela matrícula #${newEnrollment.id}`,
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				});
			}

			cache.invalidatePattern('enrollments');
			cache.invalidatePattern('payments');
			cache.invalidate('painel:stats');
			cache.invalidate('financeiro:dashboard');
			return { success: true };
		} catch (error) {
			logger.error('Erro ao criar matrícula:', error);
			return fail(500, { error: 'Erro ao criar matrícula' });
		}
	},

	updateStatus: async (event: any) => {
		try {
			const authUser = await requireAuth(event);
			if (!authUser?.id) {
				return fail(401, { error: 'Não autorizado' });
			}

			const formData = await event.request.formData();
			const id = parseInt(formData.get('id') as string);
			const status = formData.get('status') as 'active' | 'cancelled' | 'completed' | 'pending';

			logger.info(`Atualizando matrícula ${id} para status: ${status}`);

			// Buscar dados da matrícula
			const enrollment = await db
				.select()
				.from(courseEnrollments)
				.where(eq(courseEnrollments.id, id))
				.limit(1);

			if (enrollment.length === 0) {
				return fail(404, { error: 'Matrícula não encontrada' });
			}

			const { participantId, courseId } = enrollment[0];

			const updateData: any = { status };

			if (status === 'cancelled') {
				updateData.cancelledAt = new Date().toISOString();

				// Cancelar pagamento pendente relacionado
				await db.update(payments)
					.set({
						status: 'cancelled',
						cancelledAt: new Date().toISOString(),
						updatedAt: new Date().toISOString()
					})
					.where(
						and(
							eq(payments.participantId, participantId),
							eq(payments.courseId, courseId),
							eq(payments.status, 'pending')
						)
					);
			}

			const result = await db.update(courseEnrollments)
				.set(updateData)
				.where(eq(courseEnrollments.id, id))
				.returning();

			logger.info(`Status atualizado com sucesso:`, result);

			cache.invalidatePattern('enrollments');
			cache.invalidatePattern('payments');
			cache.invalidate('painel:stats');
			cache.invalidate('financeiro:dashboard');
			return { success: true };
		} catch (error) {
			logger.error('Erro ao atualizar status:', error);
			return fail(500, { error: 'Erro ao atualizar status' });
		}
	},

	update: async (event: any) => {
		try {
			const authUser = await requireAuth(event);
			if (!authUser?.id) {
				return fail(401, { error: 'Não autorizado' });
			}

			const formData = await event.request.formData();
			const id = parseInt(formData.get('id') as string);
			const participantId = parseInt(formData.get('participantId') as string);
			const courseId = parseInt(formData.get('courseId') as string);
			const amount = parseFloat(formData.get('amount') as string);
			const status = formData.get('status') as 'active' | 'cancelled' | 'completed' | 'pending';
			const notes = formData.get('notes') as string;

			const updateData: any = {
				participantId,
				courseId,
				amount,
				notes: notes || null
			};

			if (status) {
				updateData.status = status;
				if (status === 'cancelled') {
					updateData.cancelledAt = new Date().toISOString();
				}
			}

			await db.update(courseEnrollments)
				.set(updateData)
				.where(eq(courseEnrollments.id, id));

			logger.info(`Matrícula ${id} atualizada com sucesso`);

			cache.invalidatePattern('enrollments');
			cache.invalidate('painel:stats');
			return { success: true };
		} catch (error) {
			logger.error('Erro ao atualizar matrícula:', error);
			return fail(500, { error: 'Erro ao atualizar matrícula' });
		}
	},

	delete: async (event: any) => {
		try {
			const authUser = await requireAuth(event);
			if (!authUser?.id) {
				return fail(401, { error: 'Não autorizado' });
			}

			const formData = await event.request.formData();
			const idRaw = formData.get('id');

			const id = parseInt(idRaw as string);

			if (isNaN(id)) {
				return fail(400, { error: 'ID inválido' });
			}

			// Buscar dados da matrícula antes de deletar
			const enrollment = await db
				.select()
				.from(courseEnrollments)
				.where(eq(courseEnrollments.id, id))
				.limit(1);

			if (enrollment.length > 0) {
				const { participantId, courseId } = enrollment[0];

				// Cancelar pagamento pendente relacionado
				await db.update(payments)
					.set({
						status: 'cancelled',
						cancelledAt: new Date().toISOString(),
						updatedAt: new Date().toISOString()
					})
					.where(
						and(
							eq(payments.participantId, participantId),
							eq(payments.courseId, courseId),
							eq(payments.status, 'pending')
						)
					);
			}

			await db.delete(courseEnrollments).where(eq(courseEnrollments.id, id));

			cache.invalidatePattern('enrollments');
			cache.invalidatePattern('payments');
			cache.invalidate('painel:stats');
			cache.invalidate('financeiro:dashboard');

			return { success: true };
		} catch (error) {
			logger.error('Erro ao deletar matrícula:', error);
			return fail(500, { error: 'Erro ao deletar matrícula' });
		}
	}
};

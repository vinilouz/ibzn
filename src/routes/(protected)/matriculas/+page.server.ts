import type { Actions } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { courseEnrollments, courses, participants } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
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

			await db.insert(courseEnrollments).values({
				participantId,
				courseId,
				status: 'active',
				amount,
				notes: notes || null
			});

			cache.invalidatePattern('enrollments');
			cache.invalidate('painel:stats');
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

			const updateData: any = { status };
			
			if (status === 'cancelled') {
				updateData.cancelledAt = new Date().toISOString();
			}

			const result = await db.update(courseEnrollments)
				.set(updateData)
				.where(eq(courseEnrollments.id, id))
				.returning();

			logger.info(`Status atualizado com sucesso:`, result);

			cache.invalidatePattern('enrollments');
			cache.invalidate('painel:stats');
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

			await db.delete(courseEnrollments).where(eq(courseEnrollments.id, id));

			cache.invalidatePattern('enrollments');
			cache.invalidate('painel:stats');
			
			return { success: true };
		} catch (error) {
			logger.error('Erro ao deletar matrícula:', error);
			return fail(500, { error: 'Erro ao deletar matrícula' });
		}
	}
};

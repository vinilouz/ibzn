import { requireAuth } from '$lib/server/middleware/auth';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { rooms, participants, facilitators, courses, courseEnrollments, events, payments } from '$lib/server/db/schema';
import { count, eq, sql } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	const user = await requireAuth(event);

	const allRooms = await db.select().from(rooms);
	const allEvents = await db.select().from(events);

	const [participantCount] = await db.select({ count: count() }).from(participants);
	const [facilitatorCount] = await db.select({ count: count() }).from(facilitators);
	const [roomCount] = await db.select({ count: count() }).from(rooms);
	const [courseCount] = await db.select({ count: count() }).from(courses);

	// Buscar pagamentos pagos e pendentes (quantidade)
	const [paidPayments] = await db
		.select({ count: count() })
		.from(payments)
		.where(eq(payments.status, 'paid'));
	const [pendingPayments] = await db
		.select({ count: count() })
		.from(payments)
		.where(eq(payments.status, 'pending'));

	// Buscar valores totais pagos e pendentes
	const [paidTotal] = await db
		.select({ total: sql<number>`cast(coalesce(sum(${payments.finalAmount}), 0) as float)` })
		.from(payments)
		.where(eq(payments.status, 'paid'));
	const [pendingTotal] = await db
		.select({ total: sql<number>`cast(coalesce(sum(${payments.finalAmount}), 0) as float)` })
		.from(payments)
		.where(eq(payments.status, 'pending'));

	// Buscar matrículas por status
	const [activeEnrollments] = await db
		.select({ count: count() })
		.from(courseEnrollments)
		.where(eq(courseEnrollments.status, 'active'));
	const [completedEnrollments] = await db
		.select({ count: count() })
		.from(courseEnrollments)
		.where(eq(courseEnrollments.status, 'completed'));
	const [cancelledEnrollments] = await db
		.select({ count: count() })
		.from(courseEnrollments)
		.where(eq(courseEnrollments.status, 'cancelled'));
	const [droppedEnrollments] = await db
		.select({ count: count() })
		.from(courseEnrollments)
		.where(eq(courseEnrollments.status, 'dropped'));
	const [pendingEnrollments] = await db
		.select({ count: count() })
		.from(courseEnrollments)
		.where(eq(courseEnrollments.status, 'pending'));

	// Buscar cursos com informações do facilitador e contagem de participantes
	const coursesWithDetails = await db
		.select({
			id: courses.id,
			courseName: courses.courseName,
			description: courses.description,
			weekdays: courses.weekdays,
			startDate: courses.startDate,
			startTime: courses.startTime,
			endTime: courses.endTime,
			capacity: courses.capacity,
			facilitatorName: facilitators.name,
			participantCount: sql<number>`cast(count(distinct ${courseEnrollments.participantId}) as integer)`
		})
		.from(courses)
		.leftJoin(facilitators, eq(courses.teacher, facilitators.id))
		.leftJoin(courseEnrollments, eq(courses.id, courseEnrollments.courseId))
		.groupBy(courses.id, facilitators.name);

	return {
		user,
		rooms: allRooms,
		courses: coursesWithDetails,
		events: allEvents,
		totalParticipants: participantCount?.count || 0,
		totalFacilitators: facilitatorCount?.count || 0,
		totalRooms: roomCount?.count || 0,
		totalCourses: courseCount?.count || 0,
		paidPayments: paidPayments?.count || 0,
		pendingPayments: pendingPayments?.count || 0,
		paidTotal: paidTotal?.total || 0,
		pendingTotal: pendingTotal?.total || 0,
		activeEnrollments: activeEnrollments?.count || 0,
		completedEnrollments: completedEnrollments?.count || 0,
		cancelledEnrollments: cancelledEnrollments?.count || 0,
		droppedEnrollments: droppedEnrollments?.count || 0,
		pendingEnrollments: pendingEnrollments?.count || 0
	};
};

export const actions: Actions = {
	createEvent: async ({ request }) => {
		const formData = await request.formData();
		const nome = formData.get('nome') as string;
		const descricao = formData.get('descricao') as string;
		const start = formData.get('start') as string;
		const end = formData.get('end') as string;

		if (!nome || !start) {
			return fail(400, { error: 'Nome e data de início são obrigatórios' });
		}

		try {
			await db.insert(events).values({
				nome,
				descricao: descricao || null,
				start,
				end: end || null,
				createdAt: new Date().toISOString()
			});

			return { success: true };
		} catch (error) {
			console.error('Erro ao criar evento:', error);
			return fail(500, { error: 'Erro ao criar evento' });
		}
	},

	updateEvent: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;
		const nome = formData.get('nome') as string;
		const descricao = formData.get('descricao') as string;
		const start = formData.get('start') as string;
		const end = formData.get('end') as string;

		if (!id || !nome || !start) {
			return fail(400, { error: 'ID, nome e data de início são obrigatórios' });
		}

		try {
			await db.update(events)
				.set({
					nome,
					descricao: descricao || null,
					start,
					end: end || null
				})
				.where(eq(events.id, parseInt(id)));

			return { success: true };
		} catch (error) {
			console.error('Erro ao atualizar evento:', error);
			return fail(500, { error: 'Erro ao atualizar evento' });
		}
	},

	deleteEvent: async ({ request }) => {
		const formData = await request.formData();
		const id = formData.get('id') as string;

		if (!id) {
			return fail(400, { error: 'ID do evento é obrigatório' });
		}

		try {
			await db.delete(events).where(eq(events.id, parseInt(id)));
			return { success: true };
		} catch (error) {
			console.error('Erro ao deletar evento:', error);
			return fail(500, { error: 'Erro ao deletar evento' });
		}
	}
};
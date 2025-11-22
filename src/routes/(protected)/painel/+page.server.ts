import { requireAuth } from '$lib/server/middleware/auth';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { rooms, participants, facilitators, courses, courseEnrollments, events, payments } from '$lib/server/db/schema';
import { count, eq, sql } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async (event) => {
	const user = await requireAuth(event);

	const [allRooms, allEvents, statsResult] = await Promise.all([
		db.select().from(rooms),
		db.select().from(events),
		Promise.all([
			db.select({
				participantCount: count(),
				facilitatorCount: sql<number>`(SELECT COUNT(*) FROM ${facilitators})`,
				roomCount: sql<number>`(SELECT COUNT(*) FROM ${rooms})`,
				courseCount: sql<number>`(SELECT COUNT(*) FROM ${courses})`
			}).from(participants),

			db.select({
				paidPayments: sql<number>`COUNT(*) FILTER (WHERE ${payments.status} = 'paid')`,
				pendingPayments: sql<number>`COUNT(*) FILTER (WHERE ${payments.status} = 'pending')`,
				paidTotal: sql<number>`COALESCE(SUM(${payments.finalAmount}) FILTER (WHERE ${payments.status} = 'paid'), 0)`,
				pendingTotal: sql<number>`COALESCE(SUM(${payments.finalAmount}) FILTER (WHERE ${payments.status} = 'pending'), 0)`
			}).from(payments),

			db.select({
				activeEnrollments: sql<number>`COUNT(*) FILTER (WHERE ${courseEnrollments.status} = 'active')`,
				completedEnrollments: sql<number>`COUNT(*) FILTER (WHERE ${courseEnrollments.status} = 'completed')`,
				cancelledEnrollments: sql<number>`COUNT(*) FILTER (WHERE ${courseEnrollments.status} = 'cancelled')`,
				droppedEnrollments: sql<number>`COUNT(*) FILTER (WHERE ${courseEnrollments.status} = 'dropped')`,
				pendingEnrollments: sql<number>`COUNT(*) FILTER (WHERE ${courseEnrollments.status} = 'pending')`
			}).from(courseEnrollments)
		])
	]);

	const [basicCounts, paymentStats, enrollmentStats] = statsResult;
	const stats = {
		...basicCounts[0],
		...paymentStats[0],
		...enrollmentStats[0]
	};
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
		totalParticipants: Number(stats.participantCount) || 0,
		totalFacilitators: Number(stats.facilitatorCount) || 0,
		totalRooms: Number(stats.roomCount) || 0,
		totalCourses: Number(stats.courseCount) || 0,
		paidPayments: Number(stats.paidPayments) || 0,
		pendingPayments: Number(stats.pendingPayments) || 0,
		paidTotal: Number(stats.paidTotal) || 0,
		pendingTotal: Number(stats.pendingTotal) || 0,
		activeEnrollments: Number(stats.activeEnrollments) || 0,
		completedEnrollments: Number(stats.completedEnrollments) || 0,
		cancelledEnrollments: Number(stats.cancelledEnrollments) || 0,
		droppedEnrollments: Number(stats.droppedEnrollments) || 0,
		pendingEnrollments: Number(stats.pendingEnrollments) || 0
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
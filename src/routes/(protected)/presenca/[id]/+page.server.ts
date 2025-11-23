import type { Actions } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { attendanceLists, attendanceRecords, courses, participants, courseEnrollments } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { fail, error } from '@sveltejs/kit';
import { logger } from '$lib/utils/logger';
import { requireAuth } from '$lib/server/middleware/auth';

export const load = async ({ params }: any) => {
	try {
		const courseId = parseInt(params.id);

		// Executar todas as queries em paralelo para melhor performance
		const [courseResult, enrolledStudents, attendanceListsForCourse, allRecords] = await Promise.all([
			db.select({
				id: courses.id,
				courseName: courses.courseName,
				description: courses.description,
				startDate: courses.startDate
			})
			.from(courses)
			.where(eq(courses.id, courseId)),

			db.select({
				participantId: courseEnrollments.participantId,
				participantName: participants.name,
				participantPhone: participants.phone,
				enrollmentStatus: courseEnrollments.status
			})
			.from(courseEnrollments)
			.innerJoin(participants, eq(courseEnrollments.participantId, participants.id))
			.where(
				and(
					eq(courseEnrollments.courseId, courseId),
					eq(courseEnrollments.status, 'active')
				)
			),

			db.select({
				id: attendanceLists.id,
				date: attendanceLists.date,
				notes: attendanceLists.notes,
				createdAt: attendanceLists.createdAt
			})
			.from(attendanceLists)
			.where(eq(attendanceLists.courseId, courseId))
			.orderBy(attendanceLists.date),

			db.select({
				listId: attendanceRecords.listId,
				participantId: attendanceRecords.participantId,
				status: attendanceRecords.status,
				notes: attendanceRecords.notes,
				markedAt: attendanceRecords.markedAt
			})
			.from(attendanceRecords)
			.innerJoin(attendanceLists, eq(attendanceRecords.listId, attendanceLists.id))
			.where(eq(attendanceLists.courseId, courseId))
		]);

		const course = courseResult[0];
		if (!course) {
			throw error(404, 'Curso não encontrado');
		}

		// Calculate attendance stats for each student
		const studentsWithStats = enrolledStudents.map((student) => {
			const studentRecords = allRecords.filter(r => r.participantId === student.participantId);
			const totalClasses = attendanceListsForCourse.length;
			const present = studentRecords.filter(r => r.status === 'present').length;
			const late = studentRecords.filter(r => r.status === 'late').length;
			const absent = studentRecords.filter(r => r.status === 'absent').length;
			const excused = studentRecords.filter(r => r.status === 'excused').length;
			const attendanceRate = totalClasses > 0 ? ((present + late) / totalClasses * 100).toFixed(1) : '0.0';

			return {
				...student,
				stats: {
					totalClasses,
					present,
					late,
					absent,
					excused,
					attendanceRate
				},
				attendance: studentRecords,
				records: studentRecords
			};
		});

		return { 
			course, 
			students: studentsWithStats,
			attendanceLists: attendanceListsForCourse
		};
	} catch (err) {
		logger.error('Erro ao carregar frequência do curso:', err);
		throw error(500, 'Erro ao carregar frequência do curso');
	}
};

export const actions: Actions = {
	createAttendanceList: async (event: any) => {
		try {
			const authUser = await requireAuth(event);
			if (!authUser?.id) {
				return fail(401, { error: 'Não autorizado' });
			}

			const formData = await event.request.formData();
			const courseId = parseInt(formData.get('courseId') as string);
			const dateRaw = formData.get('date') as string;
			const notes = formData.get('notes') as string;

			// Corrigir timezone: adicionar horário meio-dia para evitar mudança de dia
			const date = `${dateRaw}T12:00:00`;

			// Create attendance list
			const [newList] = await db.insert(attendanceLists)
				.values({
					courseId,
					date,
					notes: notes || null,
					createdBy: authUser.id
				})
				.returning();

			// Get all active enrollments for this course
			const enrollments = await db
				.select({ participantId: courseEnrollments.participantId })
				.from(courseEnrollments)
				.where(
					and(
						eq(courseEnrollments.courseId, courseId),
						eq(courseEnrollments.status, 'active')
					)
				);

			// Create attendance records for each enrolled student
			if (enrollments.length > 0) {
				await db.insert(attendanceRecords).values(
					enrollments.map((enrollment) => ({
						listId: newList.id,
						participantId: enrollment.participantId,
						status: 'absent' as const, // Default to absent
						notes: null,
						markedAt: new Date().toISOString()
					}))
				);
			}

			logger.info(`Lista de presença criada: ${newList.id} com ${enrollments.length} alunos`);
			return { success: true };
		} catch (error) {
			logger.error('Erro ao criar lista de presença:', error);
			return fail(500, { error: 'Erro ao criar lista de presença' });
		}
	},

	updateAttendance: async (event: any) => {
		try {
			const authUser = await requireAuth(event);
			if (!authUser?.id) {
				return fail(401, { error: 'Não autorizado' });
			}

			const formData = await event.request.formData();
			const recordId = parseInt(formData.get('recordId') as string);
			const status = formData.get('status') as 'present' | 'absent' | 'late' | 'excused';
			const notes = formData.get('notes') as string;

			await db.update(attendanceRecords)
				.set({ 
					status,
					notes: notes || null,
					markedAt: new Date().toISOString()
				})
				.where(eq(attendanceRecords.id, recordId));

			logger.info(`Presença atualizada: record ${recordId} -> ${status}`);
			return { success: true };
		} catch (error) {
			logger.error('Erro ao atualizar presença:', error);
			return fail(500, { error: 'Erro ao atualizar presença' });
		}
	},

	markAttendanceForDate: async (event: any) => {
		try {
			const authUser = await requireAuth(event);
			if (!authUser?.id) {
				return fail(401, { error: 'Não autorizado' });
			}

			const formData = await event.request.formData();
			const listId = parseInt(formData.get('listId') as string);
			const participantId = parseInt(formData.get('participantId') as string);
			const status = formData.get('status') as 'present' | 'absent' | 'late' | 'excused';

			// Check if record exists
			const existingRecords = await db
				.select({ id: attendanceRecords.id })
				.from(attendanceRecords)
				.where(
					and(
						eq(attendanceRecords.listId, listId),
						eq(attendanceRecords.participantId, participantId)
					)
				);

			if (existingRecords.length > 0) {
				// Update existing record
				await db.update(attendanceRecords)
					.set({ 
						status,
						markedAt: new Date().toISOString()
					})
					.where(eq(attendanceRecords.id, existingRecords[0].id));
			} else {
				// Create new record
				await db.insert(attendanceRecords).values({
					listId,
					participantId,
					status,
					notes: null,
					markedAt: new Date().toISOString()
				});
			}

			logger.info(`Presença marcada: participante ${participantId}, lista ${listId} -> ${status}`);
			return { success: true };
		} catch (error) {
			logger.error('Erro ao marcar presença:', error);
			return fail(500, { error: 'Erro ao marcar presença' });
		}
	}
};

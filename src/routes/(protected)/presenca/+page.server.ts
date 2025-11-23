import { db } from '$lib/server/db';
import { courses, courseEnrollments } from '$lib/server/db/schema';
import { eq, count, and } from 'drizzle-orm';
import { logger } from '$lib/utils/logger';

export const load = async () => {
	try {
		// Query otimizada com JOIN ao invés de N+1 queries
		const coursesWithStats = await db
			.select({
				id: courses.id,
				courseName: courses.courseName,
				description: courses.description,
				capacity: courses.capacity,
				startDate: courses.startDate,
				totalStudents: count(courseEnrollments.id)
			})
			.from(courses)
			.leftJoin(
				courseEnrollments,
				and(
					eq(courses.id, courseEnrollments.courseId),
					eq(courseEnrollments.status, 'active')
				)
			)
			.groupBy(courses.id);

		return {
			courses: coursesWithStats
		};
	} catch (error) {
		logger.error('Erro ao carregar cursos:', error);
		return { courses: [] };
	}
};

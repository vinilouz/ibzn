import { db } from '$lib/server/db';
import { courses, courseEnrollments } from '$lib/server/db/schema';
import { eq, count } from 'drizzle-orm';
import { logger } from '$lib/utils/logger';

export const load = async () => {
	try {
		const allCourses = await db
			.select({
				id: courses.id,
				courseName: courses.courseName,
				description: courses.description,
				capacity: courses.capacity,
				startDate: courses.startDate
			})
			.from(courses);

		const coursesWithStats = await Promise.all(
			allCourses.map(async (course) => {
				const enrollments = await db
					.select({
						count: count()
					})
					.from(courseEnrollments)
					.where(eq(courseEnrollments.courseId, course.id));

				return {
					...course,
					totalStudents: enrollments[0]?.count || 0
				};
			})
		);

		return {
			courses: coursesWithStats
		};
	} catch (error) {
		logger.error('Erro ao carregar cursos:', error);
		return { courses: [] };
	}
};

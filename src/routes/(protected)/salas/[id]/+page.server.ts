import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { rooms, courseEnrollments, participants, courses, attendanceRecords, attendanceLists } from '$lib/server/db/schema';
import { eq, count, sql } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { logger } from '$lib/utils/logger';

export const load: PageServerLoad = async ({ params }) => {
    try {
        const roomId = parseInt(params.id);
        
        const [room] = await db
            .select()
            .from(rooms)
            .where(eq(rooms.id, roomId))
            .limit(1);
        
        if (!room) {
            throw error(404, 'Sala não encontrada');
        }

        const coursesInRoom = await db
            .select({
                id: courses.id,
                courseName: courses.courseName,
                startDate: courses.startDate,
                endTime: courses.endTime,
                startTime: courses.startTime,
                weekdays: courses.weekdays,
                capacity: courses.capacity,
                enrollmentCount: count(courseEnrollments.id)
            })
            .from(courses)
            .leftJoin(courseEnrollments, eq(courses.id, courseEnrollments.courseId))
            .where(eq(courses.room, roomId))
            .groupBy(courses.id);

        const participantsInRoom = await db
            .select({
                participant: participants,
                courseName: courses.courseName,
                courseId: courses.id,
                enrollmentStatus: courseEnrollments.status,
                enrolledAt: courseEnrollments.enrolledAt
            })
            .from(courseEnrollments)
            .innerJoin(participants, eq(courseEnrollments.participantId, participants.id))
            .innerJoin(courses, eq(courseEnrollments.courseId, courses.id))
            .where(eq(courses.room, roomId));

        const participantsWithAttendance = await Promise.all(
            participantsInRoom.map(async (item) => {
                const [attendanceStats] = await db
                    .select({
                        present: count(sql`CASE WHEN ${attendanceRecords.status} = 'present' THEN 1 END`),
                        total: count(attendanceRecords.id)
                    })
                    .from(attendanceRecords)
                    .innerJoin(attendanceLists, eq(attendanceRecords.listId, attendanceLists.id))
                    .where(
                        sql`${attendanceRecords.participantId} = ${item.participant.id} AND ${attendanceLists.courseId} = ${item.courseId}`
                    );

                return {
                    ...item,
                    attendancePresent: attendanceStats?.present || 0,
                    attendanceTotal: attendanceStats?.total || 0
                };
            })
        );
        
        return { 
            room,
            courses: coursesInRoom,
            participants: participantsWithAttendance
        };
    } catch (err) {
        logger.error('Erro ao carregar sala:', err);
        throw error(404, 'Sala não encontrada');
    }
};
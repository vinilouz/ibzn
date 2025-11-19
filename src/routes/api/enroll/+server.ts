import { db } from '$lib/server/db';
import { courseEnrollments } from '$lib/server/db/schema/courseEnrollments';
import { courses } from '$lib/server/db/schema/courses';
import { eq, and, count } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import { requireCapability } from '$lib/server/middleware/auth';
import { CAPABILITIES } from '$lib/server/capabilities';
import type { RequestEvent } from '@sveltejs/kit';

export async function POST(event: RequestEvent) {
    await requireCapability(event, CAPABILITIES.COURSES_ENROLL);

    const { courseId, participantId } = await event.request.json();

    if (!participantId) {
        return json({ error: 'ID do participante é obrigatório.' }, { status: 400 });
    }

    const [course] = await db.select().from(courses).where(eq(courses.id, courseId));
    if (!course) {
        return json({ error: 'Curso não encontrado.' }, { status: 404 });
    }

    if (course.isFull) {
        return json({ error: 'Curso lotado.' }, { status: 400 });
    }

    const [alreadyEnrolled] = await db
        .select()
        .from(courseEnrollments)
        .where(and(eq(courseEnrollments.participantId, participantId), eq(courseEnrollments.courseId, courseId)));

    if (alreadyEnrolled) {
        return json({ error: 'Usuário já matriculado neste curso.' }, { status: 400 });
    }

    const [enrollmentCount] = await db
        .select({ count: count() })
        .from(courseEnrollments)
        .where(eq(courseEnrollments.courseId, courseId));

    const currentEnrollments = enrollmentCount?.count || 0;

    if (currentEnrollments >= course.capacity) {
        
        await db
            .update(courses)
            .set({ isFull: true })
            .where(eq(courses.id, courseId));

        return json({ error: 'Curso lotado.' }, { status: 400 });
    }

    await db.insert(courseEnrollments).values({ 
        participantId, 
        courseId,
        amount: course.price || 0
    });

    const newEnrollmentCount = currentEnrollments + 1;
    if (newEnrollmentCount >= course.capacity) {
        await db
            .update(courses)
            .set({ isFull: true })
            .where(eq(courses.id, courseId));
    }

    return json({
        success: true,
        coursePrice: course.price,
        message: 'Inscrição realizada com sucesso!',
        enrollmentInfo: {
            availableSpots: course.capacity - newEnrollmentCount,
            totalCapacity: course.capacity
        }
    });
}

export async function DELETE(event: RequestEvent) {
    await requireCapability(event, CAPABILITIES.COURSES_ENROLL);

    const { courseId, participantId } = await event.request.json();

    if (!participantId) {
        return json({ error: 'ID do participante é obrigatório.' }, { status: 400 });
    }

    const [enrollment] = await db
        .select()
        .from(courseEnrollments)
        .where(and(eq(courseEnrollments.participantId, participantId), eq(courseEnrollments.courseId, courseId)));

    if (!enrollment) {
        return json({ error: 'Você não está inscrito neste curso.' }, { status: 400 });
    }

    await db
        .delete(courseEnrollments)
        .where(and(eq(courseEnrollments.participantId, participantId), eq(courseEnrollments.courseId, courseId)));

    await db
        .update(courses)
        .set({ isFull: false })
        .where(eq(courses.id, courseId));

    return json({
        success: true,
        message: 'Inscrição cancelada com sucesso!'
    });
}



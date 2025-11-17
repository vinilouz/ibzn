import { db } from '$lib/server/db';
import { courseEnrollments } from '$lib/server/db/schema/courseEnrollments';
import { courses } from '$lib/server/db/schema/courses';
import { eq, and, count } from 'drizzle-orm';
import { json } from '@sveltejs/kit';
import { requireCapability } from '$lib/server/middleware/auth';
import { CAPABILITIES } from '$lib/server/capabilities';
import type { RequestEvent } from '@sveltejs/kit';

export async function POST(event: RequestEvent) {
    // ✅ Verificar se usuário tem permissão para se inscrever
    const user = await requireCapability(event, CAPABILITIES.COURSES_ENROLL);

    const { courseId } = await event.request.json();
    const userId = user.id; // Usar ID do usuário autenticado

    // Verificar se o curso existe
    const [course] = await db.select().from(courses).where(eq(courses.id, courseId));
    if (!course) {
        return json({ error: 'Curso não encontrado.' }, { status: 404 });
    }

    // ✅ Verificar se o curso já está marcado como cheio
    if (course.isFull) {
        return json({ error: 'Curso lotado.' }, { status: 400 });
    }

    // Verificar se o usuário já está matriculado
    const [alreadyEnrolled] = await db
        .select()
        .from(courseEnrollments)
        .where(and(eq(courseEnrollments.userId, userId), eq(courseEnrollments.courseId, courseId)));

    if (alreadyEnrolled) {
        return json({ error: 'Usuário já matriculado neste curso.' }, { status: 400 });
    }

    // ✅ Contar matrículas atuais (mais eficiente com count)
    const [enrollmentCount] = await db
        .select({ count: count() })
        .from(courseEnrollments)
        .where(eq(courseEnrollments.courseId, courseId));

    const currentEnrollments = enrollmentCount?.count || 0;

    // Verificar se há vagas disponíveis
    if (currentEnrollments >= course.capacity) {
        // ✅ Atualizar flag isFull
        await db
            .update(courses)
            .set({ isFull: true })
            .where(eq(courses.id, courseId));

        return json({ error: 'Curso lotado.' }, { status: 400 });
    }

    // Realiza matrícula
    await db.insert(courseEnrollments).values({ userId, courseId });

    // ✅ Verificar se após essa inscrição o curso ficou cheio
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

//  API para cancelar inscrição (libera vaga)
export async function DELETE(event: RequestEvent) {
    const user = await requireCapability(event, CAPABILITIES.COURSES_ENROLL);

    const { courseId } = await event.request.json();
    const userId = user.id;

    // Verificar se está inscrito
    const [enrollment] = await db
        .select()
        .from(courseEnrollments)
        .where(and(eq(courseEnrollments.userId, userId), eq(courseEnrollments.courseId, courseId)));

    if (!enrollment) {
        return json({ error: 'Você não está inscrito neste curso.' }, { status: 400 });
    }

    // Remover inscrição
    await db
        .delete(courseEnrollments)
        .where(and(eq(courseEnrollments.userId, userId), eq(courseEnrollments.courseId, courseId)));

    // Atualizar flag isFull (curso não está mais cheio)
    await db
        .update(courses)
        .set({ isFull: false })
        .where(eq(courses.id, courseId));

    return json({
        success: true,
        message: 'Inscrição cancelada com sucesso!'
    });
}



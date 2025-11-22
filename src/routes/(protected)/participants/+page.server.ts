import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { participants, courseEnrollments, courses, attendanceRecords, appointments, payments } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
  const allParticipants = await db.select().from(participants);

  const participantIds = allParticipants.map(p => p.id);

  const [allCourses, enrollments] = await Promise.all([
    db.select().from(courses),
    participantIds.length > 0
      ? db
          .select({
            enrollmentId: courseEnrollments.id,
            participantId: courseEnrollments.participantId,
            courseId: courseEnrollments.courseId,
            courseName: courses.courseName,
            enrolledAt: courseEnrollments.enrolledAt,
            status: courseEnrollments.status,
            amount: courseEnrollments.amount,
          })
          .from(courseEnrollments)
          .leftJoin(courses, eq(courseEnrollments.courseId, courses.id))
      : []
  ]);

  const participantsWithCourses = allParticipants.map(participant => ({
    ...participant,
    courses: enrollments.filter(e => e.participantId === participant.id)
  }));

  return {
    participants: participantsWithCourses,
    courses: allCourses
  };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const data = await request.formData();
    const name = data.get('name') as string;
    const phone = data.get('phone') as string;
    const address = data.get('address') as string | null;
    const role = data.get('role') as string | null;
    const birthdate = data.get('birthdate') as string | null;
    await db.insert(participants).values({
      name,
      phone,
      address: address || null,
      role: role || null,
      birthdate: birthdate || null
    });

    return { success: true };
  },

  update: async ({ request }) => {
    const data = await request.formData();
    const id = Number(data.get('id'));
    const name = data.get('name') as string;
    const phone = data.get('phone') as string;
    const address = data.get('address') as string | null;
    const role = data.get('role') as string | null;
    const birthdate = data.get('birthdate') as string | null;

    await db.update(participants)
      .set({
        name,
        phone,
        address: address || null,
        role: role || null,
        birthdate: birthdate || null
      })
      .where(eq(participants.id, id));

    return { success: true };
  },

  delete: async ({ request }) => {
    const data = await request.formData();
    const id = Number(data.get('id'));

    // Deletar todos os registros relacionados antes de deletar o participante
    // Isso é necessário porque algumas foreign keys não têm onDelete cascade configurado

    // 1. Deletar registros de presença
    await db.delete(attendanceRecords).where(eq(attendanceRecords.participantId, id));

    // 2. Atualizar appointments (setar participantId como null ao invés de deletar)
    await db.update(appointments)
      .set({ participantId: null })
      .where(eq(appointments.participantId, id));

    // 3. Deletar pagamentos (já tem cascade mas vamos garantir)
    await db.delete(payments).where(eq(payments.participantId, id));

    // 4. Deletar matrículas (já tem cascade mas vamos garantir)
    await db.delete(courseEnrollments).where(eq(courseEnrollments.participantId, id));

    // 5. Finalmente deletar o participante
    await db.delete(participants).where(eq(participants.id, id));

    return { success: true };
  }
};
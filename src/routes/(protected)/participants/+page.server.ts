import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { participants, courseEnrollments, courses } from '$lib/server/db/schema';
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

    await db.delete(participants).where(eq(participants.id, id));

    return { success: true };
  }
};
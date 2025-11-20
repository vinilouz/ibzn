// src/routes/participants/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { participants, courseEnrollments, courses } from '$lib/server/db/schema';
import { eq, ilike, or, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url }) => {
  const page = Number(url.searchParams.get('page')) || 1;
  const search = url.searchParams.get('search') || '';
  const limit = 10;
  const offset = (page - 1) * limit;

  let query = db.select().from(participants);
  
  if (search) {
    query = query.where(
      or(
        ilike(participants.name, `%${search}%`),
        ilike(participants.phone, `%${search}%`),
        ilike(participants.address, `%${search}%`)
      )
    ) as any;
  }

  const allParticipants = await query.limit(limit).offset(offset);

  const allCourses = await db.select().from(courses);

  const enrollments = await db
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
    .leftJoin(courses, eq(courseEnrollments.courseId, courses.id));

  const participantsWithCourses = allParticipants.map(participant => ({
    ...participant,
    courses: enrollments.filter(e => e.participantId === participant.id)
  }));

  // Get total count for pagination
  const countQuery = search
    ? db.select({ count: sql<number>`count(*)` }).from(participants).where(
        or(
          ilike(participants.name, `%${search}%`),
          ilike(participants.phone, `%${search}%`),
          ilike(participants.address, `%${search}%`)
        )
      )
    : db.select({ count: sql<number>`count(*)` }).from(participants);
  
  const [{ count }] = await countQuery as any;
  const totalPages = Math.ceil(Number(count) / limit);

  return {
    participants: participantsWithCourses,
    courses: allCourses,
    pagination: {
      currentPage: page,
      totalPages,
      totalItems: Number(count),
      itemsPerPage: limit
    },
    search
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
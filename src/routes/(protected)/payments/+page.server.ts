// src/routes/payments/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { payments } from '$lib/server/db/schema';
import { courses } from '$lib/server/db/schema/courses';
import { user } from '$lib/server/db/schema/user';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
  // Buscar todos os pagamentos com informações do curso e usuário
  const allPayments = await db
    .select({
      payment: payments,
      courseName: courses.courseName,
      userName: user.name,
    })
    .from(payments)
    .leftJoin(courses, eq(payments.courseId, courses.id))
    .leftJoin(user, eq(payments.userId, user.id))
    .orderBy(payments.createdAt);

  // Buscar cursos para o dropdown
  const allCourses = await db.select().from(courses);

  // Buscar usuários para o dropdown
  const allUsers = await db.select().from(user);

  return {
    payments: allPayments,
    courses: allCourses,
    users: allUsers
  };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const data = await request.formData();

    const userId = data.get('userId') as string;
    const courseId = Number(data.get('courseId'));
    const amount = Number(data.get('amount'));
    const discount = Number(data.get('discount') || 0);
    const finalAmount = amount - discount;
    const paymentMethod = data.get('paymentMethod') as string | null;
    const notes = data.get('notes') as string | null;

    await db.insert(payments).values({
      userId,
      courseId,
      amount,
      discount,
      finalAmount,
      status: 'pending',
      paymentMethod: paymentMethod || null,
      notes: notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return { success: true };
  },

  updateStatus: async ({ request }) => {
    const data = await request.formData();
    const id = Number(data.get('id'));
    const status = data.get('status') as 'pending' | 'paid' | 'cancelled' | 'refunded';

    const updateData: any = {
      status,
      updatedAt: new Date().toISOString()
    };

    // Se marcado como pago, registrar a data
    if (status === 'paid') {
      updateData.paidAt = new Date().toISOString();
    }

    // Se cancelado, registrar a data
    if (status === 'cancelled') {
      updateData.cancelledAt = new Date().toISOString();
    }

    await db.update(payments)
      .set(updateData)
      .where(eq(payments.id, id));

    return { success: true };
  },

  delete: async ({ request }) => {
    const data = await request.formData();
    const id = Number(data.get('id'));

    await db.delete(payments).where(eq(payments.id, id));

    return { success: true };
  }
};

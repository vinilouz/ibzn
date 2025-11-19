// src/routes/payments/+page.server.ts
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { payments, courseEnrollments } from '$lib/server/db/schema';
import { courses } from '$lib/server/db/schema/courses';
import { user } from '$lib/server/db/schema/user';
import { eq, desc, and } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
  try {
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
      .orderBy(desc(payments.createdAt));

    // Buscar cursos para o dropdown
    const allCourses = await db.select().from(courses);

    // Buscar usuários para o dropdown
    const allUsers = await db.select().from(user);

    return {
      payments: allPayments,
      courses: allCourses,
      users: allUsers
    };
  } catch (error) {
    console.error('Erro ao carregar pagamentos:', error);
    return {
      payments: [],
      courses: [],
      users: []
    };
  }
};

export const actions: Actions = {
  create: async ({ request }) => {
    const data = await request.formData();

    const userId = data.get('userId') as string;
    const courseId = Number(data.get('courseId'));
    const amount = Number(data.get('amount'));
    const discount = Number(data.get('discount') || 0);
    const finalAmount = amount - discount;
    const paymentMethodRaw = data.get('paymentMethod') as string;
    const notes = data.get('notes') as string | null;

    // Validar paymentMethod
    const validMethods = ['pix', 'credit_card', 'debit_card', 'bank_transfer', 'boleto', 'cash'];
    const paymentMethod = paymentMethodRaw && validMethods.includes(paymentMethodRaw)
      ? paymentMethodRaw as 'pix' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'boleto' | 'cash'
      : null;

    await db.insert(payments).values({
      userId,
      courseId,
      amount,
      discount,
      finalAmount,
      status: 'pending',
      paymentMethod,
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

    // Criar matrícula quando pagamento for confirmado
    if (status === 'paid') {
      // Buscar informações do pagamento
      const payment = await db
        .select()
        .from(payments)
        .where(eq(payments.id, id))
        .limit(1);

      if (payment.length > 0) {
        const { userId, courseId } = payment[0];

        // Verificar se já não existe matrícula para evitar duplicatas
        const existingEnrollment = await db
          .select()
          .from(courseEnrollments)
          .where(
            and(
              eq(courseEnrollments.userId, userId),
              eq(courseEnrollments.courseId, courseId)
            )
          )
          .limit(1);

        // Se não existir, criar a matrícula
        if (existingEnrollment.length === 0) {
          await db.insert(courseEnrollments).values({
            userId,
            courseId,
            enrolledAt: new Date().toISOString()
          });

          console.log(`Matrícula criada automaticamente: userId=${userId}, courseId=${courseId}`);
        } else {
          console.log(`ℹMatrícula já existe: userId=${userId}, courseId=${courseId}`);
        }
      }
    }

    return { success: true };
  },

  delete: async ({ request }) => {
    const data = await request.formData();
    const id = Number(data.get('id'));

    await db.delete(payments).where(eq(payments.id, id));

    return { success: true };
  }
};

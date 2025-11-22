import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { payments, participants, courseEnrollments } from '$lib/server/db/schema';
import { courses } from '$lib/server/db/schema/courses';
import { eq, desc, and } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
  try {
    const [allPayments, allCourses, allParticipants] = await Promise.all([
      db
        .select({
          payment: payments,
          courseName: courses.courseName,
          participantName: participants.name,
          participantPhone: participants.phone,
        })
        .from(payments)
        .leftJoin(courses, eq(payments.courseId, courses.id))
        .leftJoin(participants, eq(payments.participantId, participants.id))
        .orderBy(desc(payments.createdAt)),

      db.select({
        id: courses.id,
        courseName: courses.courseName,
        price: courses.price
      }).from(courses),

      db.select({
        id: participants.id,
        name: participants.name,
        phone: participants.phone
      }).from(participants)
    ]);

    return {
      payments: allPayments,
      courses: allCourses,
      participants: allParticipants
    };
  } catch (error) {
    console.error('Erro ao carregar pagamentos:', error);
    return {
      payments: [],
      courses: [],
      participants: []
    };
  }
};

export const actions: Actions = {
  create: async ({ request }) => {
    const data = await request.formData();

    const participantId = Number(data.get('participantId'));
    const courseId = Number(data.get('courseId'));
    const amount = Number(data.get('amount'));
    const discountPercentage = Number(data.get('discountPercentage') || 0);
    
    // Calculate discount amount based on percentage
    const discount = (amount * discountPercentage) / 100;
    const finalAmount = amount - discount;

    const paymentMethodRaw = data.get('paymentMethod') as string;
    const notes = data.get('notes') as string | null;

    const validMethods = ['pix', 'credit_card', 'debit_card', 'bank_transfer', 'boleto', 'cash', 'free'];
    const paymentMethod = paymentMethodRaw && validMethods.includes(paymentMethodRaw)
      ? paymentMethodRaw as 'pix' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'boleto' | 'cash' | 'free'
      : null;

    const status = paymentMethod === 'free' ? 'paid' : 'pending';
    const paidAt = paymentMethod === 'free' ? new Date().toISOString() : null;

    const [newPayment] = await db.insert(payments).values({
      participantId,
      courseId,
      amount,
      discount,
      finalAmount,
      status,
      paymentMethod,
      notes: notes || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      paidAt
    }).returning();

    if (status === 'paid') {
       const existingEnrollment = await db
        .select()
        .from(courseEnrollments)
        .where(
          and(
            eq(courseEnrollments.participantId, participantId),
            eq(courseEnrollments.courseId, courseId)
          )
        )
        .limit(1);

      if (existingEnrollment.length === 0) {
        await db.insert(courseEnrollments).values({
          participantId,
          courseId,
          amount: finalAmount || 0,
          enrolledAt: new Date().toISOString(),
          status: 'active',
          notes: `Matrícula criada automaticamente pelo pagamento #${newPayment.id} (Gratuito)`
        });
      }
    }

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

    if (status === 'paid') {
      updateData.paidAt = new Date().toISOString();
    }

    if (status === 'cancelled') {
      updateData.cancelledAt = new Date().toISOString();
    }

    await db.update(payments)
      .set(updateData)
      .where(eq(payments.id, id));

    if (status === 'paid') {
      const payment = await db
        .select()
        .from(payments)
        .where(eq(payments.id, id))
        .limit(1);

      if (payment.length > 0) {
        const { participantId, courseId, finalAmount } = payment[0];

        if (participantId && courseId) {
          const existingEnrollment = await db
            .select()
            .from(courseEnrollments)
            .where(
              and(
                eq(courseEnrollments.participantId, participantId),
                eq(courseEnrollments.courseId, courseId)
              )
            )
            .limit(1);

          if (existingEnrollment.length === 0) {
            await db.insert(courseEnrollments).values({
              participantId,
              courseId,
              amount: finalAmount || 0,
              enrolledAt: new Date().toISOString(),
              status: 'active',
              notes: `Matrícula criada automaticamente pelo pagamento #${id}`
            });

            console.log(`✅ Matrícula criada: participantId=${participantId}, courseId=${courseId}`);
          } else {
            console.log(`ℹ️ Matrícula já existe: participantId=${participantId}, courseId=${courseId}`);
          }
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

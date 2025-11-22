import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { payments, courses, participants, courseEnrollments } from '$lib/server/db/schema';
import { eq, sql, and } from 'drizzle-orm';
import { cache } from '$lib/server/cache';
import { requireAuth } from '$lib/server/middleware/auth';

export const load: PageServerLoad = async (event) => {
  const user = await requireAuth(event);
  
  // Apenas admin pode acessar financeiro
  if (user.role !== 'admin') {
    return {
      unauthorized: true,
      user
    };
  }
  return cache.get('financeiro:dashboard', async () => {
    const allPayments = await db
    .select({
      payment: payments,
      courseName: courses.courseName,
      participantName: participants.name,
      participantPhone: participants.phone,
    })
    .from(payments)
    .leftJoin(courses, eq(payments.courseId, courses.id))
    .leftJoin(participants, eq(payments.participantId, participants.id))
    .orderBy(sql`${payments.createdAt} DESC`);

  const stats = {
    totalReceita: 0,
    totalPendente: 0,
    totalPago: 0,
    totalGratuito: 0,
    totalCancelado: 0,
    totalReembolsado: 0,
  };

  allPayments.forEach(({ payment }) => {
    const amount = payment.finalAmount || 0;

    if (payment.status === 'paid') {
      stats.totalPago += amount;
      stats.totalReceita += amount;
    } else if (payment.status === 'pending') {
      stats.totalPendente += amount;
    } else if (payment.status === 'cancelled') {
      stats.totalCancelado += amount;
    } else if (payment.status === 'refunded') {
      stats.totalReembolsado += amount;
    }

    if (amount === 0 || payment.paymentMethod === 'free') {
      stats.totalGratuito += 1;
    }
  });

  const receitaPorCurso: Record<string, { courseName: string; total: number; count: number }> = {};

  allPayments.forEach(({ payment, courseName }) => {
    const courseKey = payment.courseId.toString();
    if (!receitaPorCurso[courseKey]) {
      receitaPorCurso[courseKey] = {
        courseName: courseName || 'Curso Desconhecido',
        total: 0,
        count: 0,
      };
    }

    if (payment.status === 'paid') {
      receitaPorCurso[courseKey].total += payment.finalAmount || 0;
      receitaPorCurso[courseKey].count += 1;
    }
  });

  const receitaPorCursoArray = Object.values(receitaPorCurso).sort((a, b) => b.total - a.total);

  const cursosComEstatisticas = await db
    .select({
      id: courses.id,
      courseName: courses.courseName,
      totalMatriculas: sql<number>`count(distinct ${courseEnrollments.id})::int`,
      pagantes: sql<number>`count(distinct case when ${payments.status} = 'paid' and ${payments.finalAmount} > 0 and ${payments.paymentMethod} != 'free' then ${payments.id} end)::int`,
      naoPagantes: sql<number>`count(distinct case when ${payments.status} = 'paid' and (${payments.finalAmount} = 0 or ${payments.paymentMethod} = 'free') then ${payments.id} end)::int`,
      receitaTotal: sql<number>`coalesce(sum(case when ${payments.status} = 'paid' then ${payments.finalAmount} else 0 end), 0)::float`
    })
    .from(courses)
    .leftJoin(courseEnrollments, eq(courses.id, courseEnrollments.courseId))
    .leftJoin(payments, and(
      eq(courses.id, payments.courseId),
      eq(payments.status, 'paid')
    ))
    .groupBy(courses.id)
    .then(results => results.map(r => ({
      ...r,
      semPagamento: r.totalMatriculas - (r.pagantes + r.naoPagantes)
    })));

    return {
      payments: allPayments,
      stats,
      receitaPorCurso: receitaPorCursoArray,
      cursosComEstatisticas,
    };
  }, 40000);
};

// src/routes/financeiro/+page.server.ts
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { payments, courses, user, courseEnrollments } from '$lib/server/db/schema';
import { eq, sql, and } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
  // 1. Buscar todos os pagamentos com informações de curso e usuário
  const allPayments = await db
    .select({
      payment: payments,
      courseName: courses.courseName,
      userName: user.name,
      userEmail: user.email,
    })
    .from(payments)
    .leftJoin(courses, eq(payments.courseId, courses.id))
    .leftJoin(user, eq(payments.userId, user.id))
    .orderBy(sql`${payments.createdAt} DESC`);

  // 2. Calcular estatísticas financeiras
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

    // Contar como gratuito se finalAmount = 0
    if (amount === 0) {
      stats.totalGratuito += 1;
    }
  });

  // 3. Receita por curso
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

  // 4. Buscar todos os cursos para estatísticas
  const allCourses = await db.select().from(courses);

  // 5. Para cada curso, contar pagantes vs não-pagantes
  const cursosComEstatisticas = await Promise.all(
    allCourses.map(async (course) => {
      // Total de matrículas
      const enrollments = await db
        .select()
        .from(courseEnrollments)
        .where(eq(courseEnrollments.courseId, course.id));

      // Pagamentos deste curso
      const coursePayments = await db
        .select()
        .from(payments)
        .where(and(
          eq(payments.courseId, course.id),
          eq(payments.status, 'paid')
        ));

      const totalMatriculas = enrollments.length;
      const pagantes = coursePayments.filter(p => (p.finalAmount || 0) > 0).length;
      const naoPagantes = coursePayments.filter(p => (p.finalAmount || 0) === 0).length;
      const semPagamento = totalMatriculas - coursePayments.length;

      return {
        id: course.id,
        courseName: course.courseName,
        totalMatriculas,
        pagantes,
        naoPagantes,
        semPagamento,
        receitaTotal: coursePayments.reduce((sum, p) => sum + (p.finalAmount || 0), 0),
      };
    })
  );

  return {
    payments: allPayments,
    stats,
    receitaPorCurso: receitaPorCursoArray,
    cursosComEstatisticas,
  };
};

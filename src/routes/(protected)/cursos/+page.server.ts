import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { courses, courseEnrollments, facilitators, rooms } from '$lib/server/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';
import { cache } from '$lib/server/cache';

const courseSchema = z.object({
  courseName: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().nullable(),
  price: z.number().positive('Preço deve ser positivo'),
  capacity: z.number().int().positive('Capacidade deve ser positiva'),
  duration: z.number().int().positive('Duração deve ser positiva'),
  sessionsInfo: z.string().nullable(),
  startDate: z.string().nullable(),
  weekdays: z.enum(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']).nullable(),
  startTime: z.string().nullable(), 
  endTime: z.string().nullable(),   
  teacher: z.number().int().positive('Professor é obrigatório'), // number
  room: z.number().int().positive('Sala é obrigatória')
});


async function updateIsFull(courseId: number) {
  try {
    const enrollmentCount = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(courseEnrollments)
      .where(eq(courseEnrollments.courseId, courseId));

    const courseData = await db
      .select({ capacity: courses.capacity })
      .from(courses)
      .where(eq(courses.id, courseId));

    if (courseData.length > 0) {
      const count = enrollmentCount[0]?.count || 0;
      const isFull = count >= courseData[0].capacity;
      
      await db
        .update(courses)
        .set({ isFull, updatedAt: new Date().toISOString() })
        .where(eq(courses.id, courseId));
    }
  } catch (error) {
    console.error('Erro ao atualizar isFull:', error);
  }
}

export const load: PageServerLoad = async () => {
  try {
    // Cache com queries em paralelo para melhor performance
    const [allCourses, allFacilitators, allRooms] = await cache.get(
      'cursos:data',
      async () => Promise.all([
      // Query dos cursos
      db
        .select({
          id: courses.id,
          courseName: courses.courseName,
          description: courses.description,
          price: courses.price,
          capacity: courses.capacity,
          isFull: courses.isFull,
          duration: courses.duration,
          sessionsInfo: courses.sessionsInfo,
          startDate: courses.startDate,
          weekdays: courses.weekdays,
          startTime: courses.startTime,
          endTime: courses.endTime,
          teacher: courses.teacher,
          room: courses.room,
          createdAt: courses.createdAt,
          updatedAt: courses.updatedAt,
          teacherName: facilitators.name,
          roomName: rooms.name,
          roomNumber: rooms.number,
          enrollmentCount: sql<number>`count(${courseEnrollments.id})::int`
        })
        .from(courses)
        .leftJoin(facilitators, eq(courses.teacher, facilitators.id))
        .leftJoin(rooms, eq(courses.room, rooms.id))
        .leftJoin(courseEnrollments, eq(courses.id, courseEnrollments.courseId))
        .groupBy(
          courses.id,
          facilitators.name,
          rooms.name,
          rooms.number
        )
        .orderBy(desc(courses.createdAt)),

      // Query dos facilitadores
      db
        .select({
          id: facilitators.id,
          name: facilitators.name
        })
        .from(facilitators),

      // Query das salas
      db
        .select({
          id: rooms.id,
          name: rooms.name,
          number: rooms.number
        })
        .from(rooms)
        .where(eq(rooms.status, true))
      ]),
      15000 // 15 segundos
    );

    return {
      courses: allCourses,
      facilitators: allFacilitators,
      rooms: allRooms
    };
  } catch (error) {
    console.error('Erro ao carregar dados:', error);
    return { courses: [], facilitators: [], rooms: [] };
  }
};

export const actions: Actions = {
  create: async ({ request }) => {
    try {
      const formData = await request.formData();
      console.log('FormData recebido:', Object.fromEntries(formData));
      
      const now = new Date().toISOString();
      
      // Corrigir timezone para startDate
      const startDateRaw = formData.get('startDate') as string;
      const startDate = startDateRaw ? `${startDateRaw}T12:00:00` : null;

      const data = {
        courseName: formData.get('courseName') as string,
        description: (formData.get('description') as string) || null,
        price: parseFloat(formData.get('price') as string),
        capacity: parseInt(formData.get('capacity') as string),
        duration: parseInt(formData.get('duration') as string),
        sessionsInfo: (formData.get('sessionsInfo') as string) || null,
        startDate: startDate,
        weekdays: (formData.get('weekdays') as any) || null,
        startTime: (formData.get('startTime') as string) || null,
        endTime: (formData.get('endTime') as string) || null,
        teacher: parseInt(formData.get('teacher') as string), //  parseInt
        room: parseInt(formData.get('room') as string)
      };

      console.log('Dados parseados:', data);

      const validated = courseSchema.safeParse(data);
      if (!validated.success) {
        console.error('Erro de validação:', validated.error);
        return fail(400, { 
          error: validated.error.issues[0].message,
          fields: data
        });
      }

      console.log('Dados validados:', validated.data);

      const result = await db.insert(courses).values({
        courseName: validated.data.courseName,
        description: validated.data.description,
        price: validated.data.price,
        capacity: validated.data.capacity,
        duration: validated.data.duration,
        sessionsInfo: validated.data.sessionsInfo,
        startDate: validated.data.startDate,
        weekdays: validated.data.weekdays,
        startTime: validated.data.startTime,
        endTime: validated.data.endTime,
        teacher: validated.data.teacher,
        room: validated.data.room,
        isFull: false,
        createdAt: now,
        updatedAt: now
      } as any).returning();

      console.log('Curso criado:', result);

      cache.invalidate('cursos:data');
      cache.invalidate('painel:stats');
      return { success: true };
    } catch (error) {
      console.error('Erro ao criar curso:', error);
      return fail(500, { error: 'Erro ao criar curso: ' + (error as Error).message });
    }
  },

  update: async ({ request }) => {
    try {
      const formData = await request.formData();
      const id = parseInt(formData.get('id') as string);
      const now = new Date().toISOString();
      
      console.log('Atualizando curso ID:', id);
      
      // Corrigir timezone para startDate
      const startDateRaw = formData.get('startDate') as string;
      const startDate = startDateRaw ? `${startDateRaw}T12:00:00` : null;
      
      const data = {
        courseName: formData.get('courseName') as string,
        description: (formData.get('description') as string) || null,
        price: parseFloat(formData.get('price') as string),
        capacity: parseInt(formData.get('capacity') as string),
        duration: parseInt(formData.get('duration') as string),
        sessionsInfo: (formData.get('sessionsInfo') as string) || null,
        startDate: startDate,
        weekdays: (formData.get('weekdays') as any) || null,
        startTime: (formData.get('startTime') as string) || null,
        endTime: (formData.get('endTime') as string) || null,
        teacher: parseInt(formData.get('teacher') as string),
        room: parseInt(formData.get('room') as string)
      };

      const validated = courseSchema.safeParse(data);
      if (!validated.success) {
        console.error('Erro de validação:', validated.error);
        return fail(400, { 
          error: validated.error.issues[0].message,
          fields: data
        });
      }

      const result = await db.update(courses)
        .set({
          courseName: validated.data.courseName,
          description: validated.data.description,
          price: validated.data.price,
          capacity: validated.data.capacity,
          duration: validated.data.duration,
          sessionsInfo: validated.data.sessionsInfo,
          startDate: validated.data.startDate,
          weekdays: validated.data.weekdays,
          startTime: validated.data.startTime,
          endTime: validated.data.endTime,
          teacher: validated.data.teacher,
          room: validated.data.room,
          updatedAt: now
        } as any)
        .where(eq(courses.id, id))
        .returning();

      console.log('Curso atualizado:', result);

      await updateIsFull(id);

      cache.invalidate('cursos:data');
      cache.invalidate('painel:stats');
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar curso:', error);
      return fail(500, { error: 'Erro ao atualizar curso: ' + (error as Error).message });
    }
  },

  delete: async ({ request }) => {
    try {
      const formData = await request.formData();
      const id = parseInt(formData.get('id') as string);

      console.log('Deletando curso ID:', id);

      const result = await db.delete(courses)
        .where(eq(courses.id, id))
        .returning();

      console.log('Curso deletado:', result);

      cache.invalidate('cursos:data');
      cache.invalidate('painel:stats');
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar curso:', error);
      return fail(500, { error: 'Erro ao deletar curso: ' + (error as Error).message });
    }
  }
};

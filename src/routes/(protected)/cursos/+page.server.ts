// src/routes/cursos/+page.server.ts
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { courses } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { z } from 'zod';

const courseSchema = z.object({
  courseName: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().nullable(),
  price: z.number().positive('Preço deve ser positivo'),
  capacity: z.number().int().positive('Capacidade deve ser positiva'),
  isFull: z.boolean(),
  duration: z.number().int().positive('Duração deve ser positiva'),
  hourly: z.string().nullable(),
  weekdays: z.enum(['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']).nullable(),
  dates: z.string().nullable(),
  startDate: z.string().nullable(),
  teacher: z.string(),
  room: z.number().int()
});

export const load: PageServerLoad = async () => {
  try {
    const allCourses = await db
      .select()
      .from(courses)
      .orderBy(desc(courses.createdAt));

    console.log('Cursos carregados:', allCourses.length);
    return { courses: allCourses };
  } catch (error) {
    console.error('Erro ao carregar cursos:', error);
    return { courses: [] };
  }
};

export const actions: Actions = {
  create: async ({ request }) => {
    try {
      const formData = await request.formData();
      console.log('FormData recebido:', Object.fromEntries(formData));
      
      const now = new Date().toISOString();
      
      const data = {
        courseName: formData.get('courseName') as string,
        description: (formData.get('description') as string) || null,
        price: parseFloat(formData.get('price') as string),
        capacity: parseInt(formData.get('capacity') as string),
        isFull: formData.get('isFull') === 'on',
        duration: parseInt(formData.get('duration') as string),
        hourly: (formData.get('hourly') as string) || null,
        weekdays: (formData.get('weekdays') as any) || null,
        dates: (formData.get('dates') as string) || null,
        startDate: (formData.get('startDate') as string) || null,
        teacher: 'temp_teacher',
        room: 1
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
        ...validated.data,
        createdAt: now,
        updatedAt: now
      }).returning();

      console.log('Curso criado:', result);

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
      
      const data = {
        courseName: formData.get('courseName') as string,
        description: (formData.get('description') as string) || null,
        price: parseFloat(formData.get('price') as string),
        capacity: parseInt(formData.get('capacity') as string),
        isFull: formData.get('isFull') === 'on',
        duration: parseInt(formData.get('duration') as string),
        hourly: (formData.get('hourly') as string) || null,
        weekdays: (formData.get('weekdays') as any) || null,
        dates: (formData.get('dates') as string) || null,
        startDate: (formData.get('startDate') as string) || null,
        teacher: 'temp_teacher',
        room: 1
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
          ...validated.data,
          updatedAt: now
        })
        .where(eq(courses.id, id))
        .returning();

      console.log('Curso atualizado:', result);

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

      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar curso:', error);
      return fail(500, { error: 'Erro ao deletar curso: ' + (error as Error).message });
    }
  }
};
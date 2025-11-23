import type { Actions, PageServerLoad } from './$types.js';
import { db } from '$lib/server/db';
import { facilitators, rooms, appointments, courses } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
  const list = await db.select().from(facilitators);

  return {
    facilitators: list
  };
};

export const actions: Actions = {
  create: async ({ request }) => {
    console.log('Ação CREATE chamada');
    const form = await request.formData();
    
    const values: any = {
      name: String(form.get('name') ?? ''),
      phone: String(form.get('phone') ?? ''),
      email: String(form.get('email') ?? ''),
      role: String(form.get('role') ?? '')
    };

    const bdRaw = form.get('birthdate');
    if (bdRaw) {
      const d = new Date(String(bdRaw));
      if (!isNaN(d.getTime())) {
        values.birthdate = d.toISOString().slice(0, 10);
      }
    }

    await db.insert(facilitators).values(values);
    return { success: true };
  },

  update: async ({ request }) => {
    console.log('Ação UPDATE chamada');
    const form = await request.formData();
    const id = Number(form.get('id'));
    
    const patch: any = {};
    if (form.get('name')) patch.name = String(form.get('name'));
    if (form.get('phone')) patch.phone = String(form.get('phone'));
    if (form.get('email')) patch.email = String(form.get('email'));
    if (form.get('role')) patch.role = String(form.get('role'));
    
    if (form.get('birthdate')) {
      const d = new Date(String(form.get('birthdate')));
      if (!isNaN(d.getTime())) {
        patch.birthdate = d.toISOString().slice(0, 10);
      }
    }

    await db.update(facilitators).set(patch).where(eq(facilitators.id, id));
    return { success: true };
  },

  delete: async ({ request }) => {
    console.log('Ação DELETE chamada');
    const form = await request.formData();
    const id = Number(form.get('id'));

    // Deletar/atualizar todos os registros relacionados antes de deletar o facilitador
    // Isso é necessário porque algumas foreign keys não têm onDelete cascade configurado

    // 1. Atualizar salas (setar facilitatorId como null ao invés de deletar)
    await db.update(rooms)
      .set({ facilitatorId: null })
      .where(eq(rooms.facilitatorId, id));

    // 2. Atualizar appointments (setar facilitatorId como null ao invés de deletar)
    await db.update(appointments)
      .set({ facilitatorId: null })
      .where(eq(appointments.facilitatorId, id));

    // 3. Verificar se há cursos usando este facilitador como teacher
    // Não vamos deletar cursos, apenas impedimos a exclusão se houver cursos ativos
    const coursesUsingFacilitator = await db
      .select()
      .from(courses)
      .where(eq(courses.teacher, id));

    if (coursesUsingFacilitator.length > 0) {
      return {
        success: false,
        error: `Não é possível excluir este facilitador pois existem ${coursesUsingFacilitator.length} curso(s) atribuído(s) a ele. Remova o facilitador dos cursos primeiro.`
      };
    }

    // 5. Finalmente deletar o facilitador
    await db.delete(facilitators).where(eq(facilitators.id, id));

    return { success: true };
  }
};
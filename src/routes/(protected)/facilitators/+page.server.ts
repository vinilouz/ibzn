import type { Actions, PageServerLoad } from './$types.js';
import { db } from '$lib/server/db';
import { facilitators } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
  const list = await db.select().from(facilitators);
  return { facilitators: list };
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
    await db.delete(facilitators).where(eq(facilitators.id, id));
    return { success: true };
  }
};
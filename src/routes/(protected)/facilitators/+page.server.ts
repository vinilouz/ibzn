import type { Actions, PageServerLoad } from './$types.js';
import { db } from '$lib/server/db';
import { facilitators } from '$lib/server/db/schema';
import { eq, ilike, or, sql } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url }) => {
  const page = Number(url.searchParams.get('page')) || 1;
  const search = url.searchParams.get('search') || '';
  const limit = 10;
  const offset = (page - 1) * limit;

  let query = db.select().from(facilitators);
  
  if (search) {
    query = query.where(
      or(
        ilike(facilitators.name, `%${search}%`),
        ilike(facilitators.phone, `%${search}%`),
        ilike(facilitators.email, `%${search}%`)
      )
    ) as any;
  }

  const list = await query.limit(limit).offset(offset);
  
  // Get total count for pagination
  const countQuery = search
    ? db.select({ count: sql<number>`count(*)` }).from(facilitators).where(
        or(
          ilike(facilitators.name, `%${search}%`),
          ilike(facilitators.phone, `%${search}%`),
          ilike(facilitators.email, `%${search}%`)
        )
      )
    : db.select({ count: sql<number>`count(*)` }).from(facilitators);
  
  const [{ count }] = await countQuery as any;
  const totalPages = Math.ceil(Number(count) / limit);

  return { 
    facilitators: list,
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
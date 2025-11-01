import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { teachers } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

const runAll = async (q: any) =>
  typeof q.all === 'function' ? await q.all() : await q.execute();

export const load: PageServerLoad = async () => {
  const q = db.select().from(teachers);
  const list = await runAll(q);
  return { teachers: list };
};

const toDateString = (raw: unknown) => {
  if (!raw) return undefined;
  const d = new Date(String(raw));
  if (isNaN(d.getTime())) return String(raw);
  return d.toISOString().slice(0, 10);
};

export const actions: Actions = {
  create: async ({ request }) => {
    const f = await request.formData();
    const values: any = {
      name: String(f.get('name') ?? ''),
      phone: String(f.get('phone') ?? ''),
    };
    if (f.get('email')) values.email = String(f.get('email'));
    const bd = toDateString(f.get('birthdate'));
    if (bd) values.birthdate = bd;
    if (f.get('role')) values.role = String(f.get('role'));

    const q: any = db.insert(teachers).values(values);
    if (typeof q.returning === 'function') await q.returning();
    else await q.execute();

    return { success: true };
  },

  update: async ({ request }) => {
    const f = await request.formData();
    const id = Number(f.get('id'));
    const patch: any = {};
    if (f.get('name')) patch.name = String(f.get('name'));
    if (f.get('phone')) patch.phone = String(f.get('phone'));
    if (f.get('email')) patch.email = String(f.get('email'));
    if (f.get('role')) patch.role = String(f.get('role'));
    if (f.get('birthdate')) {
      const bd = toDateString(f.get('birthdate'));
      if (bd) patch.birthdate = bd;
    }

    await db.update(teachers).set(patch).where(eq(teachers.id,id)).execute();
    return { success: true };
  },

  delete: async ({ request }) => {
    const f = await request.formData();
    const id = Number(f.get('id'));
    await db.delete(teachers).where(eq(teachers.id,id)).execute();
    return { success: true };
  }
};


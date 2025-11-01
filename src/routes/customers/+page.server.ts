import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { customers } from '$lib/server/db/schema';
import {eq} from 'drizzle-orm';


const runAll = async (q: any) =>
  typeof q.all === 'function' ? await q.all() : await q.execute();

const runGet = async (q: any) =>
  typeof q.get === 'function' ? await q.get() : (await q.execute())[0];

export const load: PageServerLoad = async () => {
  const q = db.select().from(customers);
  const list = await runAll(q);
  return { customers: list };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const form = await request.formData();
    const name = String(form.get('name') ?? '');
    const phone = String(form.get('phone') ?? '');
    const address = String(form.get('address') ?? '');
    const role = String(form.get('role') ?? '');

    // transforma a data para string YYYY-MM-DD (ou omite se inválida)
    const bdRaw = form.get('birthdate');
    let birthdate: string | undefined = undefined;
    if (bdRaw) {
      const d = new Date(String(bdRaw));
      if (!isNaN(d.getTime())) birthdate = d.toISOString().slice(0, 10);
      else birthdate = String(bdRaw);
    }

    const values: any = { name, phone, address, role };
    if (birthdate) values.birthdate = birthdate;

    const insertQ: any = db.insert(customers).values(values);
    if (typeof insertQ.returning === 'function') {
      await insertQ.returning();
    } else {
      await insertQ.execute();
    }

    return { success: true };
  },

  update: async ({ request }) => {
    const form = await request.formData();
    const id = Number(form.get('id'));
    const patch: any = {};
    if (form.get('name')) patch.name = String(form.get('name'));
    if (form.get('phone')) patch.phone = String(form.get('phone'));
    if (form.get('address')) patch.address = String(form.get('address'));
    if (form.get('role')) patch.role = String(form.get('role'));
    if (form.get('birthdate')) {
      const d = new Date(String(form.get('birthdate')));
      if (!isNaN(d.getTime())) patch.birthdate = d.toISOString().slice(0, 10);
      else patch.birthdate = String(form.get('birthdate'));
    }


    await db.update(customers).set(patch).where(eq(customers.id,id)).execute();
    return { success: true };
  },

  delete: async ({ request }) => {
    const form = await request.formData();
    const id = Number(form.get('id'));
    await db.delete(customers).where(eq(customers.id,id)).execute();
    return { success: true };
  }
};
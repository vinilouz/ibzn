// src/routes/customers/+page.server.ts
import type { Actions } from './$types';
import { db } from '$lib/server/db';
import { customers } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load = async () => {
  const allCustomers = await db.select().from(customers);
  
  return { 
    customers: allCustomers 
  };
};

export const actions: Actions = {
  create: async ({ request }) => {
    const data = await request.formData();
    const name = data.get('name') as string;
    const phone = data.get('phone') as string;
    const address = data.get('address') as string | null;
    const role = data.get('role') as string | null;
    const birthdate = data.get('birthdate') as string | null;
    
    await db.insert(customers).values({
      name,
      phone,
      address: address || null,
      role: role || null,
      birthdate: birthdate || null
    });
    
    return { success: true };
  },

  update: async ({ request }) => {
    const data = await request.formData();
    const id = Number(data.get('id'));
    const name = data.get('name') as string;
    const phone = data.get('phone') as string;
    const address = data.get('address') as string | null;
    const role = data.get('role') as string | null;
    const birthdate = data.get('birthdate') as string | null;
    
    await db.update(customers)
      .set({ 
        name, 
        phone, 
        address: address || null, 
        role: role || null, 
        birthdate: birthdate || null 
      })
      .where(eq(customers.id, id));
    
    return { success: true };
  },

  delete: async ({ request }) => {
    const data = await request.formData();
    const id = Number(data.get('id'));
    
    await db.delete(customers).where(eq(customers.id, id));
    
    return { success: true };
  }
};
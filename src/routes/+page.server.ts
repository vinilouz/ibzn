import type { PageServerLoad } from './$types.js';
import { db } from '$lib/server/db';
import { facilitators, customers } from '$lib/server/db/schema';

export const load: PageServerLoad = async () => {
  const facilitatorsList = await db.select().from(facilitators);
  const customersList = await db.select().from(customers);
  return {
    facilitators: facilitatorsList,
    customers: customersList
  };
};
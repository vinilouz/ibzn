// src/routes/admin/+page.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {

  if (!locals.user) {
    throw redirect(303, '/');
  }
  

  return {
    user: locals.user,
    session: locals.session
  };
}
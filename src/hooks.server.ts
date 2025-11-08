// src/hooks.server.ts
import { auth } from "$lib/auth";
import { svelteKitHandler } from "better-auth/svelte-kit";
import { building } from "$app/environment";
import { redirect } from "@sveltejs/kit";
import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {

  const response = await svelteKitHandler({ event, resolve, auth, building });
  
  
  if (!building && event.locals.user) {
    const userRole = event.locals.user.role;
    const pathname = event.url.pathname;
    
    
    if (pathname.startsWith('/dashboard/admin') && userRole !== 'admin') {
      throw redirect(303, '/dashboard/outras_roles'); 
    }
   
    if (pathname === '/dashboard/outras_roles' && userRole === 'admin') {
      throw redirect(303, '/dashboard/admin');
    }
  }
  
  if (!building && !event.locals.user && event.url.pathname.startsWith('/dashboard')) {
    throw redirect(303, '/');
  }
  
  return response;
};
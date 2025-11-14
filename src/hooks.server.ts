import { auth } from '$lib/auth.server';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Interceptar rotas do Better Auth
	if (event.url.pathname.startsWith('/auth')) {
		return await auth.handler(event.request);
	}

	return resolve(event);
};
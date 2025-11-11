


import type { RequestEvent } from '@sveltejs/kit';
import { auth } from '$lib/auth.server';
import { error, redirect } from '@sveltejs/kit';

export type Role = 'admin' | 'manager' | 'user' | 'guest';

export async function requireAuth(event: RequestEvent) {
	const session = await auth.api.getSession({ headers: event.request.headers });
	
	if (!session?.user) {
		throw redirect(303, '/login');
	}

	return session.user;
}

export async function requireAdmin(event: RequestEvent) {
	const user = await requireAuth(event);
	
	if (user.role !== 'admin') {
		throw error(403, 'Acesso negado. Apenas administradores.');
	}

	return user;
}

export async function requireManager(event: RequestEvent) {
	const user = await requireAuth(event);
	
	if (user.role !== 'admin' && user.role !== 'manager') {
		throw error(403, 'Acesso negado. Requer permissão de gerente.');
	}

	return user;
}
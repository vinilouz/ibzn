


import type { RequestEvent } from '@sveltejs/kit';
import { auth } from '$lib/auth.server';
import { error, redirect } from '@sveltejs/kit';
import { roleHasCapability, ROLE_CAPABILITIES, type Capability } from '$lib/server/capabilities';

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

export async function requireCapability(event: RequestEvent, capability: Capability) {
	const user = await requireAuth(event);

	if (!roleHasCapability(user.role as Role, capability)) {
		throw error(403, 'Você não tem permissão para realizar esta ação.');
	}

	return user;
}

export async function requireAllCapabilities(event: RequestEvent, capabilities: Capability[]) {
	const user = await requireAuth(event);

	for (const capability of capabilities) {
		if (!roleHasCapability(user.role as Role, capability)) {
			throw error(403, `Você não tem permissão: ${capability}`);
		}
	}

	return user;
}

export async function requireAnyCapability(event: RequestEvent, capabilities: Capability[]) {
	const user = await requireAuth(event);

	const hasAny = capabilities.some(cap => roleHasCapability(user.role as Role, cap));
	if (!hasAny) {
		throw error(403, 'Você não tem permissão para realizar esta ação.');
	}

	return user;
}

export async function requireRole(event: RequestEvent, role: Role) {
	const user = await requireAuth(event);

	if (user.role !== role) {
		throw error(403, `Acesso negado. Requer role: ${role}`);
	}

	return user;
}

export async function hasCapability(event: RequestEvent, capability: Capability): Promise<boolean> {
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (!session?.user) return false;

	return roleHasCapability(session.user.role as Role, capability);
}

export async function getUserCapabilities(event: RequestEvent): Promise<Capability[]> {
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (!session?.user) return [];

	return ROLE_CAPABILITIES[session.user.role as Role] || [];
}
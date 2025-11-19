import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/auth.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	
	// Se já estiver autenticado, redirecionar para o painel
	if (session?.user) {
		throw redirect(302, '/painel');
	}
	
	// Se não estiver autenticado, redirecionar para login
	throw redirect(302, '/login');
};

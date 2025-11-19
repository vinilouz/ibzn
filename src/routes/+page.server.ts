import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/auth.server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	
	if (session?.user) {
		throw redirect(302, '/painel');
	}
	
	throw redirect(302, '/login');
};

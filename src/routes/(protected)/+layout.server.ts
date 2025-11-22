import { redirect } from '@sveltejs/kit';
import { auth } from '$lib/auth.server';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async (event) => {
	const session = await auth.api.getSession({ headers: event.request.headers });

	if (!session?.user) {
		throw redirect(302, '/login');
	}

	return {
		user: session.user
	};
};

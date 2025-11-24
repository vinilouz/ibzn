import { auth } from '$lib/auth.server';
import type { Handle } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { systemSettings } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.pathname.startsWith('/auth')) {
		try {
			return await auth.handler(event.request);
		} catch (error) {
			console.error('Erro no handler do Better Auth:', error);
			throw error;
		}
	}

	let shouldRedirect: string | null = null;

	try {
		const settings = await db
			.select()
			.from(systemSettings)
			.where(eq(systemSettings.key, 'maintenance_mode'))
			.limit(1);

		const isMaintenanceMode = settings.length > 0 && settings[0].value === 'true';

		if (isMaintenanceMode) {
			if (!event.url.pathname.startsWith('/maintenance') &&
				!event.url.pathname.startsWith('/login') &&
				!event.url.pathname.startsWith('/signup') &&
				!event.url.pathname.startsWith('/forgot-password') &&
				!event.url.pathname.startsWith('/reset-password') &&
				!event.url.pathname.startsWith('/auth')) {

				const session = await auth.api.getSession({ headers: event.request.headers });
				const isAdmin = session?.user?.role === 'admin';

				if (!isAdmin) {
					if (session) {
						await auth.api.signOut({ headers: event.request.headers });
					}

					shouldRedirect = '/maintenance';
				}
			}
		} else {
			if (event.url.pathname.startsWith('/maintenance')) {
				shouldRedirect = '/';
			}
		}
	} catch (error) {
		console.error('Error checking maintenance mode:', error);
	}

	if (shouldRedirect) {
		throw redirect(303, shouldRedirect);
	}

	return resolve(event);
};
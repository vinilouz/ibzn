import { auth } from '$lib/auth.server';
import type { Handle } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { systemSettings } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { redirect } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	// Interceptar rotas do Better Auth
	if (event.url.pathname.startsWith('/auth')) {
		return await auth.handler(event.request);
	}

	// Check maintenance mode - redirects must be outside try-catch
	let shouldRedirect: string | null = null;

	try {
		// Use select instead of query API to ensure we get the latest data and avoid schema sync issues
		const settings = await db
			.select()
			.from(systemSettings)
			.where(eq(systemSettings.key, 'maintenance_mode'))
			.limit(1);

		const isMaintenanceMode = settings.length > 0 && settings[0].value === 'true';

		console.log('[Maintenance] Mode:', isMaintenanceMode, 'Path:', event.url.pathname);

		if (isMaintenanceMode) {
			// Allow access to maintenance page, login, signup, and auth routes only
			if (!event.url.pathname.startsWith('/maintenance') &&
				!event.url.pathname.startsWith('/login') &&
				!event.url.pathname.startsWith('/signup') &&
				!event.url.pathname.startsWith('/forgot-password') &&
				!event.url.pathname.startsWith('/reset-password') &&
				!event.url.pathname.startsWith('/auth')) {

				const session = await auth.api.getSession({ headers: event.request.headers });
				const isAdmin = session?.user?.role === 'admin';

				console.log('[Maintenance] User Role:', session?.user?.role, 'Is Admin:', isAdmin);

				if (!isAdmin) {
					console.log('[Maintenance] Redirecting to /maintenance');

					// Auto-logout non-admin users during maintenance
					if (session) {
						await auth.api.signOut({ headers: event.request.headers });
					}

					shouldRedirect = '/maintenance';
				}
			}
		} else {
			// If maintenance is OFF and user is on /maintenance, redirect to home
			if (event.url.pathname.startsWith('/maintenance')) {
				shouldRedirect = '/';
			}
		}
	} catch (error) {
		// If DB error, log and proceed (fail safe - allow access)
		console.error('Error checking maintenance mode:', error);
	}

	// Perform redirect outside of try-catch
	if (shouldRedirect) {
		throw redirect(303, shouldRedirect);
	}

	return resolve(event);
};
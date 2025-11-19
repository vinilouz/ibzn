import { requireAuth } from '$lib/server/middleware/auth';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { rooms, participants } from '$lib/server/db/schema';
import { count } from 'drizzle-orm';

export const load: PageServerLoad = async (event) => {
	const user = await requireAuth(event);
	
	const allRooms = await db.select().from(rooms);
	
	const [participantCount] = await db.select({ count: count() }).from(participants);
	
	return {
		user,
		rooms: allRooms,
		totalParticipants: participantCount?.count || 0
	};
};
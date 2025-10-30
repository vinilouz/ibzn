import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { rooms } from '$lib/server/db/schema';
import { logger } from '$lib/utils/logger';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
    try {
        const allRooms = await db
            .select()
            .from(rooms)
            .orderBy(desc(rooms.status), rooms.createdAt);
        
        return { rooms: allRooms };
    } catch (error) {
        logger.error('Erro ao carregar salas na home:', error);
        return { rooms: [] };
    }
};
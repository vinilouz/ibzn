import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { rooms } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error } from '@sveltejs/kit';
import { logger } from '$lib/utils/logger';

export const load: PageServerLoad = async ({ params }) => {
    try {
        const roomId = parseInt(params.id);
        
        const room = await db
            .select()
            .from(rooms)
            .where(eq(rooms.id, roomId))
            .limit(1);
        
        if (!room.length) {
            throw error(404, 'Sala não encontrada');
        }
        
        return { room: room[0] };
    } catch (err) {
        logger.error('Erro ao carregar sala:', err);
        throw error(404, 'Sala não encontrada');
    }
};
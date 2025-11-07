import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { rooms } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
    console.log('[LOAD] Buscando salas no banco...');
    try {
        const allRooms = await db.select().from(rooms).orderBy(rooms.id);
        console.log('[LOAD] Salas encontradas:', allRooms.length);
        return { rooms: allRooms };
    } catch (error) {
        console.error('[LOAD] Erro ao carregar:', error);
        return { rooms: [] };
    }
};

export const actions: Actions = {
    create: async ({ request }) => {
        try {
            const formData = await request.formData();
            const number = formData.get('number');
            const capacity = formData.get('capacity');
            const status = formData.get('status');
            
            console.log('[CREATE] Dados recebidos:', { number, capacity, status });
            
            if (!number) {
                console.log('[CREATE] Erro: número vazio');
                return fail(400, { error: 'Número da sala é obrigatório' });
            }
            
            const newRoom = {
                number: parseInt(number as string),
                capacity: capacity ? parseInt(capacity as string) : null,
                status: status === 'on'
            };
            
            console.log('[CREATE] Inserindo:', newRoom);
            const [inserted] = await db.insert(rooms).values(newRoom).returning();
            console.log('[CREATE] Sala criada:', inserted);
            
            return { success: true };
        } catch (error) {
            console.error('[CREATE] Erro:', error);
            return fail(500, { error: 'Erro ao criar sala' });
        }
    },
    
    update: async ({ request }) => {
        try {
            const formData = await request.formData();
            const id = formData.get('id');
            const number = formData.get('number');
            const capacity = formData.get('capacity');
            const status = formData.get('status');
            
            if (!id || !number) {
                return fail(400, { error: 'ID e número são obrigatórios' });
            }
            
            console.log('[UPDATE] ID:', id);
            
            const [updated] = await db.update(rooms)
                .set({
                    number: parseInt(number as string),
                    capacity: capacity ? parseInt(capacity as string) : null,
                    status: status === 'on'
                })
                .where(eq(rooms.id, parseInt(id as string)))
                .returning();
            
            console.log('[UPDATE] Sala atualizada:', updated);
            return { success: true };
        } catch (error) {
            console.error('[UPDATE] Erro:', error);
            return fail(500, { error: 'Erro ao atualizar sala' });
        }
    },
    
    delete: async ({ request }) => {
        try {
            const formData = await request.formData();
            const id = formData.get('id');
            
            if (!id) {
                return fail(400, { error: 'ID é obrigatório' });
            }
            
            console.log('[DELETE] ID:', id);
            
            await db.delete(rooms).where(eq(rooms.id, parseInt(id as string)));
            
            console.log('[DELETE] Sala deletada');
            return { success: true };
        } catch (error) {
            console.error('[DELETE] Erro:', error);
            return fail(500, { error: 'Erro ao deletar sala' });
        }
    }
};

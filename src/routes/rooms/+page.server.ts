import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { rooms } from '$lib/server/db/schema';
import { eq, desc } from 'drizzle-orm';
import { fail } from '@sveltejs/kit';
import { logger } from '$lib/utils/logger';
import { z } from 'zod';

const roomSchema = z.object({
    name: z.string().min(1, 'Nome é obrigatório').max(255),
    number: z.number().int().positive('Número deve ser positivo'),
    capacity: z.number().int().positive('Capacidade deve ser positiva').nullable(),
    description: z.string().max(1000).nullable(),
    imageUrl: z.string().nullable(),
    status: z.boolean()
});

export const load: PageServerLoad = async () => {
    try {
        const allRooms = await db
            .select()
            .from(rooms)
            .orderBy(desc(rooms.status), rooms.createdAt);
        
        return { rooms: allRooms };
    } catch (error) {
        logger.error('Erro ao carregar salas:', error);
        return { rooms: [] };
    }
};

export const actions: Actions = {
    create: async ({ request }) => {
        try {
            const formData = await request.formData();
            
            const data = {
                name: formData.get('name') as string,
                number: parseInt(formData.get('number') as string),
                capacity: formData.get('capacity') ? parseInt(formData.get('capacity') as string) : null,
                description: (formData.get('description') as string) || null,
                imageUrl: (formData.get('imageUrl') as string) || null,
                status: formData.get('status') === 'on'
            };
            
            const validated = roomSchema.safeParse(data);
            
            if (!validated.success) {
                return fail(400, { 
                    error: validated.error.issues[0].message,
                    fields: data
                });
            }
            
            await db.insert(rooms).values(validated.data);
            return { success: true };
        } catch (error) {
            logger.error('Erro ao criar sala:', error);
            return fail(500, { error: 'Erro ao criar sala' });
        }
    },
    
    update: async ({ request }) => {
        try {
            const formData = await request.formData();
            const id = parseInt(formData.get('id') as string);
            
            const data = {
                name: formData.get('name') as string,
                number: parseInt(formData.get('number') as string),
                capacity: formData.get('capacity') ? parseInt(formData.get('capacity') as string) : null,
                description: (formData.get('description') as string) || null,
                imageUrl: (formData.get('imageUrl') as string) || null,
                status: formData.get('status') === 'on'
            };
            
            const validated = roomSchema.safeParse(data);
            
            if (!validated.success) {
                return fail(400, { 
                    error: validated.error.issues[0].message,
                    fields: data
                });
            }
            
            await db.update(rooms)
                .set(validated.data)
                .where(eq(rooms.id, id));
            
            return { success: true };
        } catch (error) {
            logger.error('Erro ao atualizar sala:', error);
            return fail(500, { error: 'Erro ao atualizar sala' });
        }
    },
    
    delete: async ({ request }) => {
        try {
            const formData = await request.formData();
            const id = parseInt(formData.get('id') as string);
            
            await db.delete(rooms).where(eq(rooms.id, id));
            return { success: true };
        } catch (error) {
            logger.error('Erro ao deletar sala:', error);
            return fail(500, { error: 'Erro ao deletar sala' });
        }
    }
};

import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export const POST: RequestHandler = async ({ request }) => {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
        }

        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            return json({ error: 'Tipo de arquivo inválido' }, { status: 400 });
        }

        if (file.size > 5 * 1024 * 1024) {
            return json({ error: 'Arquivo muito grande (máx 5MB)' }, { status: 400 });
        }

        const uploadDir = path.join(process.cwd(), 'static', 'uploads', 'rooms');
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const filename = `${timestamp}-${Math.random().toString(36).substring(7)}.${extension}`;
        const filepath = path.join(uploadDir, filename);

        const buffer = Buffer.from(await file.arrayBuffer());
        await writeFile(filepath, buffer);

        const publicUrl = `/uploads/rooms/${filename}`;
        return json({ url: publicUrl });

    } catch (error) {
        console.error('Erro ao fazer upload:', error);
        return json({ error: 'Erro ao fazer upload' }, { status: 500 });
    }
};

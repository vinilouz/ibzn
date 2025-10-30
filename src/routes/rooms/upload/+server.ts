import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { writeFile } from 'fs/promises';
import path from 'path';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file) {
			return json({ error: 'Nenhum arquivo enviado' }, { status: 400 });
		}

		// Validar tipo de arquivo
		const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
		if (!validTypes.includes(file.type)) {
			return json({ error: 'Tipo de arquivo inválido. Use JPG, PNG, GIF ou WebP' }, { status: 400 });
		}

		// Validar tamanho (máx 5MB)
		if (file.size > 5 * 1024 * 1024) {
			return json({ error: 'Arquivo muito grande (máx 5MB)' }, { status: 400 });
		}

		// Gerar nome único
		const timestamp = Date.now();
		const randomStr = Math.random().toString(36).substring(7);
		const extension = file.name.split('.').pop();
		const filename = `${timestamp}-${randomStr}.${extension}`;
		
		// Caminho completo
		const uploadDir = path.join(process.cwd(), 'static', 'uploads', 'rooms');
		const filepath = path.join(uploadDir, filename);

		// Salvar arquivo
		const buffer = Buffer.from(await file.arrayBuffer());
		await writeFile(filepath, buffer);

		// Retornar URL pública
		const publicUrl = `/uploads/rooms/${filename}`;
		
		console.log('Upload realizado:', publicUrl);
		
		return json({ url: publicUrl });

	} catch (error) {
		console.error('Erro ao fazer upload:', error);
		return json({ error: 'Erro ao fazer upload' }, { status: 500 });
	}
};

import { json, type RequestEvent } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { account, user } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export const POST = async ({ request }: RequestEvent) => {
	try {
		const { email, newPassword } = await request.json();

		if (!email || !newPassword) {
			return json({ error: 'Email e senha são obrigatórios' }, { status: 400 });
		}

		// Busca o usuário
		const users = await db.select().from(user).where(eq(user.email, email)).limit(1);
		
		if (!users.length) {
			return json({ error: 'Usuário não encontrado' }, { status: 404 });
		}

		const targetUser = users[0];

		// Busca a conta credential
		const accounts = await db.select().from(account).where(eq(account.userId, targetUser.id));
		const credentialAccount = accounts.find(acc => acc.providerId === 'credential');

		if (!credentialAccount) {
			return json({ error: 'Conta credential não encontrada' }, { status: 404 });
		}

		// Gera novo hash
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		// Atualiza
		await db.update(account)
			.set({ 
				password: hashedPassword,
				updatedAt: new Date()
			})
			.where(eq(account.id, credentialAccount.id));

		return json({ 
			success: true, 
			message: 'Senha resetada com sucesso',
			user: { email: targetUser.email, role: targetUser.role }
		});

	} catch (error) {
		console.error('[reset-password] Erro:', error);
		return json({ 
			error: 'Erro ao resetar senha',
			details: error instanceof Error ? error.message : 'desconhecido'
		}, { status: 500 });
	}
};

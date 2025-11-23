import { fail, redirect, type Actions } from '@sveltejs/kit';
import { auth } from '$lib/auth.server';
import { db } from '$lib/server/db';
import { systemSettings } from '$lib/server/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { cache } from '$lib/server/cache';
    
export const load = async (event: any) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (!session) throw redirect(302, '/login');

	const isAdmin = session.user.role === 'admin';
	
	// Cache com TTL diferente: settings muda pouco (5min), users muda mais (1min)
	const [settings, users] = await Promise.all([
		cache.get(
			'settings:maintenance',
			() => db.select({ value: systemSettings.value })
				.from(systemSettings)
				.where(eq(systemSettings.key, 'maintenance_mode'))
				.limit(1),
			300000 // 5 minutos
		),
		isAdmin 
			? cache.get(
					`users:admin-manager`,
					async () => {
						const { user: userTable } = await import('$lib/server/db/schema');
						return db.select({
							id: userTable.id,
							name: userTable.name,
							email: userTable.email,
							role: userTable.role
						})
						.from(userTable)
						.where(inArray(userTable.role, ['admin', 'manager']));
					},
					60000 // 1 minuto
				)
			: Promise.resolve([])
	]);

	return {
		user: session.user,
		maintenanceMode: settings[0]?.value === 'true',
		users
	};
};

export const actions: Actions = {
	updateProfile: async (event) => {
		const session = await auth.api.getSession({ headers: event.request.headers });
		if (!session) return fail(401, { message: 'Não autorizado' });

		const formData = await event.request.formData();
		const name = formData.get('name') as string;

		if (!name) return fail(400, { message: 'Nome é obrigatório' });

		try {
			await auth.api.updateUser({
				headers: event.request.headers,
				body: { name }
			});
			return { success: true, message: 'Perfil atualizado com sucesso!' };
		} catch (error) {
			console.error('Erro ao atualizar perfil:', error);
			return fail(500, { message: 'Erro ao atualizar perfil' });
		}
	},

	changePassword: async (event) => {
		const session = await auth.api.getSession({ headers: event.request.headers });
		if (!session) return fail(401, { message: 'Não autorizado' });
		if (session.user.role !== 'admin') return fail(403, { message: 'Acesso negado. Apenas administradores podem alterar senha.' });

		const formData = await event.request.formData();
		const newPassword = formData.get('newPassword') as string;
		const confirmPassword = formData.get('confirmPassword') as string;

		if (!newPassword || !confirmPassword) return fail(400, { message: 'Nova senha e confirmação são obrigatórios' });
		if (newPassword !== confirmPassword) return fail(400, { message: 'As senhas não coincidem' });
		if (newPassword.length < 8) return fail(400, { message: 'A senha deve ter no mínimo 8 caracteres' });

		try {
			await auth.api.setPassword({
				body: { newPassword },
				headers: event.request.headers
			});
			return { success: true, message: 'Senha alterada com sucesso!' };
		} catch (error) {
			console.error('Erro ao alterar senha:', error);
			return fail(500, { message: 'Erro ao alterar senha.' });
		}
	},

	toggleMaintenance: async (event) => {
		const session = await auth.api.getSession({ headers: event.request.headers });
		if (!session || session.user.role !== 'admin') return fail(403, { message: 'Acesso negado' });

		const enabled = (await event.request.formData()).get('enabled') === 'true';

		try {
			await db.insert(systemSettings)
				.values({ key: 'maintenance_mode', value: String(enabled) })
				.onConflictDoUpdate({
					target: systemSettings.key,
					set: { value: String(enabled) }
				});
			
			// Invalidar cache de settings
			cache.invalidate('settings:maintenance');
			
			return { success: true, message: `Modo de manutenção ${enabled ? 'ativado' : 'desativado'}` };
		} catch (error) {
			console.error('Erro ao alterar modo de manutenção:', error);
			return fail(500, { message: 'Erro ao alterar modo de manutenção' });
		}
	},

	updateUserRole: async (event) => {
		const session = await auth.api.getSession({ headers: event.request.headers });
		if (!session || session.user.role !== 'admin') return fail(403, { message: 'Acesso negado' });

		const formData = await event.request.formData();
		const userId = formData.get('userId') as string;
		const newRole = formData.get('role') as string;

		if (!userId || !['admin', 'manager'].includes(newRole)) return fail(400, { message: 'Dados inválidos' });

		try {
			const { user: userTable } = await import('$lib/server/db/schema');
			await db.update(userTable)
				.set({ role: newRole as 'admin' | 'manager' })
				.where(eq(userTable.id, userId));
			
			// Invalidar cache de users
			cache.invalidate('users:admin-manager');
			
			return { success: true, message: 'Role atualizada com sucesso!' };
		} catch (error) {
			console.error('Erro ao atualizar role:', error);
			return fail(500, { message: 'Erro ao atualizar role' });
		}
	},

	deleteUser: async (event) => {
		const session = await auth.api.getSession({ headers: event.request.headers });
		if (!session || session.user.role !== 'admin') return fail(403, { message: 'Acesso negado' });

		const userId = (await event.request.formData()).get('userId') as string;
		if (!userId) return fail(400, { message: 'ID do usuário não fornecido' });
		if (userId === session.user.id) return fail(400, { message: 'Você não pode excluir sua própria conta desta forma' });

		try {
			const { user: userTable, attendanceLists } = await import('$lib/server/db/schema');
			
			// Deletar em paralelo attendance_lists e user (user tem cascade para account/session)
			await Promise.all([
				db.delete(attendanceLists).where(eq(attendanceLists.createdBy, userId)),
				db.delete(userTable).where(eq(userTable.id, userId))
			]);

			// Invalidar cache de users
			cache.invalidate('users:admin-manager');

			return { success: true, message: 'Usuário excluído com sucesso!' };
		} catch (error) {
			console.error('Erro ao excluir usuário:', error);
			return fail(500, { message: 'Erro ao excluir usuário' });
		}
	},

	deleteAccount: async (event) => {
		const session = await auth.api.getSession({ headers: event.request.headers });
		if (!session) return fail(401, { message: 'Não autorizado' });
		if (session.user.role !== 'admin') return fail(403, { message: 'Acesso negado. Apenas administradores podem excluir conta.' });

		const formData = await event.request.formData();
		const confirmation = formData.get('confirmation') as string;
		if (confirmation !== 'EXCLUIR') return fail(400, { message: 'Confirmação inválida' });

		try {
			await auth.api.signOut({ headers: event.request.headers });
			throw redirect(302, '/login');
		} catch (error) {
			if (error instanceof Response) throw error;
			console.error('Erro ao excluir conta:', error);
			return fail(500, { message: 'Erro ao excluir conta' });
		}
	}
};

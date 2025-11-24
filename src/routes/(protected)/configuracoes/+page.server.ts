import { fail, redirect, type Actions } from '@sveltejs/kit';
import { auth } from '$lib/auth.server';
import { db } from '$lib/server/db';
import { systemSettings } from '$lib/server/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { cache } from '$lib/server/cache';
import bcryptjs from 'bcryptjs';

export const load = async (event: any) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	if (!session) throw redirect(302, '/login');

	const isAdmin = session.user.role === 'admin';

	const [settings, users] = await Promise.all([
		cache.get(
			'settings:maintenance',
			() => db.select({ value: systemSettings.value })
				.from(systemSettings)
				.where(eq(systemSettings.key, 'maintenance_mode'))
				.limit(1),
			300000
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
				60000
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
		} catch {
			return fail(500, { message: 'Erro ao atualizar perfil' });
		}
	},

	changePassword: async (event) => {
		const session = await auth.api.getSession({ headers: event.request.headers });
		if (!session) return fail(401, { message: 'Não autorizado' });
		if (session.user.role !== 'admin') return fail(403, { message: 'Acesso negado. Apenas administradores podem alterar senha.' });

		const formData = await event.request.formData();
		const currentPassword = formData.get('currentPassword') as string;
		const newPassword = formData.get('newPassword') as string;
		const confirmPassword = formData.get('confirmPassword') as string;

		if (!currentPassword || !newPassword || !confirmPassword) return fail(400, { message: 'Todos os campos são obrigatórios' });
		if (newPassword !== confirmPassword) return fail(400, { message: 'As senhas não coincidem' });
		if (newPassword.length < 8) return fail(400, { message: 'A senha deve ter no mínimo 8 caracteres' });

		try {
			await auth.api.changePassword({
				body: {
					currentPassword,
					newPassword
				},
				headers: event.request.headers
			});
			return { success: true, message: 'Senha alterada com sucesso!' };
		} catch (error: any) {
			if (error?.message?.includes('Invalid password') || error?.body?.message?.includes('Invalid password')) {
				return fail(400, { message: 'Senha atual incorreta' });
			}
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

			cache.invalidate('settings:maintenance');

			return { success: true, message: `Modo de manutenção ${enabled ? 'ativado' : 'desativado'}` };
		} catch {
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

			cache.invalidate('users:admin-manager');

			return { success: true, message: 'Role atualizada com sucesso!' };
		} catch {
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

			await Promise.all([
				db.delete(attendanceLists).where(eq(attendanceLists.createdBy, userId)),
				db.delete(userTable).where(eq(userTable.id, userId))
			]);

			cache.invalidate('users:admin-manager');

			return { success: true, message: 'Usuário excluído com sucesso!' };
		} catch {
			return fail(500, { message: 'Erro ao excluir usuário' });
		}
	},

	createManager: async (event) => {
		const session = await auth.api.getSession({ headers: event.request.headers });
		if (!session || session.user.role !== 'admin') return fail(403, { message: 'Acesso negado' });

		const formData = await event.request.formData();
		const name = formData.get('name') as string;
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		if (!name || !email || !password) {
			return fail(400, { message: 'Todos os campos são obrigatórios' });
		}

		if (password.length < 8) {
			return fail(400, { message: 'A senha deve ter no mínimo 8 caracteres' });
		}

		try {
			await auth.api.signUpEmail({
				body: {
					name,
					email,
					password,
					role: 'manager'
				}
			});

			cache.invalidate('users:admin-manager');
			return { success: true, message: 'Manager criado com sucesso!' };
		} catch (error: any) {
			if (error?.message?.includes('already exists') || error?.body?.message?.includes('already exists')) {
				return fail(400, { message: 'Este email já está em uso' });
			}
			return fail(500, { message: 'Erro ao criar manager' });
		}
	},

	changeManagerPassword: async (event) => {
		const session = await auth.api.getSession({ headers: event.request.headers });
		if (!session || session.user.role !== 'admin') return fail(403, { message: 'Acesso negado' });

		const formData = await event.request.formData();
		const userId = formData.get('userId') as string;
		const newPassword = formData.get('newPassword') as string;

		if (!userId || !newPassword) {
			return fail(400, { message: 'Todos os campos são obrigatórios' });
		}

		if (newPassword.length < 8) {
			return fail(400, { message: 'A senha deve ter no mínimo 8 caracteres' });
		}

		try {
			const { user: userTable, account } = await import('$lib/server/db/schema');
			const targetUser = await db.select().from(userTable).where(eq(userTable.id, userId)).limit(1);

			if (!targetUser.length) {
				return fail(400, { message: 'Usuário não encontrado' });
			}

			if (targetUser[0].role !== 'manager') {
				return fail(400, { message: 'Apenas managers podem ter senha alterada por esta função' });
			}

			const hashedPassword = await bcryptjs.hash(newPassword, 10);

			const result = await db.update(account)
				.set({ password: hashedPassword })
				.where(eq(account.userId, userId))
				.returning();

			if (!result || result.length === 0) {
				return fail(500, { message: 'Erro: Conta não encontrada no banco de dados' });
			}

			return { success: true, message: 'Senha do manager alterada com sucesso!' };
		} catch (error) {
			console.error('[changeManagerPassword] Erro:', error);
			return fail(500, { message: `Erro ao alterar senha: ${error instanceof Error ? error.message : 'Erro desconhecido'}` });
		}
	},

	deleteAccount: async (event) => {
		const session = await auth.api.getSession({ headers: event.request.headers });
		if (!session) return fail(401, { message: 'Não autorizado' });
		if (session.user.role !== 'admin') return fail(403, { message: 'Acesso negado. Apenas administradores podem excluir conta.' });

		const formData = await event.request.formData();
		const password = formData.get('password') as string;
		const confirmation = formData.get('confirmation') as string;

		if (!password) return fail(400, { message: 'Senha é obrigatória' });
		if (confirmation !== 'EXCLUIR') return fail(400, { message: 'Confirmação inválida' });

		try {
			await auth.api.signInEmail({
				body: {
					email: session.user.email,
					password
				}
			});

			await auth.api.signOut({ headers: event.request.headers });
			throw redirect(302, '/login');
		} catch (error: any) {
			if (error instanceof Response) throw error;
			if (error?.message?.includes('Invalid') || error?.body?.message?.includes('Invalid')) {
				return fail(400, { message: 'Senha incorreta' });
			}
			return fail(500, { message: 'Erro ao excluir conta' });
		}
	}
};

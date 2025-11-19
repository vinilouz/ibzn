import { fail, redirect, type Actions } from '@sveltejs/kit';
import { auth } from '$lib/auth.server';

export const load = async (event: any) => {
	const session = await auth.api.getSession({ headers: event.request.headers });
	
	if (!session) {
		throw redirect(302, '/login');
	}

	return {
		user: session.user
	};
};

export const actions: Actions = {
	updateProfile: async (event) => {
		const session = await auth.api.getSession({ headers: event.request.headers });
		
		if (!session) {
			return fail(401, { message: 'Não autorizado' });
		}

		const formData = await event.request.formData();
		const name = formData.get('name') as string;
		const email = formData.get('email') as string;

		if (!name || !email) {
			return fail(400, { message: 'Nome e email são obrigatórios' });
		}

		try {
			await auth.api.updateUser({
				headers: event.request.headers,
				body: {
					name
				}
			});

			return { success: true, message: 'Perfil atualizado com sucesso!' };
		} catch (error) {
			console.error('Erro ao atualizar perfil:', error);
			return fail(500, { message: 'Erro ao atualizar perfil' });
		}
	},

	changePassword: async (event) => {
		const session = await auth.api.getSession({ headers: event.request.headers });
		
		if (!session) {
			return fail(401, { message: 'Não autorizado' });
		}

		const formData = await event.request.formData();
		const currentPassword = formData.get('currentPassword') as string;
		const newPassword = formData.get('newPassword') as string;
		const confirmPassword = formData.get('confirmPassword') as string;

		if (!currentPassword || !newPassword || !confirmPassword) {
			return fail(400, { message: 'Todos os campos são obrigatórios' });
		}

		if (newPassword !== confirmPassword) {
			return fail(400, { message: 'As senhas não coincidem' });
		}

		if (newPassword.length < 8) {
			return fail(400, { message: 'A senha deve ter no mínimo 8 caracteres' });
		}

		try {
			await auth.api.changePassword({
				headers: event.request.headers,
				body: {
					currentPassword,
					newPassword,
					revokeOtherSessions: false
				}
			});

			return { success: true, message: 'Senha alterada com sucesso!' };
		} catch (error) {
			console.error('Erro ao alterar senha:', error);
			return fail(500, { message: 'Erro ao alterar senha. Verifique sua senha atual.' });
		}
	},

	deleteAccount: async (event) => {
		const session = await auth.api.getSession({ headers: event.request.headers });
		
		if (!session) {
			return fail(401, { message: 'Não autorizado' });
		}

		const formData = await event.request.formData();
		const password = formData.get('password') as string;
		const confirmation = formData.get('confirmation') as string;

		if (!password || confirmation !== 'EXCLUIR') {
			return fail(400, { message: 'Confirmação inválida' });
		}

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

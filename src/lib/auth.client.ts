import { createAuthClient } from 'better-auth/svelte';

// Cliente principal do Better Auth
export const authClient = createAuthClient({
	baseURL: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173',
	basePath: '/auth'
});

// Exportar helpers para uso nos componentes
export const {
	signIn,
	signUp,
	signOut,
	useSession
} = authClient;
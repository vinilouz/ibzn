import { createAuthClient } from 'better-auth/svelte';

export const authClient = createAuthClient();

export const signOut = async () => {
	const data = await authClient.signOut();
	return data;
};

export const { useSession } = createAuthClient();
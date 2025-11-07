<script lang="ts">
	import { authClient } from '$lib/auth.client';
	import { onMount } from 'svelte';

	let user: any = $state(null);
	let loading = $state(true);

	onMount(async () => {
		const session = await authClient.getSession();
		user = session.data?.user || null;
		loading = false;

		// Redirecionar para o painel se já estiver autenticado
		if (user) {
			window.location.href = '/painel';
		} else {
			// Redirecionar para login se não estiver autenticado
			window.location.href = '/login';
		}
	});
</script>

{#if loading}
	<div class="flex items-center justify-center min-h-screen">
		<div class="text-center">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
			<p class="text-gray-600">Carregando...</p>
		</div>
	</div>
{/if}

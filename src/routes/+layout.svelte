<script lang="ts">
	import '../app.css';

	let { children } = $props();

	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

	onMount(() => {
		// Se o usuário estiver logado e tentar acessar a página de login, redirecione para home
		if ($page.data.user && $page.url.pathname === '/login') {
			goto('/');
		}
	});

	import type { LayoutServerData } from './$types';
	import LogoutButton from '$lib/components/logout-button.svelte';

	export const load: LayoutServerData = async (event) => {
		return {
			user: event.locals.user || null,
			session: event.locals.session || null
		};
	};
</script>

<div class="flex justify-end p-4">
	<LogoutButton />
</div>
{@render children()}

<script lang="ts">
	import { authClient } from '$lib/auth.client';
	import { onMount } from 'svelte';
	import { SidebarProvider, SidebarInset, SidebarTrigger } from '$lib/components/ui/sidebar';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import { ModeWatcher } from 'mode-watcher'; //tema claro/escuro
	import ThemeButton from '$lib/components/theme-button.svelte'; //botão tema claro/escuro

	let { children } = $props();
	let user: any = $state(null);
	let loading = $state(true);

	onMount(async () => {
		const session = await authClient.getSession();
		user = session.data?.user || null;
		loading = false;

		// Redirecionar se não estiver autenticado
		if (!user) {
			window.location.href = '/login';
		}
	});

	const sidebarItems = $derived([
		{
			title: "Dashboard",
			url: "/painel",
			iconKey: "dashboard"
		},
		{
			title: "Salas",
			url: "/salas",
			iconKey: "salas"
		}
	]);
</script>

<ModeWatcher />

{#if loading}
	<div class="flex items-center justify-center min-h-screen">
		<div class="text-center">Carregando...</div>
	</div>
{:else if user}
	<SidebarProvider>
		<Sidebar {sidebarItems} user={user} />
		<SidebarInset>
			<header class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]:h-12">
				<div class="flex items-center gap-2 px-4">
					<SidebarTrigger class="-ml-1" />
					<Separator orientation="vertical" class="mr-2 h-4" />
					<div class="flex items-center gap-4 flex-1">
						<h1 class="text-lg font-semibold">IBZN</h1>
					</div>

					<ThemeButton />

				</div>
			</header>
			<main class="flex flex-1 flex-col gap-4 p-4 pt-0">
				{@render children?.()}
			</main>
		</SidebarInset>
	</SidebarProvider>
{/if}
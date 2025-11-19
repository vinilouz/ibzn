<script lang="ts">
	import { authClient } from '$lib/auth.client';
	import { onMount } from 'svelte';
	import { SidebarProvider, SidebarInset, SidebarTrigger } from '$lib/components/ui/sidebar';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import { ModeWatcher } from 'mode-watcher'; 
	import ThemeButton from '$lib/components/theme-button.svelte'; 

	let { children } = $props();
	let user: any = $state(null);
	let loading = $state(true);

	onMount(async () => {
		const session = await authClient.getSession();
		user = session.data?.user || null;
		loading = false;

		
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
		},
		{

			title: "Pessoas",
			url: "#",
			iconKey: "pessoas"
		},
		{

			title: "Cursos",
			url: "/cursos",
			iconKey: "courses"

		},
		{
			title: "Financeiro",
			url: "/financeiro",
			iconKey: "financeiro"
		},
		{
			title: "Pagamentos",
			url: "/payments",
			iconKey: "pagamentos"
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
				<div class="flex items-center gap-2 px-4 w-full">
					<SidebarTrigger class="-ml-1" />
					<Separator orientation="vertical" class="mr-2 h-4" />
					<div class="flex items-center gap-4 flex-1">
						<h1 class="text-lg font-semibold">IBZN</h1>
					</div>

					<!-- Role Badge -->
					{#if user?.role}
						<div class="px-3 py-1 rounded-full text-xs font-medium {
							user.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
							user.role === 'manager' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
							'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
						}">
							{user.role === 'admin' ? ' Admin' :
							 user.role === 'manager' ? ' Manager' :
							 user.role.charAt(0).toUpperCase() + user.role.slice(1)}
						</div>
					{/if}

					<ThemeButton />

				</div>
			</header>
			<main class="flex flex-1 flex-col gap-4 p-4 pt-0">
				{@render children?.()}
			</main>
		</SidebarInset>
	</SidebarProvider>
{/if}
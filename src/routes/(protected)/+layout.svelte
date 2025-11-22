<script lang="ts">
	import { SidebarProvider, SidebarInset, SidebarTrigger } from '$lib/components/ui/sidebar';
	import Sidebar from '$lib/components/Sidebar.svelte';
	import { Separator } from '$lib/components/ui/separator';
	import { ModeWatcher } from 'mode-watcher'; 
	import ThemeButton from '$lib/components/theme-button.svelte'; 

	let { children, data } = $props();
	const user = data.user;

	const allSidebarItems = [
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
			title: "Agendamentos",
			url: "/calendar",
			iconKey: "agendamentos"
		},
		{
			title: "Matrículas",
			url: "/matriculas",
			iconKey: "matriculas"
		},
		{
			title: "Presença",
			url: "/presenca",
			iconKey: "presenca"
		},
		{
			title: "Financeiro",
			url: "/financeiro",
			iconKey: "financeiro",
			adminOnly: true
		},
		{
			title: "Pagamentos",
			url: "/payments",
			iconKey: "pagamentos"
		}
	];

	// Filtrar itens da sidebar baseado na role
	const sidebarItems = $derived(
		user?.role === 'admin' 
			? allSidebarItems 
			: allSidebarItems.filter(item => !item.adminOnly)
	);
</script>

<ModeWatcher />

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
							'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
						}">
							{user.role === 'admin' ? 'Admin' : 'Manager'}
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
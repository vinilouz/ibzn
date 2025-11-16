<script lang="ts">
	import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '$lib/components/ui/sidebar';
	import { page } from '$app/stores';
	import { Home, Building2, Settings, LogOut, User, Plus, List, ChevronDown, BookOpenText } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { authClient } from '$lib/auth.client';
	import Logo from '$lib/components/Logo.svelte';
	import { goto } from '$app/navigation';
	import { slide } from 'svelte/transition';

	let {
		sidebarItems = [],
		user = null
	}: {
		sidebarItems: any[];
		user: any;
	} = $props();

	let roomsExpanded = $state(false);
	let collapsed = $state(false);
	let coursesExpanded = $state(false);

	const getIcon = (iconKey: string) => {
		switch (iconKey) {
			case 'dashboard':
				return Home;
			case 'salas':
				return Building2;
			case 'settings':
				return Settings;
			case 'courses':
				return BookOpenText;
			default:
				return Home;
		}
	};

	const navigateTo = (url: string) => {
		window.location.href = url;
	};

	const handleSignOut = async () => {
		await authClient.signOut();
		window.location.href = '/login';
	};

	</script>

<Sidebar class="border-r bg-background/95 backdrop-blur-sm">
	<SidebarHeader class="border-b border-sidebar-border">
		<div class="flex items-center justify-center p-6">
			<Logo fill="#fff" width={160} />
		</div>
	</SidebarHeader>

	<SidebarContent class="px-4 py-6 flex flex-col h-full">
		<SidebarMenu class="space-y-3 flex-1">
			{#each sidebarItems as item}
				{@const IconComponent = getIcon(item.iconKey)}
				
				{#if item.title === 'Salas'}
					<SidebarMenuItem>
						<SidebarMenuButton
							class="w-full justify-between h-12 rounded-lg transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground {$page.url.pathname.includes('/salas') ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm' : ''}"
							onclick={() => {
								if (collapsed) {
									collapsed = false;
								}
								roomsExpanded = !roomsExpanded;
							}}
						>
							<IconComponent class="h-5 w-5" />
							<span class="text-sm font-medium flex-1">{item.title}</span>
							<ChevronDown
								class="h-4 w-4 transition-transform duration-200"
								style="transform: rotate({roomsExpanded ? '180' : '0'}deg);"
							/>
						</SidebarMenuButton>

						{#if roomsExpanded && !collapsed}
							<div class="ml-8 mt-2 space-y-2" transition:slide={{ duration: 200 }}>
								<Button
									variant={$page.url.searchParams.get('view') === 'create' ? 'secondary' : 'ghost'}
									class="w-full justify-start text-sm h-10 px-4"
									onclick={() => goto('/salas?view=create')}
								>
									<Plus class="mr-3 h-4 w-4" />
									Criar Sala
								</Button>
								<Button
									variant={$page.url.pathname === '/salas' &&
									$page.url.searchParams.get('view') !== 'create'
										? 'secondary'
										: 'ghost'}
									class="w-full justify-start text-sm h-10 px-4"
									onclick={() => goto('/salas?view=list')}
								>
									<List class="mr-3 h-4 w-4" />
									Ver Salas
								</Button>
							</div>
						{/if}
					</SidebarMenuItem>
				
				{:else if item.title === 'Cursos'}
					<!-- Add Courses dropdown -->
					<SidebarMenuItem>
						<SidebarMenuButton
							class="w-full justify-between h-12 rounded-lg transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground {$page.url.pathname.includes('/cursos') ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm' : ''}"
							onclick={() => {
								if (collapsed) {
									collapsed = false;
								}
								coursesExpanded = !coursesExpanded;
							}}
						>
							<IconComponent class="h-5 w-5" />
							<span class="text-sm font-medium flex-1">{item.title}</span>
							<ChevronDown
								class="h-4 w-4 transition-transform duration-200"
								style="transform: rotate({coursesExpanded ? '180' : '0'}deg);"
							/>
						</SidebarMenuButton>

						{#if coursesExpanded && !collapsed}
							<div class="ml-8 mt-2 space-y-2" transition:slide={{ duration: 200 }}>
								<Button
									variant={$page.url.searchParams.get('view') === 'create' ? 'secondary' : 'ghost'}
									class="w-full justify-start text-sm h-10 px-4"
									onclick={() => goto('/cursos?view=create')}
								>
									<Plus class="mr-3 h-4 w-4" />
									Criar Curso
								</Button>
								<Button
									variant={$page.url.pathname === '/cursos' &&
									$page.url.searchParams.get('view') !== 'create'
										? 'secondary'
										: 'ghost'}
									class="w-full justify-start text-sm h-10 px-4"
									onclick={() => goto('/cursos?view=list')}
								>
									<List class="mr-3 h-4 w-4" />
									Ver Cursos
								</Button>
							</div>
						{/if}
					</SidebarMenuItem>
				{:else}
					<!-- Regular menu items -->
					<SidebarMenuItem>
						<SidebarMenuButton
							class="w-full justify-start h-12 rounded-lg transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground {$page.url.pathname === item.url ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm' : ''}"
							onclick={() => navigateTo(item.url)}
						>
							<IconComponent class="h-5 w-5 mr-3" />
							<span class="text-sm font-medium">{item.title}</span>
						</SidebarMenuButton>
					</SidebarMenuItem>
				{/if}
			{/each}

			<Separator class="my-6" />

			<SidebarMenuItem>
				<SidebarMenuButton
					class="w-full justify-start h-12 rounded-lg transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground"
					onclick={() => navigateTo('/painel/configuracoes')}
				>
					<Settings class="h-5 w-5 mr-3" />
					<span class="text-sm font-medium">Configurações</span>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>

		<SidebarMenu class="mt-auto">
			<SidebarMenuItem>
				<SidebarMenuButton
					class="w-full justify-start h-12 rounded-lg transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground focus:bg-destructive focus:text-destructive-foreground"
					onclick={handleSignOut}
				>
					<LogOut class="h-5 w-5 mr-3" />
					<span class="text-sm font-medium">Sair</span>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	</SidebarContent>

	<SidebarFooter class="p-4 border-t border-sidebar-border">
		<div class="flex items-center gap-3">
			<div class="text-sidebar-foreground rounded-lg p-2 bg-muted">
				<User class="h-5 w-5" />
			</div>
			<div class="flex-1 min-w-0">
				<p class="text-sm font-medium text-foreground truncate">
					{user?.name || 'Usuário'}
				</p>
				<p class="text-xs text-muted-foreground truncate">
					{user?.email}
				</p>
			</div>
		</div>
	</SidebarFooter>
</Sidebar>
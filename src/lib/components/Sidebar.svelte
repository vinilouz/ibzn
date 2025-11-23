<script lang="ts">
	import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '$lib/components/ui/sidebar';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button';
	import { Home, Building2, Settings, LogOut, User, Plus, List, ChevronDown, Users, UserCircle, DollarSign, TrendingUp, BookOpenText, GraduationCap, ClipboardCheck, Calendar } from 'lucide-svelte';
	import { Separator } from '$lib/components/ui/separator';
	import { authClient } from '$lib/auth.client';
	import Logo from '$lib/components/Logo.svelte';
	import { goto, preloadData } from '$app/navigation';
	import { slide } from 'svelte/transition';

	let {
		sidebarItems = [],
		user = null
	}: {
		sidebarItems: any[];
		user: any;
	} = $props();

	let roomsExpanded = $state(false);
	let peopleExpanded = $state(false);
	let coursesExpanded = $state(false);
	let collapsed = $state(false);

	const getIcon = (iconKey: string) => {
		switch (iconKey) {
			case 'dashboard':
				return Home;
			case 'salas':
				return Building2;
			case 'pessoas':
				return Users;
			case 'facilitadores':
				return Users;
			case 'clientes':
				return UserCircle;
			case 'matriculas':
				return GraduationCap;
			case 'presenca':
				return ClipboardCheck;
			case 'pagamentos':
				return DollarSign;
			case 'financeiro':
				return TrendingUp;
			case 'settings':
				return Settings;
			case 'courses':
				return BookOpenText;
			case 'agendamentos':
				return Calendar;
			default:
				return Home;
		}
	};

	const navigateTo = (url: string) => {
		goto(url);
	};

	const handleSignOut = async () => {
		await authClient.signOut();
		goto('/login');
	};

	</script>

<Sidebar class="border-r bg-background/95 backdrop-blur-sm sidebar-custom-scrollbar">
	<SidebarHeader class="border-b border-sidebar-border">
		<div class="flex items-center justify-center p-6">
			<Logo fill="#fff" width={160} />
		</div>
	</SidebarHeader>

	<SidebarContent class="px-4 py-6 flex flex-col h-full custom-scrollbar">
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
				{:else if item.title === 'Pessoas'}
					<SidebarMenuItem>
						<SidebarMenuButton
							class="w-full justify-between h-12 rounded-lg transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground {$page.url.pathname.includes('/facilitators') || $page.url.pathname.includes('/participants') ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm' : ''}"
							onclick={() => {
								if (collapsed) {
									collapsed = false;
								}
								peopleExpanded = !peopleExpanded;
							}}
						>
							<IconComponent class="h-5 w-5" />
							<span class="text-sm font-medium flex-1">{item.title}</span>
							<ChevronDown
								class="h-4 w-4 transition-transform duration-200"
								style="transform: rotate({peopleExpanded ? '180' : '0'}deg);"
							/>
						</SidebarMenuButton>

						{#if peopleExpanded && !collapsed}
							<div class="ml-8 mt-2 space-y-2" transition:slide={{ duration: 200 }}>
								<Button
									variant={$page.url.pathname === '/facilitators' ? 'secondary' : 'ghost'}
									class="w-full justify-start text-sm h-10 px-4"
									onclick={() => goto('/facilitators')}
								>
									<Users class="mr-3 h-4 w-4" />
									Facilitadores
								</Button>
								<Button
									variant={$page.url.pathname === '/participants' ? 'secondary' : 'ghost'}
									class="w-full justify-start text-sm h-10 px-4"
									onclick={() => goto('/participants')}
								>
									<UserCircle class="mr-3 h-4 w-4" />
									Participantes
								</Button>
							</div>
						{/if}
					</SidebarMenuItem>
				{:else if item.title === 'Cursos'}
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
							onmouseenter={() => preloadData(item.url)}
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
					class="w-full justify-start h-12 rounded-lg transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground {$page.url.pathname === '/configuracoes' ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm' : ''}"
					onclick={() => navigateTo('/configuracoes')}
					onmouseenter={() => preloadData('/configuracoes')}
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

<style>
	/* Custom scrollbar styling - minimal and always visible */
	:global(.custom-scrollbar) {
		scrollbar-width: thin;
		scrollbar-color: hsl(var(--muted-foreground) / 0.15) transparent;
	}

	:global(.custom-scrollbar::-webkit-scrollbar) {
		width: 4px;
	}

	:global(.custom-scrollbar::-webkit-scrollbar-track) {
		background: transparent;
	}

	:global(.custom-scrollbar::-webkit-scrollbar-thumb) {
		background-color: hsl(var(--muted-foreground) / 0.15);
		border-radius: 2px;
		transition: background-color 0.2s ease;
	}

	:global(.custom-scrollbar::-webkit-scrollbar-thumb:hover) {
		background-color: hsl(var(--muted-foreground) / 0.3);
	}
</style>
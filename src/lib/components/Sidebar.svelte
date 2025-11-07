<script lang="ts">
	import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter } from '$lib/components/ui/sidebar';
	import { page } from '$app/stores';
	import { Home, Building2, Settings, LogOut, User, Menu } from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button';
	import { Separator } from '$lib/components/ui/separator';
	import { authClient } from '$lib/auth.client';
	import Logo from '$lib/components/Logo.svelte';

	export let sidebarItems: any[] = [];
	export let user: any = null;

	const getIcon = (iconKey: string) => {
		switch (iconKey) {
			case 'dashboard':
				return Home;
			case 'salas':
				return Building2;
			case 'settings':
				return Settings;
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
		<div class="flex items-center justify-center p-4">
			<Logo fill="#fff" width={180} />
		</div>
	</SidebarHeader>

	<SidebarContent class="px-3 py-4 flex flex-col h-full">
		<SidebarMenu class="space-y-2 flex-1">
			{#each sidebarItems as item}
				{@const IconComponent = getIcon(item.iconKey)}
				<SidebarMenuItem>
					<SidebarMenuButton
						class="w-full justify-start h-11 rounded-lg transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:bg-sidebar-accent focus:text-sidebar-accent-foreground {$page.url.pathname === item.url ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium shadow-sm' : ''}"
						onclick={() => navigateTo(item.url)}
					>
						<IconComponent class="h-5 w-5" />
						<span class="text-sm">{item.title}</span>
					</SidebarMenuButton>
				</SidebarMenuItem>
			{/each}

			<Separator class="my-4" />

			<SidebarMenuItem>
				<SidebarMenuButton
					class="w-full justify-start h-11 rounded-lg transition-all duration-200 hover:bg-muted hover:text-muted-foreground focus:bg-muted focus:text-muted-foreground"
					onclick={() => navigateTo('/painel/configuracoes')}
				>
					<Settings class="h-5 w-5" />
					<span class="text-sm">Configurações</span>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>

		<SidebarMenu class="mt-auto">
			<SidebarMenuItem>
				<SidebarMenuButton
					class="w-full justify-start h-11 rounded-lg transition-all duration-200 hover:bg-destructive hover:text-destructive-foreground focus:bg-destructive focus:text-destructive-foreground"
					onclick={handleSignOut}
				>
					<LogOut class="h-5 w-5" />
					<span class="text-sm">Sair</span>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	</SidebarContent>

	<SidebarFooter class="p-4 border-t border-border bg-muted">
		<div class="flex items-center gap-3">
			<div class="text-sidebar-foreground rounded-lg p-2">
				<User class="h-6 w-6" />
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
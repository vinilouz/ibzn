<script lang="ts">
    import '../app.css';
    import favicon from '$lib/assets/favicon.svg';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { Button } from '$lib/components/ui/button';
    import { ChevronLeft, ChevronRight, Home, DoorOpen, Plus, List } from 'lucide-svelte';
    import { slide } from 'svelte/transition';

    let { children } = $props();
    let collapsed = $state(false);
    let roomsExpanded = $state(true);
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<div class="flex h-screen bg-gray-100">
    <aside class="bg-white border-r border-gray-200 flex flex-col transition-all duration-300 {collapsed ? 'w-16' : 'w-64'}">
        <div class="p-4 border-b border-gray-200 flex items-center justify-between">
            {#if !collapsed}
                <h1 class="text-2xl font-bold text-gray-800">IBZN</h1>
            {/if}
            <Button
                variant="ghost"
                size="icon"
                onclick={() => collapsed = !collapsed}
                class="ml-auto"
            >
                {#if collapsed}
                    <ChevronRight class="h-4 w-4" />
                {:else}
                    <ChevronLeft class="h-4 w-4" />
                {/if}
            </Button>
        </div>

        <nav class="flex-1 p-4 space-y-2">
            <Button
                variant={$page.url.pathname === '/' ? 'secondary' : 'ghost'}
                class="w-full {collapsed ? 'justify-center' : 'justify-start'}"
                onclick={() => goto('/')}
            >
                <Home class="h-4 w-4 {collapsed ? '' : 'mr-2'}" />
                {#if !collapsed}
                    <span>Início</span>
                {/if}
            </Button>

            <div class="space-y-1">
                <Button
                    variant="ghost"
                    class="w-full {collapsed ? 'justify-center' : 'justify-between'}"
                    onclick={() => {
                        if (collapsed) {
                            collapsed = false;
                        }
                        roomsExpanded = !roomsExpanded;
                    }}
                >
                    <div class="flex items-center">
                        <DoorOpen class="h-4 w-4 {collapsed ? '' : 'mr-2'}" />
                        {#if !collapsed}
                            <span>Salas</span>
                        {/if}
                    </div>
                    {#if !collapsed}
                        <span class="text-xs transition-transform duration-200 {roomsExpanded ? 'rotate-180' : ''}">
                            ▼
                        </span>
                    {/if}
                </Button>

                {#if roomsExpanded && !collapsed}
                    <div class="ml-6 space-y-1" transition:slide={{ duration: 200 }}>
                        <Button
                            variant={$page.url.searchParams.get('view') === 'create' ? 'secondary' : 'ghost'}
                            class="w-full justify-start text-sm"
                            onclick={() => goto('/rooms?view=create')}
                        >
                            <Plus class="h-4 w-4 mr-2" />
                            Criar Sala
                        </Button>
                        <Button
                            variant={$page.url.pathname === '/rooms' && $page.url.searchParams.get('view') !== 'create' ? 'secondary' : 'ghost'}
                            class="w-full justify-start text-sm"
                            onclick={() => goto('/rooms?view=list')}
                        >
                            <List class="h-4 w-4 mr-2" />
                            Ver Salas
                        </Button>
                    </div>
                {/if}
            </div>
        </nav>

        {#if !collapsed}
            <div class="p-4 border-t border-gray-200">
                <p class="text-xs text-gray-500 text-center">© 2025 IBZN</p>
            </div>
        {/if}
    </aside>

    <main class="flex-1 overflow-auto">
        {@render children?.()}
    </main>
</div>

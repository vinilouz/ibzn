<script lang="ts">
    import '../app.css';
    import favicon from '$lib/assets/favicon.svg';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import { Button } from '$lib/components/ui/button';

    let { children } = $props();
    let roomsExpanded = $state(true);
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<div class="flex h-screen bg-gray-100">
    <aside class="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div class="p-6 border-b border-gray-200">
            <h1 class="text-2xl font-bold text-gray-800">IBZN</h1>
        </div>

        <nav class="flex-1 p-4 space-y-2">
            <Button
                variant={$page.url.pathname === '/' ? 'secondary' : 'ghost'}
                class="w-full justify-start"
                onclick={() => goto('/')}
            >
                Início
            </Button>

            <div class="space-y-1">
                <Button
                    variant="ghost"
                    class="w-full justify-between"
                    onclick={() => roomsExpanded = !roomsExpanded}
                >
                    <span>Salas</span>
                    <span class="text-xs">{roomsExpanded ? '▼' : '▶'}</span>
                </Button>

                {#if roomsExpanded}
                    <div class="ml-6 space-y-1">
                        <Button
                            variant={$page.url.searchParams.get('view') === 'create' ? 'secondary' : 'ghost'}
                            class="w-full justify-start text-sm"
                            onclick={() => goto('/rooms?view=create')}
                        >
                            Criar Sala
                        </Button>
                        <Button
                            variant={$page.url.pathname === '/rooms' && $page.url.searchParams.get('view') !== 'create' ? 'secondary' : 'ghost'}
                            class="w-full justify-start text-sm"
                            onclick={() => goto('/rooms?view=list')}
                        >
                            Ver Salas
                        </Button>
                    </div>
                {/if}
            </div>
        </nav>

        <div class="p-4 border-t border-gray-200">
            <p class="text-xs text-gray-500 text-center">© 2025 IBZN</p>
        </div>
    </aside>

    <main class="flex-1 overflow-auto">
        {@render children?.()}
    </main>
</div>

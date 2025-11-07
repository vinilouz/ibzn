<script lang="ts">
    import { goto } from '$app/navigation';
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
    import { ArrowLeft, Users, DoorOpen, ImageOff, Calendar } from 'lucide-svelte';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

<div class="p-8 max-w-4xl mx-auto">
    <div class="mb-6">
        <Button variant="ghost" onclick={() => goto('/')}>
            <ArrowLeft class="h-4 w-4 mr-2" />
            Voltar
        </Button>
    </div>

    <Card>
        {#if data.room.imageUrl}
            <div class="aspect-video w-full overflow-hidden rounded-t-lg">
                <img src={data.room.imageUrl} alt={data.room.name} class="w-full h-full object-cover" />
            </div>
        {:else}
            <div class="aspect-video w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-t-lg">
                <ImageOff class="h-24 w-24 text-gray-400" />
            </div>
        {/if}

        <CardHeader>
            <div class="flex items-start justify-between">
                <div>
                    <CardTitle class="text-3xl mb-2">{data.room.name}</CardTitle>
                    <div class="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span>Sala #{data.room.number}</span>
                        {#if data.room.createdAt}
                            <span class="flex items-center gap-1">
                                <Calendar class="h-4 w-4" />
                                {new Date(data.room.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                        {/if}
                    </div>
                </div>
                <span class="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold {data.room.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                    {data.room.status ? 'Ativa' : 'Inativa'}
                </span>
            </div>
            
            {#if data.room.description}
                <CardDescription class="text-base">
                    {data.room.description}
                </CardDescription>
            {/if}
        </CardHeader>

        <CardContent class="space-y-6">
            <div class="grid grid-cols-2 gap-4">
                <Card>
                    <CardHeader class="pb-3">
                        <CardTitle class="text-sm font-medium text-muted-foreground">Capacidade</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div class="flex items-center gap-2">
                            <Users class="h-5 w-5 text-muted-foreground" />
                            <span class="text-2xl font-bold">
                                {data.room.capacity || 'Sem limite'}
                            </span>
                            {#if data.room.capacity}
                                <span class="text-muted-foreground">pessoas</span>
                            {/if}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader class="pb-3">
                        <CardTitle class="text-sm font-medium text-muted-foreground">Número</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div class="flex items-center gap-2">
                            <DoorOpen class="h-5 w-5 text-muted-foreground" />
                            <span class="text-2xl font-bold">#{data.room.number}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div class="flex gap-2 pt-4">
                <Button class="flex-1" disabled={!data.room.status}>
                    Alocar Usuário
                </Button>
                <Button variant="outline" onclick={() => goto('/salas?view=create')}>
                    Editar Sala
                </Button>
            </div>
        </CardContent>
    </Card>
</div>
<script lang="ts">
    import { Button } from '$lib/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
    import { DoorOpen, Users, ImageOff, UserPlus, Calendar } from 'lucide-svelte';
    import { goto } from '$app/navigation';
    import type { PageData } from './$types';

    let { data }: { data: PageData } = $props();
</script>

<div class="p-8 max-w-7xl mx-auto">
    <div class="mb-8">
        <h1 class="text-3xl font-bold mb-2">Bem-vindo ao IBZN</h1>
        <p class="text-muted-foreground">Sistema de gerenciamento de salas e alocações</p>
    </div>

    {#if data.rooms && data.rooms.length > 0}
        <!-- Estatísticas -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium">Total de Salas</CardTitle>
                    <DoorOpen class="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold">{data.rooms.length}</div>
                    <p class="text-xs text-muted-foreground">
                        {data.rooms.filter(r => r.status).length} ativas
                    </p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium">Capacidade Total</CardTitle>
                    <Users class="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div class="text-2xl font-bold">
                        {data.rooms.reduce((acc, room) => acc + (room.capacity || 0), 0)}
                    </div>
                    <p class="text-xs text-muted-foreground">pessoas no total</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle class="text-sm font-medium">Ações Rápidas</CardTitle>
                    <Calendar class="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Button class="w-full" size="sm" onclick={() => goto('/rooms?view=create')}>
                        <DoorOpen class="h-4 w-4 mr-2" />
                        Nova Sala
                    </Button>
                </CardContent>
            </Card>
        </div>

        <!-- Salas Criadas -->
        <div class="mb-6">
            <h2 class="text-2xl font-semibold mb-4">Salas Criadas</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {#each data.rooms as room (room.id)}
                <Card class="overflow-hidden hover:shadow-lg transition-shadow">
                    <!-- Imagem da Sala -->
                    <div class="aspect-video w-full bg-gray-100 relative">
                        {#if room.imageUrl}
                            <img src={room.imageUrl} alt={room.name} class="w-full h-full object-cover" />
                        {:else}
                            <div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                                <ImageOff class="h-16 w-16 text-gray-400" />
                            </div>
                        {/if}
                        <div class="absolute top-2 right-2">
                            <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold backdrop-blur-sm {room.status ? 'bg-green-100/90 text-green-800' : 'bg-red-100/90 text-red-800'}">
                                {room.status ? 'Ativa' : 'Inativa'}
                            </span>
                        </div>
                        <div class="absolute bottom-2 left-2">
                            <span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-black/50 text-white backdrop-blur-sm">
                                Sala #{room.number}
                            </span>
                        </div>
                    </div>

                    <!-- Informações da Sala -->
                    <CardHeader>
                        <CardTitle class="text-xl">{room.name}</CardTitle>
                        {#if room.description}
                            <CardDescription class="line-clamp-2 min-h-[2.5rem]">
                                {room.description}
                            </CardDescription>
                        {:else}
                            <CardDescription class="min-h-[2.5rem] text-muted-foreground/50">
                                Sem descrição
                            </CardDescription>
                        {/if}
                    </CardHeader>

                    <CardContent class="space-y-4">
                        <!-- Capacidade e Data -->
                        <div class="flex items-center justify-between text-sm text-muted-foreground">
                            {#if room.capacity}
                                <div class="flex items-center gap-1.5">
                                    <Users class="h-4 w-4" />
                                    <span class="font-medium">{room.capacity}</span>
                                    <span>pessoas</span>
                                </div>
                            {:else}
                                <div class="flex items-center gap-1.5 text-muted-foreground/50">
                                    <Users class="h-4 w-4" />
                                    <span>Sem limite</span>
                                </div>
                            {/if}
                            <div class="text-xs">
                                {room.createdAt ? new Date(room.createdAt).toLocaleDateString('pt-BR') : '-'}
                            </div>
                        </div>

                        <!-- Botões de Ação -->
                        <div class="flex gap-2">
                            <Button class="flex-1" variant={room.status ? 'default' : 'secondary'} disabled={!room.status} onclick={() => alert(`Alocar usuário para ${room.name}`)}>
                                <UserPlus class="h-4 w-4 mr-2" />
                                Alocar Usuário
                            </Button>
                            <Button variant="outline" size="icon" onclick={() => goto(`/rooms/${room.id}`)}>
                                <DoorOpen class="h-4 w-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            {/each}
        </div>
    {:else}
        <!-- Estado Vazio -->
        <Card class="mt-8">
            <CardContent class="py-16">
                <div class="text-center">
                    <div class="mb-4 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100">
                        <DoorOpen class="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 class="text-lg font-semibold mb-2">Nenhuma sala cadastrada</h3>
                    <p class="text-muted-foreground mb-6 max-w-sm mx-auto">
                        Comece criando sua primeira sala para começar a gerenciar alocações e recursos
                    </p>
                    <Button onclick={() => goto('/rooms?view=create')}>
                        <DoorOpen class="h-4 w-4 mr-2" />
                        Criar Primeira Sala
                    </Button>
                </div>
            </CardContent>
        </Card>
    {/if}
</div>

<script lang="ts">
    import { enhance } from '$app/forms';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import type { PageData } from './$types';
    import { Button } from '$lib/components/ui/button';
    import { Input } from '$lib/components/ui/input';
    import { Label } from '$lib/components/ui/label';
    import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
    import {
        Table,
        TableBody,
        TableCell,
        TableHead,
        TableHeader,
        TableRow
    } from '$lib/components/ui/table';

    let { data }: { data: PageData } = $props();

    let editingRoom = $state<number | null>(null);
    let formData = $state({
        capacity: '',
        number: '',
        status: true
    });

    let activeView = $derived.by(() => {
        const view = $page.url.searchParams.get('view');
        return view === 'create' ? 'create' : 'list';
    }) as 'list' | 'create';

    $effect(() => {
        console.log('[PAGE] Dados recebidos:', data);
        console.log('[PAGE] Total de salas:', data.rooms?.length || 0);
    });

    function startEdit(room: any) {
        editingRoom = room.id;
        formData = {
            capacity: room.capacity?.toString() || '',
            number: room.number?.toString() || '',
            status: room.status ?? true
        };
        goto('/rooms?view=create');
    }

    function cancelEdit() {
        editingRoom = null;
        formData = {
            capacity: '',
            number: '',
            status: true
        };
        goto('/rooms?view=list');
    }
</script>

<div class="p-8 max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">Gerenciamento de Salas</h1>

    {#if activeView === 'list'}
        <Card>
            <CardHeader>
                <CardTitle>Salas Cadastradas ({data.rooms?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
                <div class="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Número</TableHead>
                                <TableHead>Capacidade</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Criado em</TableHead>
                                <TableHead class="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {#if data.rooms && data.rooms.length > 0}
                                {#each data.rooms as room (room.id)}
                                    <TableRow>
                                        <TableCell class="font-medium">{room.id}</TableCell>
                                        <TableCell>{room.number}</TableCell>
                                        <TableCell>{room.capacity}</TableCell>
                                        <TableCell>
                                            <span
                                                class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold {room.status
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'}"
                                            >
                                                {room.status ? 'Ativa' : 'Inativa'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {room.createdAt
                                                ? new Date(room.createdAt).toLocaleDateString('pt-BR')
                                                : '-'}
                                        </TableCell>
                                        <TableCell class="text-right">
                                            <div class="flex justify-end gap-2">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onclick={() => startEdit(room)}
                                                >
                                                    Editar
                                                </Button>
                                                <form
                                                    method="POST"
                                                    action="?/delete"
                                                    use:enhance={() => {
                                                        return async ({ update }) => {
                                                            await update();
                                                        };
                                                    }}
                                                    class="inline"
                                                    onsubmit={(e) => {
                                                        if (!confirm('Tem certeza que deseja excluir esta sala?')) {
                                                            e.preventDefault();
                                                        }
                                                    }}
                                                >
                                                    <input type="hidden" name="id" value={room.id} />
                                                    <Button type="submit" variant="destructive" size="sm">
                                                        Excluir
                                                    </Button>
                                                </form>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                {/each}
                            {:else}
                                <TableRow>
                                    <TableCell colspan={6} class="h-24 text-center">
                                        Nenhuma sala encontrada. Crie sua primeira sala!
                                    </TableCell>
                                </TableRow>
                            {/if}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    {:else}
        <Card>
            <CardHeader>
                <CardTitle>
                    {editingRoom ? 'Editar Sala' : 'Nova Sala'}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form
                    method="POST"
                    action="?/{editingRoom ? 'update' : 'create'}"
                    use:enhance={() => {
                        return async ({ update }) => {
                            await update();
                            cancelEdit();
                        };
                    }}
                    class="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    {#if editingRoom}
                        <input type="hidden" name="id" value={editingRoom} />
                    {/if}

                    <div class="space-y-2">
                        <Label for="number">Número da Sala</Label>
                        <Input
                            type="number"
                            id="number"
                            name="number"
                            bind:value={formData.number}
                            required
                            placeholder="Ex: 101"
                        />
                    </div>

                    <div class="space-y-2">
                        <Label for="capacity">Capacidade</Label>
                        <Input
                            type="number"
                            id="capacity"
                            name="capacity"
                            bind:value={formData.capacity}
                            required
                            placeholder="Ex: 30"
                        />
                    </div>

                    <div class="flex items-center space-x-2 pt-8">
                        <input
                            type="checkbox"
                            id="status"
                            name="status"
                            bind:checked={formData.status}
                            class="w-4 h-4 rounded border-gray-300"
                        />
                        <Label for="status" class="!mt-0 cursor-pointer">Ativa</Label>
                    </div>

                    <div class="md:col-span-2 flex gap-2">
                        <Button type="submit">
                            {editingRoom ? 'Atualizar Sala' : 'Criar Sala'}
                        </Button>
                        {#if editingRoom}
                            <Button type="button" variant="outline" onclick={cancelEdit}>
                                Cancelar
                            </Button>
                        {/if}
                    </div>
                </form>
            </CardContent>
        </Card>
    {/if}
</div>

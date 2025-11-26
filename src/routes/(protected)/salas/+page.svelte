<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { goto, invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';
	import { enhanceWithLoadingAndCallback } from '$lib/utils/enhance';
	import { showLoading, hideLoading } from '$lib/stores/loading';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Switch } from '$lib/components/ui/switch';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { X, Upload, Plus, Eye, Search } from 'lucide-svelte';
	import * as Select from '$lib/components/ui/select';
	import Pagination from '$lib/components/Pagination.svelte';

	interface RoomFormData {
		name: string;
		capacity: string;
		number: string;
		description: string;
		imageUrl: string;
		status: boolean;
		facilitatorId: string;
	}

	let { data }: { data: PageData } = $props();

	let editingRoom = $state<number | null>(null);
	let localPreview = $state<string | null>(null);
	let uploadingImage = $state(false);
	let currentPage = $state(1);
	const itemsPerPage = 10;
	let searchTerm = $state('');
	let searchBy = $state<'name' | 'number' | 'capacity'>('name');
	let showActiveRooms = $state(true);

	const initialFormData: RoomFormData = {
		name: '',
		capacity: '',
		number: '',
		description: '',
		imageUrl: '',
		status: true,
		facilitatorId: ''
	};

	let formData = $state<RoomFormData>({ ...initialFormData });

	const activeView = $derived.by(() => {
		const view = $page.url.searchParams.get('view');
		return view === 'create' || view === 'edit' ? 'form' : 'list';
	});

	$effect(() => {
		const view = $page.url.searchParams.get('view');
		const id = $page.url.searchParams.get('id');

		if (view === 'edit' && id) {
			loadRoomForEdit(parseInt(id));
		} else if (view === 'create') {
			resetForm();
		}
	});

	const imagePreview = $derived(localPreview || formData.imageUrl || null);
	const isEditing = $derived(editingRoom !== null);

	function loadRoomForEdit(roomId: number) {
		if (editingRoom === roomId) return;

		const room = data.rooms?.find((r) => r.id === roomId);
		if (room) {
			editingRoom = roomId;
			formData = {
				name: room.name || '',
				capacity: room.capacity?.toString() || '',
				number: room.number?.toString() || '',
				description: room.description || '',
				imageUrl: room.imageUrl || '',
				status: room.status ?? true,
				facilitatorId: room.facilitatorId?.toString() || ''
			};
			localPreview = null;
		}
	}

	function startEdit(room: any) {
		editingRoom = room.id;
		formData = {
			name: room.name || '',
			capacity: room.capacity?.toString() || '',
			number: room.number?.toString() || '',
			description: room.description || '',
			imageUrl: room.imageUrl || '',
			status: room.status ?? true,
			facilitatorId: room.facilitatorId?.toString() || ''
		};
		localPreview = null;
		goto(`/salas?view=edit&id=${room.id}`);
	}

	function resetForm() {
		editingRoom = null;
		formData = { ...initialFormData };
		localPreview = null;
	}

	function cancelEdit() {
		resetForm();
		goto('/salas?view=list');
	}

	function navigateToCreate() {
		resetForm();
		goto('/salas?view=create');
	}

	async function handleImageSelect(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		localPreview = URL.createObjectURL(file);
		uploadingImage = true;

		const uploadFormData = new FormData();
		uploadFormData.append('file', file);

		try {
			const response = await fetch('/api/upload', {
				method: 'POST',
				body: uploadFormData
			});

			const result = await response.json();

			if (response.ok && result.url) {
				formData.imageUrl = result.url;
			} else {
				console.error('Erro ao fazer upload:', result.error);
				alert('Erro ao fazer upload da imagem: ' + (result.error || 'Erro desconhecido'));
				localPreview = null;
			}
		} catch (error) {
			console.error('Erro ao fazer upload:', error);
			alert('Erro ao fazer upload da imagem');
			localPreview = null;
		} finally {
			uploadingImage = false;
		}
	}

	function removeImage() {
		formData.imageUrl = '';
		localPreview = null;
	}

	const handleFormSubmit = () => enhanceWithLoadingAndCallback({
		loadingMessage: isEditing ? 'Atualizando sala...' : 'Criando sala...',
		onSuccess: () => {
			resetForm();
			goto('/salas?view=list');
		}
	});

	function formatDate(date: Date | string | null) {
		if (!date) return '-';
		return new Date(date).toLocaleDateString('pt-BR');
	}

	const filteredRooms = $derived.by(() => {
		const rooms = data.rooms || [];

		return rooms.filter(room => {
			const statusMatch = room.status === showActiveRooms;

			if (!searchTerm.trim()) return statusMatch;

			let searchMatch = false;

			switch (searchBy) {
				case 'name':
					searchMatch = room.name.toLowerCase().includes(searchTerm.toLowerCase());
					break;
				case 'number':
					searchMatch = room.number?.toString().includes(searchTerm) ?? false;
					break;
				case 'capacity':
					searchMatch = room.capacity?.toString().includes(searchTerm) ?? false;
					break;
				default:
					searchMatch = true;
			}

			return statusMatch && searchMatch;
		});
	});

	const paginatedRooms = $derived.by(() => {
		const start = (currentPage - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		return filteredRooms.slice(start, end);
	});

	$effect(() => {
		searchTerm;
		searchBy;
		showActiveRooms;
		currentPage = 1;
	});
</script>

<div class="mx-auto w-full max-w-7xl p-8">
	<div class="mb-8 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Gerenciamento de Salas</h1>
		{#if activeView === 'list'}
			<Button onclick={navigateToCreate}>
				<Plus class="mr-2 h-4 w-4" />
				Nova Sala
			</Button>
		{/if}
	</div>

	{#if activeView === 'list'}
		<Card>
			<CardHeader>
				<CardTitle>Salas Cadastradas ({data.rooms?.length || 0})</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="mb-4 flex gap-2">
					<div class="relative flex-1">
						<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							type="text"
							placeholder="Buscar sala..."
							bind:value={searchTerm}
							class="pl-10"
						/>
					</div>
					<select
						bind:value={searchBy}
						class="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						<option value="name">Nome</option>
						<option value="number">Número</option>
						<option value="capacity">Capacidade</option>
					</select>
					<div class="flex items-center gap-2 px-3 h-10 rounded-md border border-input bg-background">
						<Switch bind:checked={showActiveRooms} />
						<Label class="text-sm cursor-pointer whitespace-nowrap">
							{showActiveRooms ? 'Sala Ativa' : 'Sala Inativa'}
						</Label>
					</div>
				</div>

				{#if filteredRooms.length === 0 && searchTerm}
					<p class="text-sm text-muted-foreground text-center py-8">
						Nenhuma sala encontrada com {searchBy === 'name' ? 'nome' : searchBy === 'number' ? 'número' : 'capacidade'} "{searchTerm}"
					</p>
				{:else}
					<div class="rounded-md border">
						<Table>
						<TableHeader>
							<TableRow>
								<TableHead>ID</TableHead>
								<TableHead>Nome</TableHead>
								<TableHead>Número</TableHead>
								<TableHead>Capacidade</TableHead>
								<TableHead>Imagem</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Criado em</TableHead>
								<TableHead class="text-right">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{#if paginatedRooms && paginatedRooms.length > 0}
								{#each paginatedRooms as room (room.id)}
									<TableRow>
										<TableCell class="font-medium">{room.id}</TableCell>
										<TableCell>{room.name}</TableCell>
										<TableCell>{room.number}</TableCell>
										<TableCell>{room.capacity || '-'}</TableCell>
										<TableCell>
											{#if room.imageUrl}
												<div class="h-10 w-10 overflow-hidden rounded">
													<img
														src={room.imageUrl}
														alt={room.name}
														class="h-full w-full object-cover"
													/>
												</div>
											{:else}
												<span class="text-xs text-gray-400">Sem imagem</span>
											{/if}
										</TableCell>
										<TableCell>
											<span
												class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold {room.status
													? 'bg-green-100 text-green-800'
													: 'bg-red-100 text-red-800'}"
											>
												{room.status ? 'Ativa' : 'Inativa'}
											</span>
										</TableCell>
										<TableCell>{formatDate(room.createdAt)}</TableCell>
										<TableCell class="text-right">
											<div class="flex justify-end gap-2">
												<Button variant="ghost" size="sm" onclick={() => goto(`/salas/${room.id}`)}>
													<Eye class="h-4 w-4" />
												</Button>
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
														if (!confirm('Tem certeza que deseja excluir esta sala?')) {
															return ({ update }) => update({ reset: false });
														}
														
														showLoading('Excluindo sala...');
														
													return async ({ result, update }) => {
													try {
														if (result.type === 'success') {
															await invalidateAll();
															await update();
														} else if (result.type === 'failure') {
															const errorMsg = result.data?.error || 'Erro desconhecido ao deletar sala';
															alert(errorMsg);
															await update({ reset: false });
														}
														} finally {
															hideLoading();
														}
														};
													}}
													class="inline"
												>
													<input type="hidden" name="id" value={room.id} />
													<Button type="submit" variant="destructive" size="sm">Excluir</Button>
												</form>
											</div>
										</TableCell>
									</TableRow>
								{/each}
							{:else}
								<TableRow>
									<TableCell colspan={8} class="h-24 text-center">
										Nenhuma sala encontrada. Crie sua primeira sala!
									</TableCell>
								</TableRow>
							{/if}
						</TableBody>
					</Table>
				</div>
				<Pagination
					bind:currentPage
					totalItems={filteredRooms.length}
					{itemsPerPage}
					onPageChange={() => {}}
				/>
				{/if}
			</CardContent>
		</Card>
	{:else}
		<Card>
			<CardHeader>
				<CardTitle>
					{isEditing ? 'Editar Sala' : 'Nova Sala'}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<form
					method="POST"
					action="?/{isEditing ? 'update' : 'create'}"
					use:enhance={handleFormSubmit()}
					class="space-y-6"
				>
					{#if isEditing}
						<input type="hidden" name="id" value={editingRoom} />
					{/if}

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label for="name">Nome da Sala *</Label>
							<Input
								type="text"
								id="name"
								name="name"
								bind:value={formData.name}
								required
								placeholder="Ex: Sala Principal"
								
							/>
						</div>

						<div class="space-y-2">
							<Label for="number">Número da Sala *</Label>
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
								placeholder="Ex: 30"
								
							/>
						</div>

						<div class="space-y-2">
							<Label for="facilitatorId">Facilitador Responsável</Label>
							<Select.Root type="single" bind:value={formData.facilitatorId}>
								<Select.Trigger>
									{data.facilitators?.find((f) => f.id.toString() === formData.facilitatorId)
										?.name || 'Selecione um facilitador'}
								</Select.Trigger>
								<Select.Content>
									{#if data.facilitators}
										{#each data.facilitators as facilitator}
											<Select.Item value={facilitator.id.toString()}>{facilitator.name}</Select.Item
											>
										{/each}
									{/if}
								</Select.Content>
							</Select.Root>
							<input type="hidden" name="facilitatorId" value={formData.facilitatorId} />
						</div>

						<div class="space-y-2">
							<Label for="status" class="flex items-center justify-between">
								<span>Status da Sala</span>
								<Switch id="status" name="status" bind:checked={formData.status} />
							</Label>
							<p class="text-sm text-muted-foreground">
								{formData.status ? 'Sala ativa e disponível' : 'Sala desativada'}
							</p>
						</div>
					</div>

					<div class="space-y-2">
						<Label for="description">Descrição</Label>
						<Textarea
							id="description"
							name="description"
							bind:value={formData.description}
							placeholder="Descreva a sala, seus recursos, etc..."
							rows={4}
							
						/>
					</div>

					<div class="space-y-4">
						<Label>Imagem da Sala</Label>

						{#if uploadingImage}
							<div class="rounded-lg border-2 border-dashed p-8">
								<div class="flex flex-col items-center justify-center gap-2 text-muted-foreground">
									<div
										class="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"
									></div>
									<span class="font-medium">Fazendo upload da imagem...</span>
								</div>
							</div>
						{:else if imagePreview}
							<div class="relative h-64 w-full overflow-hidden rounded-lg border">
								<img src={imagePreview} alt="Preview" class="h-full w-full object-cover" />
								<Button
									type="button"
									variant="destructive"
									size="sm"
									class="absolute top-2 right-2"
									onclick={removeImage}
								>
									<X class="mr-1 h-4 w-4" /> Remover
								</Button>
							</div>
						{:else}
							<label for="imageFile" class="block cursor-pointer">
								<div
									class="rounded-lg border-2 border-dashed p-8 transition-colors hover:border-primary"
								>
									<div
										class="flex flex-col items-center justify-center gap-2 text-muted-foreground"
									>
										<Upload class="h-12 w-12" />
										<span class="font-medium">Clique para escolher uma imagem</span>
										<span class="text-xs">JPG, PNG, GIF ou WebP (máx 5MB)</span>
									</div>
								</div>
							</label>
						{/if}

						<input type="hidden" name="imageUrl" value={formData.imageUrl} />
						<input
							type="file"
							id="imageFile"
							accept="image/*"
							onchange={handleImageSelect}
							class="hidden"
						/>
					</div>

					<div class="flex gap-2 pt-4">
						<Button type="submit" disabled={uploadingImage}>
							{isEditing ? 'Atualizar Sala' : 'Criar Sala'}
						</Button>
						<Button type="button" variant="outline" onclick={cancelEdit}>
							Cancelar
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	{/if}
</div>

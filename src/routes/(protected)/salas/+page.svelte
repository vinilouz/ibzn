<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
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
	import { ImagePlus, X, Upload, Loader2 } from 'lucide-svelte';

	let { data }: { data: PageData } = $props();

	let editingRoom = $state<number | null>(null);
	let formData = $state({
		name: '',
		capacity: '',
		number: '',
		description: '',
		imageUrl: '',
		status: true
	});
	let imagePreview = $state<string | null>(null);
	let uploading = $state(false);
	let localPreview = $state<string | null>(null);

	let activeView = $derived.by(() => {
		const view = $page.url.searchParams.get('view');
		const id = $page.url.searchParams.get('id');

		if (view === 'edit' && id) {
			const roomId = parseInt(id);
			const room = data.rooms?.find((r) => r.id === roomId);
			if (room && editingRoom !== roomId) {
				editingRoom = roomId;
				formData = {
					name: room.name || '',
					capacity: room.capacity?.toString() || '',
					number: room.number?.toString() || '',
					description: room.description || '',
					imageUrl: room.imageUrl || '',
					status: room.status ?? true
				};
				imagePreview = room.imageUrl || null;
				localPreview = null;
			}
			return 'create';
		}

		return view === 'create' ? 'create' : 'list';
	}) as 'list' | 'create';

	function startEdit(room: any) {
		editingRoom = room.id;
		formData = {
			name: room.name || '',
			capacity: room.capacity?.toString() || '',
			number: room.number?.toString() || '',
			description: room.description || '',
			imageUrl: room.imageUrl || '',
			status: room.status ?? true
		};
		imagePreview = room.imageUrl || null;
		localPreview = null;
		goto(`/salas?view=edit&id=${room.id}`);
	}
	function cancelEdit() {
		editingRoom = null;
		formData = {
			name: '',
			capacity: '',
			number: '',
			description: '',
			imageUrl: '',
			status: true
		};
		imagePreview = null;
		localPreview = null;
		goto('/salas?view=list');
	}

	async function handleImageUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];

		if (!file) return;

		uploading = true;

		try {
			const uploadFormData = new FormData();
			uploadFormData.append('file', file);

			const response = await fetch('/api/upload', {
				method: 'POST',
				body: uploadFormData
			});

			const result = await response.json();

			if (response.ok) {
				formData.imageUrl = result.url;
				imagePreview = result.url;
			} else {
				alert(result.error || 'Erro ao fazer upload');
			}
		} catch (error) {
			console.error('Erro:', error);
			alert('Erro ao fazer upload da imagem');
		} finally {
			uploading = false;
		}
	}

	function removeImage() {
		formData.imageUrl = '';
		imagePreview = null;
	}

	function onPickFile(e: Event) {
		const input = e.target as HTMLInputElement;
		const file = input.files?.[0];
		localPreview = file ? URL.createObjectURL(file) : null;
	}
</script>

<div class="mx-auto w-full max-w-7xl p-8">
	<h1 class="mb-8 text-3xl font-bold">Gerenciamento de Salas</h1>

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
							{#if data.rooms && data.rooms.length > 0}
								{#each data.rooms as room (room.id)}
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
										<TableCell>
											{room.createdAt ? new Date(room.createdAt).toLocaleDateString('pt-BR') : '-'}
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
					enctype="multipart/form-data"
					action="?/{editingRoom ? 'update' : 'create'}"
					use:enhance={() => {
						return async ({ update }) => {
							await update();
							if (editingRoom) {
								goto('/salas?view=list');
							} else {
								goto('/');
							}
						};
					}}
					class="space-y-6"
				>
					{#if editingRoom}
						<input type="hidden" name="id" value={editingRoom} />
						<input type="hidden" name="currentImageUrl" value={formData.imageUrl} />
					{/if}

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label for="name">Nome da Sala</Label>
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
								placeholder="Ex: 30"
							/>
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
						<label for="imageFile" class="block cursor-pointer">
							<div
								class="rounded-lg border-2 border-dashed p-6 transition-colors hover:border-primary"
							>
								<div
									class="flex flex-col items-center justify-center gap-2 text-sm text-muted-foreground"
								>
									<Upload class="h-8 w-8" />
									<span class="font-medium">Clique para escolher uma imagem</span>
									<span class="text-xs">JPG, PNG, GIF ou WebP (máx 5MB)</span>
								</div>
							</div>
						</label>
						<input
							type="file"
							id="imageFile"
							name="imageFile"
							accept="image/*"
							onchange={onPickFile}
							class="hidden"
						/>

						{#if localPreview || imagePreview}
							<div class="relative h-64 w-full overflow-hidden rounded-lg border border-gray-200">
								<img
									src={localPreview || imagePreview}
									alt="Preview"
									class="h-full w-full object-cover"
								/>
								<Button
									type="button"
									variant="destructive"
									size="sm"
									class="absolute top-2 right-2"
									onclick={() => {
										localPreview = null;
										imagePreview = null;
									}}
								>
									<X class="mr-1 h-4 w-4" /> Remover
								</Button>
							</div>
						{:else}
							<div
								class="flex h-48 w-full items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50"
							>
								<div class="text-center">
									<ImagePlus class="mx-auto h-12 w-12 text-gray-400" />
									<p class="mt-2 text-sm text-gray-500">Nenhuma imagem selecionada</p>
								</div>
							</div>
						{/if}
					</div>

					<div class="flex gap-2 pt-4">
						<Button type="submit">{editingRoom ? 'Atualizar Sala' : 'Criar Sala'}</Button>
						{#if editingRoom}
							<Button type="button" variant="outline" onclick={cancelEdit}>Cancelar</Button>
						{/if}
					</div>
				</form>
			</CardContent>
		</Card>
	{/if}
</div>

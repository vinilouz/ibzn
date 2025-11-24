<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, CardHeader, CardContent, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { Sheet, SheetContent, SheetHeader, SheetTitle } from '$lib/components/ui/sheet';
	import { enhanceWithLoadingAndCallback } from '$lib/utils/enhance';
	import { Plus, Pencil, Trash2, Search, ChevronLeft, ChevronRight } from 'lucide-svelte';

	let { data } = $props();

	let drawerOpen = $state(false);
	let selectedFacilitator = $state<(typeof data.facilitators)[0] | null>(null);
	let isEditMode = $state(false);
	let searchQuery = $state('');
	let currentPage = $state(1);
	const itemsPerPage = 10;

	const filteredFacilitators = $derived.by(() => {
		const facilitators = data.facilitators || [];
		if (!searchQuery.trim()) return facilitators;
		const search = searchQuery.toLowerCase();
		return facilitators.filter((f: any) =>
			f.name?.toLowerCase().includes(search) ||
			f.phone?.toLowerCase().includes(search) ||
			f.email?.toLowerCase().includes(search)
		);
	});

	const paginatedFacilitators = $derived.by(() => {
		const start = (currentPage - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		return filteredFacilitators.slice(start, end);
	});

	const totalPages = $derived(Math.ceil(filteredFacilitators.length / itemsPerPage));

	let prevSearchQuery = '';
	$effect(() => {
		if (searchQuery !== prevSearchQuery) {
			currentPage = 1;
			prevSearchQuery = searchQuery;
		}
	});

	function openCreateDrawer() {
		selectedFacilitator = null;
		isEditMode = false;
		drawerOpen = true;
	}

	function openEditDrawer(facilitator: (typeof data.facilitators)[0]) {
		selectedFacilitator = facilitator;
		isEditMode = true;
		drawerOpen = true;
	}

	function closeDrawer() {
		drawerOpen = false;
		selectedFacilitator = null;
		isEditMode = false;
	}

	function goToPage(pageNum: number) {
		currentPage = pageNum;
	}

	function formatDate(date: Date | string | null) {
		if (!date) return '-';
		return new Date(date).toLocaleDateString('pt-BR');
	}
</script>

<div class="mx-auto w-full max-w-7xl p-8">
	<div class="mb-8 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Gerenciamento de Facilitadores</h1>
		<Button onclick={openCreateDrawer}>
			<Plus class="mr-2 h-4 w-4" />
			Novo Facilitador
		</Button>
	</div>

	<!-- Search Bar -->
	<div class="mb-6">
		<div class="relative">
			<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				type="text"
				placeholder="Buscar por nome, telefone ou email..."
				bind:value={searchQuery}
				class="pl-10"
			/>
		</div>
	</div>

	<!-- Table -->
	<Card>
		<CardHeader>
			<CardTitle>Facilitadores Cadastrados ({filteredFacilitators.length})</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>ID</TableHead>
							<TableHead>Nome</TableHead>
							<TableHead>Telefone</TableHead>
							<TableHead>Email</TableHead>
							<TableHead>Função</TableHead>
							<TableHead>Data de Nascimento</TableHead>
							<TableHead class="text-right">Ações</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#if paginatedFacilitators && paginatedFacilitators.length > 0}
							{#each paginatedFacilitators as facilitator (facilitator.id)}
								<TableRow>
									<TableCell class="font-medium">{facilitator.id}</TableCell>
									<TableCell>{facilitator.name}</TableCell>
									<TableCell>{facilitator.phone}</TableCell>
									<TableCell>{facilitator.email || '-'}</TableCell>
									<TableCell>{facilitator.role || '-'}</TableCell>
									<TableCell>{formatDate(facilitator.birthdate)}</TableCell>
									<TableCell class="text-right">
										<div class="flex justify-end gap-2">
											<Button
												type="button"
												variant="outline"
												size="sm"
												onclick={() => openEditDrawer(facilitator)}
											>
												Editar
											</Button>
											<form
												method="POST"
												action="?/delete"
												use:enhance={enhanceWithLoadingAndCallback({ loadingMessage: 'Excluindo...' })}
												class="inline"
												onsubmit={(e: Event) => {
													if (!confirm('Tem certeza que deseja excluir este facilitador?')) {
														e.preventDefault();
													}
												}}
											>
												<input type="hidden" name="id" value={facilitator.id} />
												<Button type="submit" variant="destructive" size="sm">Excluir</Button>
											</form>
										</div>
									</TableCell>
								</TableRow>
							{/each}
						{:else}
							<TableRow>
								<TableCell colspan={7} class="h-24 text-center">
									Nenhum facilitador encontrado. Crie seu primeiro facilitador!
								</TableCell>
							</TableRow>
						{/if}
					</TableBody>
				</Table>
			</div>
		</CardContent>
	</Card>

	<!-- Pagination -->
	{#if totalPages > 1}
		<div class="mt-8 flex items-center justify-center gap-2">
			<Button
				variant="outline"
				size="sm"
				disabled={currentPage === 1}
				onclick={() => goToPage(currentPage - 1)}
			>
				<ChevronLeft class="h-4 w-4" />
				Anterior
			</Button>

			<div class="flex items-center gap-1">
				{#each Array.from({ length: totalPages }, (_, i) => i + 1) as pageNum}
					{#if pageNum === 1 || pageNum === totalPages || (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)}
						<Button
							variant={pageNum === currentPage ? 'default' : 'outline'}
							size="sm"
							onclick={() => goToPage(pageNum)}
							class="w-10"
						>
							{pageNum}
						</Button>
					{:else if pageNum === currentPage - 2 || pageNum === currentPage + 2}
						<span class="px-2">...</span>
					{/if}
				{/each}
			</div>

			<Button
				variant="outline"
				size="sm"
				disabled={currentPage === totalPages}
				onclick={() => goToPage(currentPage + 1)}
			>
				Próxima
				<ChevronRight class="h-4 w-4" />
			</Button>
		</div>

		<p class="mt-4 text-center text-sm text-muted-foreground">
			Mostrando {(currentPage - 1) * itemsPerPage + 1} -
			{Math.min(currentPage * itemsPerPage, filteredFacilitators.length)}
			de {filteredFacilitators.length} facilitadores
		</p>
	{/if}

	<!-- Drawer -->
	<Sheet bind:open={drawerOpen}>
		<SheetContent side="center" class="max-h-[90vh] w-full overflow-y-auto sm:max-w-md">
			<SheetHeader>
				<SheetTitle>
					{isEditMode ? 'Detalhes do Facilitador' : 'Novo Facilitador'}
				</SheetTitle>
			</SheetHeader>

			<div class="mt-6">
				{#if isEditMode && selectedFacilitator}
					<!-- Modo Visualização/Edição -->
					<div class="space-y-6">
						<!-- Formulário de Edição -->
						<form
							method="POST"
							action="?/update"
							use:enhance={enhanceWithLoadingAndCallback({ loadingMessage: 'Atualizando...', onSuccess: closeDrawer })}
							class="space-y-4"
						>
							<input type="hidden" name="id" value={selectedFacilitator.id} />

							<div>
								<label for="edit-name" class="mb-2 block text-center text-sm font-bold">Nome</label>
								<Input
									id="edit-name"
									name="name"
									value={selectedFacilitator.name}
									required
									class="border-none text-center opacity-50 shadow-none"
								/>
							</div>

							<div>
								<label for="edit-phone" class="mb-2 block text-center text-sm font-bold"
									>Telefone</label
								>
								<Input
									id="edit-phone"
									name="phone"
									value={selectedFacilitator.phone}
									required
									class="border-none text-center opacity-50 shadow-none"
								/>
							</div>

							<div>
								<label for="edit-email" class="mb-2 block text-center text-sm font-bold"
									>Email</label
								>
								<Input
									id="edit-email"
									name="email"
									type="email"
									value={selectedFacilitator.email || ''}
									class="border-none text-center opacity-50 shadow-none"
								/>
							</div>

							<div>
								<label for="edit-role" class="mb-2 block text-center text-sm font-bold"
									>Função</label
								>
								<Input
									id="edit-role"
									name="role"
									value={selectedFacilitator.role || ''}
									class="border-none text-center opacity-50 shadow-none"
								/>
							</div>

							<div>
								<label for="edit-birthdate" class="mb-2 block text-center text-sm font-bold"
									>Data de Nascimento</label
								>
								<Input
									id="edit-birthdate"
									name="birthdate"
									type="date"
									value={selectedFacilitator.birthdate || ''}
									class="border-none text-center opacity-50 shadow-none"
								/>
							</div>

							<div class="flex gap-2 pt-4">
								<Button type="submit" class="flex-1">
									<Pencil class="mr-2 h-4 w-4" />
									Atualizar
								</Button>
							</div>
						</form>

						<!-- Botão Excluir -->
						<form
							method="POST"
							action="?/delete"
							use:enhance={enhanceWithLoadingAndCallback({ loadingMessage: 'Excluindo...', onSuccess: closeDrawer })}
						>
							<input type="hidden" name="id" value={selectedFacilitator.id} />
							<Button variant="destructive" type="submit" class="w-full">
								<Trash2 class="mr-2 h-4 w-4" />
								Excluir Facilitador
							</Button>
						</form>
					</div>
				{:else}
					<!-- Modo Criação -->
					<form
						method="POST"
						action="?/create"
						use:enhance={enhanceWithLoadingAndCallback({ loadingMessage: 'Criando...', onSuccess: closeDrawer })}
						class="space-y-4"
					>
						<div>
							<label for="create-name" class="mb-2 block text-center text-sm font-bold"
								>Nome *</label
							>
							<Input
								id="create-name"
								name="name"
								placeholder="Nome completo"
								required
								class="border-none text-center opacity-50 shadow-none"
							/>
						</div>

						<div>
							<label for="create-phone" class="mb-2 block text-center text-sm font-bold"
								>Telefone *</label
							>
							<Input
								id="create-phone"
								name="phone"
								placeholder="(00) 00000-0000"
								required
								class="border-none text-center opacity-50 shadow-none"
							/>
						</div>

						<div>
							<label for="create-email" class="mb-2 block text-center text-sm font-bold"
								>Email</label
							>
							<Input
								id="create-email"
								name="email"
								type="email"
								placeholder="email@exemplo.com"
								class="border-none text-center opacity-50 shadow-none"
							/>
						</div>

						<div>
							<label for="create-role" class="mb-2 block text-center text-sm font-bold"
								>Função</label
							>
							<Input
								id="create-role"
								name="role"
								placeholder="Cargo ou função"
								class="border-none text-center opacity-50 shadow-none"
							/>
						</div>

						<div>
							<label for="create-birthdate" class="mb-2 block text-center text-sm font-bold"
								>Data de Nascimento</label
							>
							<Input
								id="create-birthdate"
								name="birthdate"
								type="date"
								class="border-none text-center opacity-50 shadow-none"
							/>
						</div>

						<div class="flex justify-center pt-4">
							<Button type="submit" class="w-full md:w-1/2">
								<Plus class="mr-2 h-4 w-4" />
								Criar Facilitador
							</Button>
						</div>
					</form>
				{/if}
			</div>
		</SheetContent>
	</Sheet>
</div>

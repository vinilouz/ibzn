<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
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
	let searchQuery = $state(data.search || '');

	function openCreateDrawer() {
		console.log('Abrindo drawer de criação');
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

	function handleSearch() {
		const params = new URLSearchParams($page.url.searchParams);
		if (searchQuery) {
			params.set('search', searchQuery);
		} else {
			params.delete('search');
		}
		params.set('page', '1');
		goto(`?${params.toString()}`);
	}

	function goToPage(pageNum: number) {
		const params = new URLSearchParams($page.url.searchParams);
		params.set('page', pageNum.toString());
		goto(`?${params.toString()}`);
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
		<div class="flex gap-2">
			<div class="relative flex-1">
				<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					type="text"
					placeholder="Buscar por nome, telefone ou email..."
					bind:value={searchQuery}
					onkeydown={(e) => e.key === 'Enter' && handleSearch()}
					class="pl-10"
				/>
			</div>
			<Button onclick={handleSearch}>Buscar</Button>
			{#if data.search}
				<Button
					variant="outline"
					onclick={() => {
						searchQuery = '';
						handleSearch();
					}}
				>
					Limpar
				</Button>
			{/if}
		</div>
		{#if data.search}
			<p class="mt-2 text-sm text-muted-foreground">
				Mostrando resultados para "{data.search}" - {data.pagination.totalItems} encontrado(s)
			</p>
		{/if}
	</div>

	<!-- Table -->
	<Card>
		<CardHeader>
			<CardTitle>Facilitadores Cadastrados ({data.pagination.totalItems || 0})</CardTitle>
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
						{#if data.facilitators && data.facilitators.length > 0}
							{#each data.facilitators as facilitator (facilitator.id)}
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
												use:enhance={enhanceWithLoadingAndCallback(() => {})}
												class="inline"
												onsubmit={(e) => {
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
	{#if data.pagination.totalPages > 1}
		<div class="mt-8 flex items-center justify-center gap-2">
			<Button
				variant="outline"
				size="sm"
				disabled={data.pagination.currentPage === 1}
				onclick={() => goToPage(data.pagination.currentPage - 1)}
			>
				<ChevronLeft class="h-4 w-4" />
				Anterior
			</Button>

			<div class="flex items-center gap-1">
				{#each Array.from({ length: data.pagination.totalPages }, (_, i) => i + 1) as pageNum}
					{#if pageNum === 1 || pageNum === data.pagination.totalPages || (pageNum >= data.pagination.currentPage - 1 && pageNum <= data.pagination.currentPage + 1)}
						<Button
							variant={pageNum === data.pagination.currentPage ? 'default' : 'outline'}
							size="sm"
							onclick={() => goToPage(pageNum)}
							class="w-10"
						>
							{pageNum}
						</Button>
					{:else if pageNum === data.pagination.currentPage - 2 || pageNum === data.pagination.currentPage + 2}
						<span class="px-2">...</span>
					{/if}
				{/each}
			</div>

			<Button
				variant="outline"
				size="sm"
				disabled={data.pagination.currentPage === data.pagination.totalPages}
				onclick={() => goToPage(data.pagination.currentPage + 1)}
			>
				Próxima
				<ChevronRight class="h-4 w-4" />
			</Button>
		</div>

		<p class="mt-4 text-center text-sm text-muted-foreground">
			Mostrando {(data.pagination.currentPage - 1) * data.pagination.itemsPerPage + 1} -
			{Math.min(
				data.pagination.currentPage * data.pagination.itemsPerPage,
				data.pagination.totalItems
			)}
			de {data.pagination.totalItems} facilitadores
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
							use:enhance={enhanceWithLoadingAndCallback(closeDrawer)}
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
							use:enhance={enhanceWithLoadingAndCallback(closeDrawer)}
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
						use:enhance={enhanceWithLoadingAndCallback(closeDrawer)}
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

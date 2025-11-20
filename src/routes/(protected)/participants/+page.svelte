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
	import { Badge } from '$lib/components/ui/badge';
	import { enhanceWithLoadingAndCallback } from '$lib/utils/enhance';
	import {
		Plus,
		Pencil,
		Trash2,
		Search,
		ChevronLeft,
		ChevronRight,
		GraduationCap,
		Calendar
	} from 'lucide-svelte';

	function formatDate(dateString: string | null) {
		if (!dateString) return '-';
		return new Date(dateString).toLocaleDateString('pt-BR');
	}

	function getStatusBadge(status: string) {
		switch (status) {
			case 'active':
				return 'bg-green-100 text-green-800';
			case 'completed':
				return 'bg-blue-100 text-blue-800';
			case 'cancelled':
				return 'bg-red-100 text-red-800';
			case 'dropped':
				return 'bg-gray-100 text-gray-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}

	function getStatusText(status: string) {
		switch (status) {
			case 'active':
				return 'Ativo';
			case 'completed':
				return 'Concluído';
			case 'cancelled':
				return 'Cancelado';
			case 'dropped':
				return 'Desistente';
			default:
				return status;
		}
	}

	let { data } = $props();

	let drawerOpen = $state(false);
	let selectedParticipant = $state<(typeof data.participants)[0] | null>(null);
	let isEditMode = $state(false);
	let searchQuery = $state(data.search || '');

	function openCreateDrawer() {
		console.log('Abrindo drawer de criação');
		selectedParticipant = null;
		isEditMode = false;
		drawerOpen = true;
	}

	function openEditDrawer(participant: (typeof data.participants)[0]) {
		selectedParticipant = participant;
		isEditMode = true;
		drawerOpen = true;
	}

	function closeDrawer() {
		drawerOpen = false;
		selectedParticipant = null;
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
</script>

<div class="mx-auto w-full max-w-7xl p-8">
	<div class="mb-8 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Gerenciamento de Participantes</h1>
		<Button onclick={openCreateDrawer}>
			<Plus class="mr-2 h-4 w-4" />
			Novo Participante
		</Button>
	</div>

	<!-- Search Bar -->
	<div class="mb-6">
		<div class="flex gap-2">
			<div class="relative flex-1">
				<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<Input
					type="text"
					placeholder="Buscar por nome, telefone ou endereço..."
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
			<CardTitle>Participantes Cadastrados ({data.pagination.totalItems || 0})</CardTitle>
		</CardHeader>
		<CardContent>
			<div class="rounded-md border">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>ID</TableHead>
							<TableHead>Nome</TableHead>
							<TableHead>Telefone</TableHead>
							<TableHead>Endereço</TableHead>
							<TableHead>Função</TableHead>
							<TableHead>Data de Nascimento</TableHead>
							<TableHead>Cursos</TableHead>
							<TableHead class="text-right">Ações</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#if data.participants && data.participants.length > 0}
							{#each data.participants as participant (participant.id)}
								<TableRow>
									<TableCell class="font-medium">{participant.id}</TableCell>
									<TableCell>{participant.name}</TableCell>
									<TableCell>{participant.phone}</TableCell>
									<TableCell>{participant.address || '-'}</TableCell>
									<TableCell>{participant.role || '-'}</TableCell>
									<TableCell>{formatDate(participant.birthdate)}</TableCell>
									<TableCell>
										{#if participant.courses && participant.courses.length > 0}
											<Badge variant="secondary" class="flex w-fit items-center gap-1">
												<GraduationCap class="h-3 w-3" />
												{participant.courses.length}
											</Badge>
										{:else}
											<span class="text-xs text-gray-400">Nenhum</span>
										{/if}
									</TableCell>
									<TableCell class="text-right">
										<div class="flex justify-end gap-2">
											<Button
												type="button"
												variant="outline"
												size="sm"
												onclick={() => openEditDrawer(participant)}
											>
												Editar
											</Button>
											<form
												method="POST"
												action="?/delete"
												use:enhance={enhanceWithLoadingAndCallback(() => {})}
												class="inline"
												onsubmit={(e) => {
													if (!confirm('Tem certeza que deseja excluir este participante?')) {
														e.preventDefault();
													}
												}}
											>
												<input type="hidden" name="id" value={participant.id} />
												<Button type="submit" variant="destructive" size="sm">Excluir</Button>
											</form>
										</div>
									</TableCell>
								</TableRow>
							{/each}
						{:else}
							<TableRow>
								<TableCell colspan={8} class="h-24 text-center">
									Nenhum participante encontrado. Crie seu primeiro participante!
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
			de {data.pagination.totalItems} participantes
		</p>
	{/if}

	<!-- Drawer -->
	<Sheet bind:open={drawerOpen}>
		<SheetContent side="center" class="max-h-[90vh] w-full overflow-y-auto sm:max-w-md">
			<SheetHeader>
				<SheetTitle>
					{isEditMode ? 'Detalhes do Participante' : 'Novo Participante'}
				</SheetTitle>
			</SheetHeader>

			<div class="mt-6">
				{#if isEditMode && selectedParticipant}
					<!-- Modo Visualização/Edição -->
					<div class="space-y-6">
						<!-- Cursos Matriculados -->
						<div class="space-y-3">
							<div class="flex items-center gap-2">
								<GraduationCap class="h-5 w-5 text-primary" />
								<h3 class="font-semibold">Cursos Matriculados</h3>
							</div>

							{#if selectedParticipant.courses && selectedParticipant.courses.length > 0}
								<div class="space-y-2">
									{#each selectedParticipant.courses as enrollment}
										<div class="rounded-lg border bg-accent/50 p-3">
											<div class="mb-2 flex items-center justify-between">
												<p class="font-medium">{enrollment.courseName || 'Curso'}</p>
												<Badge class={getStatusBadge(enrollment.status)}>
													{getStatusText(enrollment.status)}
												</Badge>
											</div>
											<div class="flex items-center gap-2 text-xs text-muted-foreground">
												<Calendar class="h-3 w-3" />
												<span>Matriculado em: {formatDate(enrollment.enrolledAt)}</span>
											</div>
										</div>
									{/each}
								</div>
							{:else}
								<p class="py-4 text-center text-sm text-muted-foreground">
									Nenhum curso matriculado ainda
								</p>
							{/if}
						</div>

						<!-- Formulário de Edição -->
						<form
							method="POST"
							action="?/update"
							use:enhance={enhanceWithLoadingAndCallback(closeDrawer)}
							class="space-y-4"
						>
							<input type="hidden" name="id" value={selectedParticipant.id} />

							<div>
								<label for="edit-name" class="mb-2 block text-center text-sm font-bold">Nome</label>
								<Input
									id="edit-name"
									name="name"
									value={selectedParticipant.name}
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
									value={selectedParticipant.phone}
									required
									class="border-none text-center opacity-50 shadow-none"
								/>
							</div>

							<div>
								<label for="edit-address" class="mb-2 block text-center text-sm font-bold"
									>Endereço</label
								>
								<Input
									id="edit-address"
									name="address"
									value={selectedParticipant.address || ''}
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
									value={selectedParticipant.role || ''}
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
									value={selectedParticipant.birthdate || ''}
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
							<input type="hidden" name="id" value={selectedParticipant.id} />
							<Button variant="destructive" type="submit" class="w-full">
								<Trash2 class="mr-2 h-4 w-4" />
								Excluir Participante
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
							<label for="create-address" class="mb-2 block text-center text-sm font-bold"
								>Endereço</label
							>
							<Input
								id="create-address"
								name="address"
								placeholder="Endereço completo"
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
								Criar Participante
							</Button>
						</div>
					</form>
				{/if}
			</div>
		</SheetContent>
	</Sheet>
</div>

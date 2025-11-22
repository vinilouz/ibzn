<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { Plus, X, Search } from 'lucide-svelte';
	import Pagination from '$lib/components/Pagination.svelte';

	interface EnrollmentFormData {
		participantId: string;
		courseId: string;
		amount: string;
		status: string;
		notes: string;
	}

	let { data }: { data: any } = $props();

	let editingEnrollment = $state<number | null>(null);
	let statusFilter = $state<string>('all');
	let searchTerm = $state('');
	let currentPage = $state(1);
	const itemsPerPage = 10;

	const initialFormData: EnrollmentFormData = {
		participantId: '',
		courseId: '',
		amount: '',
		status: 'active',
		notes: ''
	};

	let formData = $state<EnrollmentFormData>({ ...initialFormData });

	$effect(() => {
		if (formData.courseId) {
			const course = data.courses?.find(
				(c: any) => c.id.toString() === formData.courseId.toString()
			);
			if (course) {
				formData.amount = course.price?.toString() || '0';
			}
		}
	});

	const filteredEnrollments = $derived.by(() => {
		let enrollments = data.enrollments || [];

		// Filter by status
		if (statusFilter !== 'all') {
			enrollments = enrollments.filter((e: any) => e.status === statusFilter);
		}

		// Filter by search term (participant name)
		if (searchTerm.trim()) {
			enrollments = enrollments.filter((e: any) =>
				e.participantName?.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		return enrollments;
	});

	const stats = $derived.by(() => {
		const enrollments = data.enrollments || [];
		return {
			total: enrollments.length,
			active: enrollments.filter((e: any) => e.status === 'active').length,
			pending: enrollments.filter((e: any) => e.status === 'pending').length,
			completed: enrollments.filter((e: any) => e.status === 'completed').length,
			cancelled: enrollments.filter((e: any) => e.status === 'cancelled').length
		};
	});

	const activeView = $derived.by(() => {
		const view = $page.url.searchParams.get('view');
		const id = $page.url.searchParams.get('id');

		if (view === 'edit' && id) {
			loadEnrollmentForEdit(parseInt(id));
			return 'form';
		}

		return view === 'create' ? 'form' : 'list';
	}) as 'list' | 'form';

	const isEditing = $derived(editingEnrollment !== null);

	function loadEnrollmentForEdit(enrollmentId: number) {
		const enrollment = data.enrollments?.find((e: any) => e.id === enrollmentId);
		if (enrollment && editingEnrollment !== enrollmentId) {
			editingEnrollment = enrollmentId;
			formData = {
				participantId: enrollment.participantId?.toString() || '',
				courseId: enrollment.courseId?.toString() || '',
				amount: enrollment.amount?.toString() || '',
				status: enrollment.status || 'active',
				notes: enrollment.notes || ''
			};
		}
	}

	function startEdit(enrollment: any) {
		editingEnrollment = enrollment.id;
		formData = {
			participantId: enrollment.participantId?.toString() || '',
			courseId: enrollment.courseId?.toString() || '',
			amount: enrollment.amount?.toString() || '',
			status: enrollment.status || 'active',
			notes: enrollment.notes || ''
		};
		goto(`/matriculas?view=edit&id=${enrollment.id}`);
	}

	function resetForm() {
		editingEnrollment = null;
		formData = { ...initialFormData };
	}

	function cancelEdit() {
		resetForm();
		goto('/matriculas?view=list');
	}

	function navigateToCreate() {
		resetForm();
		goto('/matriculas?view=create');
	}

	function handleFormSubmit() {
		return async ({ update }: any) => {
			await update();
			resetForm();
			goto('/matriculas?view=list');
		};
	}

	function handleDelete() {
		return async ({ update }: any) => {
			if (confirm('Tem certeza que deseja excluir esta matrícula?')) {
				await update();
			}
		};
	}

	function formatDate(date: Date | string | null) {
		if (!date) return '-';
		return new Date(date).toLocaleDateString('pt-BR');
	}

	function formatCurrency(value: number | null) {
		if (!value) return 'R$ 0,00';
		return new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'BRL'
		}).format(value);
	}

	function getStatusBadge(status: string) {
		const badges = {
			active: { class: 'bg-green-100 text-green-800', label: 'Ativa' },
			cancelled: { class: 'bg-red-100 text-red-800', label: 'Cancelada' },
			completed: { class: 'bg-blue-100 text-blue-800', label: 'Concluída' },
			pending: { class: 'bg-yellow-100 text-yellow-800', label: 'Pendente' }
		};
		return badges[status as keyof typeof badges] || badges.active;
	}

	const paginatedEnrollments = $derived.by(() => {
		const start = (currentPage - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		return filteredEnrollments.slice(start, end);
	});

	// Reset to page 1 when filters change
	let prevSearchTerm = '';
	let prevStatusFilter = 'all';
	$effect(() => {
		if (searchTerm !== prevSearchTerm || statusFilter !== prevStatusFilter) {
			currentPage = 1;
			prevSearchTerm = searchTerm;
			prevStatusFilter = statusFilter;
		}
	});
</script>

<div class="mx-auto w-full max-w-7xl p-8">
	<div class="mb-8 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Gerenciamento de Matrículas</h1>
		{#if activeView === 'list'}
			<Button onclick={navigateToCreate}>
				<Plus class="mr-2 h-4 w-4" />
				Nova Matrícula
			</Button>
		{/if}
	</div>

	{#if activeView === 'list'}
		<div class="mb-6 grid gap-4 md:grid-cols-5">
			<Card
				class="cursor-pointer transition-all hover:shadow-md {statusFilter === 'all'
					? 'ring-2 ring-primary'
					: ''}"
				onclick={() => (statusFilter = 'all')}
			>
				<CardContent class="pt-6">
					<div class="text-center">
						<p class="text-2xl font-bold">{stats.total}</p>
						<p class="text-sm text-muted-foreground">Total</p>
					</div>
				</CardContent>
			</Card>

			<Card
				class="cursor-pointer transition-all hover:shadow-md {statusFilter === 'active'
					? 'ring-2 ring-green-500'
					: ''}"
				onclick={() => (statusFilter = 'active')}
			>
				<CardContent class="pt-6">
					<div class="text-center">
						<p class="text-2xl font-bold text-green-600">{stats.active}</p>
						<p class="text-sm text-muted-foreground">Ativas</p>
					</div>
				</CardContent>
			</Card>

			<Card
				class="cursor-pointer transition-all hover:shadow-md {statusFilter === 'pending'
					? 'ring-2 ring-yellow-500'
					: ''}"
				onclick={() => (statusFilter = 'pending')}
			>
				<CardContent class="pt-6">
					<div class="text-center">
						<p class="text-2xl font-bold text-yellow-600">{stats.pending}</p>
						<p class="text-sm text-muted-foreground">Pendentes</p>
					</div>
				</CardContent>
			</Card>

			<Card
				class="cursor-pointer transition-all hover:shadow-md {statusFilter === 'completed'
					? 'ring-2 ring-blue-500'
					: ''}"
				onclick={() => (statusFilter = 'completed')}
			>
				<CardContent class="pt-6">
					<div class="text-center">
						<p class="text-2xl font-bold text-blue-600">{stats.completed}</p>
						<p class="text-sm text-muted-foreground">Concluídas</p>
					</div>
				</CardContent>
			</Card>

			<Card
				class="cursor-pointer transition-all hover:shadow-md {statusFilter === 'cancelled'
					? 'ring-2 ring-red-500'
					: ''}"
				onclick={() => (statusFilter = 'cancelled')}
			>
				<CardContent class="pt-6">
					<div class="text-center">
						<p class="text-2xl font-bold text-red-600">{stats.cancelled}</p>
						<p class="text-sm text-muted-foreground">Canceladas</p>
					</div>
				</CardContent>
			</Card>
		</div>

		<Card>
			<CardHeader>
				<CardTitle>
					Matrículas
					{#if statusFilter === 'all'}
						({stats.total})
					{:else if statusFilter === 'active'}
						Ativas ({stats.active})
					{:else if statusFilter === 'pending'}
						Pendentes ({stats.pending})
					{:else if statusFilter === 'completed'}
						Concluídas ({stats.completed})
					{:else if statusFilter === 'cancelled'}
						Canceladas ({stats.cancelled})
					{/if}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="mb-4">
					<div class="relative">
						<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input
							type="text"
							placeholder="Buscar por nome do participante..."
							bind:value={searchTerm}
							class="pl-10"
						/>
					</div>
				</div>

				{#if filteredEnrollments.length === 0 && searchTerm}
					<p class="text-sm text-muted-foreground text-center py-8">
						Nenhuma matrícula encontrada para "{searchTerm}"
					</p>
				{:else}
				<div class="rounded-md border">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Participante</TableHead>
								<TableHead>Curso</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Valor</TableHead>
								<TableHead>Data de Matrícula</TableHead>
								<TableHead>Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{#each paginatedEnrollments as enrollment}
								{@const badge = getStatusBadge(enrollment.status || 'active')}
								<TableRow>
									<TableCell>
										<div>
											<p class="font-medium">{enrollment.participantName || '-'}</p>
											<p class="text-sm text-muted-foreground">
												{enrollment.participantPhone || '-'}
											</p>
										</div>
									</TableCell>
									<TableCell>{enrollment.courseName || '-'}</TableCell>
									<TableCell>
										<span
											class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold {badge.class}"
										>
											{badge.label}
										</span>
									</TableCell>
									<TableCell class="font-medium">{formatCurrency(enrollment.amount)}</TableCell>
									<TableCell>{formatDate(enrollment.enrolledAt)}</TableCell>
									<TableCell>
										<div class="flex items-center gap-2">
											<Button variant="outline" size="sm" onclick={() => startEdit(enrollment)}>
												Editar
											</Button>

											<form method="POST" action="?/delete" use:enhance={handleDelete()}>
												<input type="hidden" name="id" value={enrollment.id} />
												<Button type="submit" variant="ghost" size="sm">
													<X class="h-4 w-4" />
												</Button>
											</form>
										</div>
									</TableCell>
								</TableRow>
							{/each}
						</TableBody>
					</Table>
				</div>
				<Pagination
					bind:currentPage
					totalItems={filteredEnrollments.length}
					{itemsPerPage}
					onPageChange={() => {}}
				/>
				{/if}
			</CardContent>
		</Card>
	{:else}
		<Card>
			<CardHeader>
				<CardTitle>{isEditing ? 'Editar Matrícula' : 'Nova Matrícula'}</CardTitle>
			</CardHeader>
			<CardContent>
				<form
					method="POST"
					action={isEditing ? '?/update' : '?/create'}
					use:enhance={handleFormSubmit}
					class="space-y-6"
				>
					{#if isEditing}
						<input type="hidden" name="id" value={editingEnrollment} />
					{/if}

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label for="participantId">Participante *</Label>
							<select
								id="participantId"
								name="participantId"
								bind:value={formData.participantId}
								required
								disabled={isEditing}
								class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
							>
								<option value="">Selecione um participante</option>
								{#each data.participants || [] as participant}
									<option value={participant.id}>{participant.name} - {participant.phone}</option>
								{/each}
							</select>
						</div>

						<div class="space-y-2">
							<Label for="courseId">Curso *</Label>
							<select
								id="courseId"
								name="courseId"
								bind:value={formData.courseId}
								required
								disabled={isEditing}
								class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
							>
								<option value="">Selecione um curso</option>
								{#each data.courses || [] as course}
									<option value={course.id}>{course.courseName}</option>
								{/each}
							</select>
						</div>
					</div>

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label for="amount">Valor (R$) *</Label>
							<Input
								id="amount"
								name="amount"
								type="number"
								step="0.01"
								bind:value={formData.amount}
								placeholder="0.00"
								required
								readonly
								class="bg-muted"
							/>
						</div>

						{#if isEditing}
							<div class="space-y-2">
								<Label for="status">Status *</Label>
								<select
									id="status"
									name="status"
									bind:value={formData.status}
									required
									class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
								>
									<option value="active">Ativa</option>
									<option value="pending">Pendente</option>
									<option value="completed">Concluída</option>
									<option value="cancelled">Cancelada</option>
								</select>
							</div>
						{/if}
					</div>

					<div class="space-y-2">
						<Label for="notes">Observações</Label>
						<Textarea
							id="notes"
							name="notes"
							bind:value={formData.notes}
							placeholder="Informações adicionais sobre a matrícula"
							rows={4}
						/>
					</div>

					<div class="flex gap-2 pt-4">
						<Button type="submit">
							{isEditing ? 'Atualizar' : 'Criar'} Matrícula
						</Button>
						<Button type="button" variant="outline" onclick={cancelEdit}>Cancelar</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	{/if}
</div>

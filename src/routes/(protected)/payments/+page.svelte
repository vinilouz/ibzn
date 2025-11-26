<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Sheet, SheetContent, SheetHeader, SheetTitle } from '$lib/components/ui/sheet';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { enhanceWithLoadingAndCallback } from '$lib/utils/enhance';
	import { Plus, DollarSign, Check, X, Clock, RefreshCw, Search } from 'lucide-svelte';
	import Pagination from '$lib/components/Pagination.svelte';

	let { data }: { data: any } = $props();

	let drawerOpen = $state(false);
	let selectedPayment = $state<(typeof data.payments)[0] | null>(null);
	let isEditMode = $state(false);
	let searchTerm = $state('');
	let statusFilter = $state('all');
	let currentPage = $state(1);
	const itemsPerPage = 10;

	const filteredPayments = $derived(data.payments.filter((payment: any) => {
		// Filter by status
		const statusMatch = statusFilter === 'all' || payment.payment.status === statusFilter;

		// Filter by search term (participant name or course name)
		if (!searchTerm.trim()) return statusMatch;

		const search = searchTerm.toLowerCase();
		const nameMatch = payment.participantName?.toLowerCase().includes(search);
		const courseMatch = payment.courseName?.toLowerCase().includes(search);

		return statusMatch && (nameMatch || courseMatch);
	}));

	const paginatedPayments = $derived.by(() => {
		const start = (currentPage - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		return filteredPayments.slice(start, end);
	});

	let prevSearchTerm = '';
	let prevStatusFilter = 'all';
	$effect(() => {
		if (searchTerm !== prevSearchTerm || statusFilter !== prevStatusFilter) {
			currentPage = 1;
			prevSearchTerm = searchTerm;
			prevStatusFilter = statusFilter;
		}
	});

	// Form states
	let selectedCourseId = $state('');
	let amount = $state(0);
	let discountPercentage = $state(0);
	let paymentMethod = $state('');

	$effect(() => {
		if (selectedCourseId) {
			const course = data.courses.find((c: any) => c.id.toString() === selectedCourseId.toString());
			if (course) {
				amount = course.price || 0;
			}
		}
	});

	const finalAmount = $derived(amount - (amount * discountPercentage) / 100);

	function openCreateDrawer() {
		selectedPayment = null;
		isEditMode = false;
		drawerOpen = true;
		resetForm();
	}

	function openEditDrawer(payment: (typeof data.payments)[0]) {
		selectedPayment = payment;
		isEditMode = true;
		drawerOpen = true;
		// Populate form for edit if needed, though currently edit is only for status
	}

	function closeDrawer() {
		drawerOpen = false;
		selectedPayment = null;
		isEditMode = false;
		resetForm();
	}

	function resetForm() {
		selectedCourseId = '';
		amount = 0;
		discountPercentage = 0;
		paymentMethod = '';
	}

	function getStatusColor(status: string) {
		switch (status) {
			case 'paid':
				return 'bg-green-100 text-green-800';
			case 'pending':
				return 'bg-yellow-100 text-yellow-800';
			case 'cancelled':
				return 'bg-red-100 text-red-800';
			case 'refunded':
				return 'bg-blue-100 text-blue-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	}

	function getStatusIcon(status: string) {
		switch (status) {
			case 'paid':
				return Check;
			case 'pending':
				return Clock;
			case 'cancelled':
				return X;
			case 'refunded':
				return RefreshCw;
			default:
				return Clock;
		}
	}

	function getStatusText(status: string) {
		switch (status) {
			case 'paid':
				return 'Pago';
			case 'pending':
				return 'Pendente';
			case 'cancelled':
				return 'Cancelado';
			case 'refunded':
				return 'Reembolsado';
			default:
				return status;
		}
	}

	function formatCurrency(value: number) {
		return new Intl.NumberFormat('pt-BR', {
			style: 'currency',
			currency: 'BRL'
		}).format(value);
	}

	function formatDate(dateString: string) {
		return new Date(dateString).toLocaleDateString('pt-BR');
	}
</script>

<div class="container mx-auto max-w-7xl p-6">
	<!-- Header -->
	<div class="mb-8 flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold">Pagamentos</h1>
			<p class="mt-1 text-muted-foreground">Gerencie os pagamentos dos cursos</p>
		</div>
		<button
			type="button"
			onclick={openCreateDrawer}
			class="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
		>
			<Plus class="h-4 w-4" />
			Registrar Pagamento
		</button>
	</div>

	<Card>
		<CardHeader>
			<CardTitle>Pagamentos ({filteredPayments.length})</CardTitle>
		</CardHeader>
		<CardContent>
			<!-- Search and Filter -->
			<div class="mb-4 flex gap-4">
				<div class="relative flex-1">
					<Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Buscar por participante ou curso..."
						bind:value={searchTerm}
						class="pl-10"
					/>
				</div>
				<select
					bind:value={statusFilter}
					class="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
				>
					<option value="all">Todos</option>
					<option value="paid">Pago</option>
					<option value="pending">Pendente</option>
					<option value="cancelled">Cancelado</option>
					<option value="refunded">Reembolso</option>
				</select>
			</div>

			{#if filteredPayments.length === 0 && (searchTerm || statusFilter !== 'all')}
				<p class="text-sm text-muted-foreground text-center py-8">
					Nenhum pagamento encontrado
				</p>
			{:else if paginatedPayments.length > 0}
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Participante</TableHead>
							<TableHead>Curso</TableHead>
							<TableHead>Status</TableHead>
							<TableHead>Valor Final</TableHead>
							<TableHead>Método</TableHead>
							<TableHead>Data</TableHead>
							<TableHead class="text-right">Ações</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each paginatedPayments as payment}
							<TableRow>
								<TableCell>
									<div>
										<p class="font-medium">{payment.participantName || 'Participante'}</p>
										{#if payment.participantPhone}
											<p class="text-sm text-muted-foreground">{payment.participantPhone}</p>
										{/if}
									</div>
								</TableCell>
								<TableCell>{payment.courseName || '-'}</TableCell>
								<TableCell>
									<span
										class={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusColor(payment.payment.status)}`}
									>
										{getStatusText(payment.payment.status)}
									</span>
								</TableCell>
								<TableCell class="font-medium">{formatCurrency(payment.payment.finalAmount)}</TableCell>
								<TableCell class="capitalize">
									{#if payment.payment.paymentMethod}
										{payment.payment.paymentMethod === 'free'
											? 'Gratuito'
											: payment.payment.paymentMethod.replace('_', ' ')}
									{:else}
										-
									{/if}
								</TableCell>
								<TableCell>{formatDate(payment.payment.createdAt)}</TableCell>
								<TableCell class="text-right">
									<Button variant="outline" size="sm" onclick={() => openEditDrawer(payment)}>
										Gerenciar
									</Button>
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>
				<Pagination
					bind:currentPage
					totalItems={filteredPayments.length}
					{itemsPerPage}
					onPageChange={() => {}}
				/>
			{/if}
		</CardContent>
	</Card>

	{#if data.payments.length === 0 && !searchTerm && statusFilter === 'all'}
		<Card class="mt-8">
			<CardContent class="flex flex-col items-center justify-center py-12">
				<DollarSign class="mb-4 h-16 w-16 text-muted-foreground" />
				<h3 class="mb-2 text-xl font-semibold">Nenhum pagamento registrado</h3>
				<p class="mb-4 text-muted-foreground">Comece registrando o primeiro pagamento</p>
				<button
					type="button"
					onclick={openCreateDrawer}
					class="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
				>
					<Plus class="h-4 w-4" />
					Registrar Pagamento
				</button>
			</CardContent>
		</Card>
	{/if}

	<!-- Drawer -->
	<Sheet bind:open={drawerOpen}>
		<SheetContent side="center" class="max-h-[90vh] w-full overflow-y-auto sm:max-w-md">
			<SheetHeader>
				<SheetTitle>
					{isEditMode ? 'Gerenciar Pagamento' : 'Registrar Pagamento'}
				</SheetTitle>
			</SheetHeader>

			<div class="mt-6">
				{#if isEditMode && selectedPayment}
					<!-- Modo Gerenciamento -->
					<div class="space-y-6">
						<!-- Status atual -->
						<div class="rounded-lg border p-4">
							<p class="mb-2 text-sm text-muted-foreground">Status Atual</p>
							{#snippet statusDisplay()}
								{#if selectedPayment}
									{@const StatusIcon = getStatusIcon(selectedPayment.payment.status)}
									<div
										class={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium ${getStatusColor(selectedPayment.payment.status)}`}
									>
										<StatusIcon class="h-4 w-4" />
										{getStatusText(selectedPayment.payment.status)}
									</div>
								{/if}
							{/snippet}
							{@render statusDisplay()}
						</div>

						<!-- Alterar Status -->
						<form
							method="POST"
							action="?/updateStatus"
							use:enhance={enhanceWithLoadingAndCallback({
								loadingMessage: 'Atualizando status do pagamento...',
								onSuccess: async () => {
									closeDrawer();
									await invalidateAll(); // Invalida todas as rotas incluindo financeiro
								}
							})}
						>
							<input type="hidden" name="id" value={selectedPayment.payment.id} />

							<div>
								<label for="status" class="mb-2 block text-center text-sm font-bold"
									>Alterar Status</label
								>
								<select
									id="status"
									name="status"
									class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-center text-sm opacity-50 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
									required
								>
									<option value="pending" selected={selectedPayment.payment.status === 'pending'}
										>Pendente</option
									>
									<option value="paid" selected={selectedPayment.payment.status === 'paid'}
										>Pago</option
									>
									<option
										value="cancelled"
										selected={selectedPayment.payment.status === 'cancelled'}>Cancelado</option
									>
									<option value="refunded" selected={selectedPayment.payment.status === 'refunded'}
										>Reembolsado</option
									>
								</select>
							</div>

							<Button type="submit" class="mt-4 w-full">Atualizar Status</Button>
						</form>

						<!-- Deletar -->
						<form
							method="POST"
							action="?/delete"
							use:enhance={enhanceWithLoadingAndCallback({
								loadingMessage: 'Deletando pagamento...',
								onSuccess: async () => {
									closeDrawer();
									await invalidateAll(); // Invalida todas as rotas incluindo financeiro
								}
							})}
						>
							<input type="hidden" name="id" value={selectedPayment.payment.id} />
							<Button variant="destructive" type="submit" class="w-full">Deletar Pagamento</Button>
						</form>
					</div>
				{:else}
					<!-- Modo Criação -->
					<form
						method="POST"
						action="?/create"
						use:enhance={enhanceWithLoadingAndCallback({
							loadingMessage: 'Criando pagamento...',
							onSuccess: async () => {
								closeDrawer();
								await invalidateAll(); // Invalida todas as rotas incluindo financeiro
							}
						})}
						class="space-y-4"
					>
						<div>
							<label for="participantId" class="mb-2 block text-center text-sm font-bold"
								>Participante *</label
							>
							<select
								id="participantId"
								name="participantId"
								class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-center text-sm opacity-50 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
								required
							>
								<option value="">Selecione um participante</option>
								{#each data.participants as participant}
									<option value={participant.id}>
										{participant.name}
										{#if participant.phone}
											- {participant.phone}
										{/if}
									</option>
								{/each}
							</select>
						</div>

						<div>
							<label for="courseId" class="mb-2 block text-center text-sm font-bold">Curso *</label>
							<select
								id="courseId"
								name="courseId"
								bind:value={selectedCourseId}
								class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-center text-sm opacity-50 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
								required
							>
								<option value="">Selecione um curso</option>
								{#each data.courses as course}
									<option value={course.id}
										>{course.courseName} - {formatCurrency(course.price)}</option
									>
								{/each}
							</select>
						</div>

						<div>
							<label for="amount" class="mb-2 block text-center text-sm font-bold"
								>Valor Original (R$)</label
							>
							<div
								class="flex h-10 w-full items-center justify-center rounded-md border border-input bg-muted px-3 py-2 text-sm font-medium opacity-50"
							>
								{formatCurrency(amount)}
							</div>
							<input type="hidden" name="amount" value={amount} />
						</div>

						<div>
							<label for="discountPercentage" class="mb-2 block text-center text-sm font-bold"
								>Desconto (%)</label
							>
							<Input
								id="discountPercentage"
								name="discountPercentage"
								type="number"
								min="0"
								max="100"
								step="1"
								bind:value={discountPercentage}
								class="text-center opacity-50"
							/>
						</div>

						<div>
							<label for="finalAmount" class="mb-2 block text-center text-sm font-bold"
								>Valor Final (R$)</label
							>
							<div
								class="flex h-10 w-full items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium opacity-50"
							>
								{formatCurrency(finalAmount)}
							</div>
							<input type="hidden" name="finalAmount" value={finalAmount} />
						</div>

						<div>
							<label for="paymentMethod" class="mb-2 block text-center text-sm font-bold"
								>Método de Pagamento</label
							>
							<select
								id="paymentMethod"
								name="paymentMethod"
								bind:value={paymentMethod}
								class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-center text-sm opacity-50 ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
							>
								<option value="">Selecione</option>
								<option value="pix">PIX</option>
								<option value="credit_card">Cartão de Crédito</option>
								<option value="debit_card">Cartão de Débito</option>
								<option value="bank_transfer">Transferência Bancária</option>
								<option value="boleto">Boleto</option>
								<option value="cash">Dinheiro</option>
								<option value="free">Gratuito</option>
							</select>
						</div>

						<div>
							<label for="notes" class="mb-2 block text-center text-sm font-bold">Observações</label
							>
							<textarea
								id="notes"
								name="notes"
								rows="3"
								class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-center text-sm opacity-50 ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
								placeholder="Informações adicionais sobre o pagamento"
							></textarea>
						</div>

						<div class="flex justify-center pt-4">
							<Button type="submit" class="w-full md:w-1/2">
								<Plus class="mr-2 h-4 w-4" />
								Registrar Pagamento
							</Button>
						</div>
					</form>
				{/if}
			</div>
		</SheetContent>
	</Sheet>
</div>

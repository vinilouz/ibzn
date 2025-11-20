<script lang="ts">
	import { Card, CardContent } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Sheet, SheetContent, SheetHeader, SheetTitle } from '$lib/components/ui/sheet';
	import { enhance } from '$app/forms';
	import { Plus, DollarSign, Check, X, Clock, RefreshCw } from 'lucide-svelte';

	export let data;

	let drawerOpen = false;
	let selectedPayment: (typeof data.payments)[0] | null = null;
	let isEditMode = false;

	// Form states
	let selectedCourseId = '';
	let amount = 0;
	let discountPercentage = 0;
	let paymentMethod = '';

	$: {
		if (selectedCourseId) {
			const course = data.courses.find((c) => c.id.toString() === selectedCourseId.toString());
			if (course) {
				amount = course.price || 0;
			}
		}
	}

	$: finalAmount = amount - (amount * discountPercentage) / 100;

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
			on:click={openCreateDrawer}
			class="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
		>
			<Plus class="h-4 w-4" />
			Registrar Pagamento
		</button>
	</div>

	<!-- Lista de Pagamentos -->
	<div class="grid gap-4">
		{#each data.payments as payment}
			{@const StatusIcon = getStatusIcon(payment.payment.status)}
			<Card class="transition-shadow hover:shadow-lg">
				<CardContent class="p-6">
					<div class="flex items-start justify-between">
						<div class="flex-1">
							<div class="mb-2 flex items-center gap-3">
								<DollarSign class="h-5 w-5 text-primary" />
								<h3 class="text-lg font-semibold">{payment.participantName || 'Participante'}</h3>
								{#if payment.participantPhone}
									<span class="text-sm text-muted-foreground">({payment.participantPhone})</span>
								{/if}
								<span
									class={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(payment.payment.status)}`}
								>
									<StatusIcon class="h-3 w-3" />
									{getStatusText(payment.payment.status)}
								</span>
							</div>

							<div class="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
								<div>
									<p class="text-sm text-muted-foreground">Curso</p>
									<p class="font-medium">{payment.courseName || 'N/A'}</p>
								</div>
								<div>
									<p class="text-sm text-muted-foreground">Valor Original</p>
									<p class="font-medium">{formatCurrency(payment.payment.amount)}</p>
								</div>
								{#if payment.payment.discount && payment.payment.discount > 0}
									<div>
										<p class="text-sm text-muted-foreground">Desconto</p>
										<p class="font-medium text-green-600">
											-{formatCurrency(payment.payment.discount)}
										</p>
									</div>
								{/if}
								<div>
									<p class="text-sm text-muted-foreground">Valor Final</p>
									<p class="font-bold text-primary">
										{formatCurrency(payment.payment.finalAmount)}
									</p>
								</div>
								{#if payment.payment.paymentMethod}
									<div>
										<p class="text-sm text-muted-foreground">Método</p>
										<p class="font-medium capitalize">
											{payment.payment.paymentMethod === 'free'
												? 'Gratuito'
												: payment.payment.paymentMethod.replace('_', ' ')}
										</p>
									</div>
								{/if}
								<div>
									<p class="text-sm text-muted-foreground">Data</p>
									<p class="font-medium">{formatDate(payment.payment.createdAt)}</p>
								</div>
							</div>

							{#if payment.payment.notes}
								<div class="mt-3 rounded-md bg-muted p-3">
									<p class="text-sm text-muted-foreground">Observações:</p>
									<p class="text-sm">{payment.payment.notes}</p>
								</div>
							{/if}
						</div>

						<div class="ml-4 flex flex-col gap-2">
							<button
								type="button"
								on:click={() => openEditDrawer(payment)}
								class="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
							>
								Gerenciar
							</button>
						</div>
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>

	{#if data.payments.length === 0}
		<Card class="mt-8">
			<CardContent class="flex flex-col items-center justify-center py-12">
				<DollarSign class="mb-4 h-16 w-16 text-muted-foreground" />
				<h3 class="mb-2 text-xl font-semibold">Nenhum pagamento registrado</h3>
				<p class="mb-4 text-muted-foreground">Comece registrando o primeiro pagamento</p>
				<button
					type="button"
					on:click={openCreateDrawer}
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
							use:enhance={() => {
								return async ({ result, update }) => {
									if (result.type === 'success') {
										closeDrawer();
									}
									await update();
								};
							}}
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
							use:enhance={() => {
								return async ({ result, update }) => {
									if (result.type === 'success') {
										closeDrawer();
									}
									await update();
								};
							}}
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
						use:enhance={() => {
							return async ({ result, update }) => {
								if (result.type === 'success') {
									closeDrawer();
								}
								await update();
							};
						}}
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

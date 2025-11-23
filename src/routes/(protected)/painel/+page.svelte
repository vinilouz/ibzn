<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { goto, invalidateAll } from '$app/navigation';
	import { Users, Plus, Trash2, Search, ChevronLeft, ChevronRight, Pencil } from 'lucide-svelte';
	import { CalendarDate, getLocalTimeZone, type DateValue } from '@internationalized/date';
	import { enhance } from '$app/forms';
	import { enhanceWithLoadingAndCallback } from '$lib/utils/enhance';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let selectedDate = $state<DateValue>(
		new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())
	);
	let showForm = $state(false);
	let editingEventId = $state<number | null>(null);
	let eventForm = $state({
		nome: '',
		descricao: '',
		startTime: '09:00',
		endTime: '10:00'
	});
	let showValues = $state(false);

	// Event listing state
	let eventSearchQuery = $state('');
	let eventCurrentPage = $state(1);
	let filterBySelectedDate = $state(true);
	const eventsPerPage = 5;

	// Get dates that have events
	const eventDates = $derived.by(() => {
		if (!data.events) return new Set<string>();
		const dates = new Set(data.events.map(event => {
			const date = new Date(event.start);
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, '0');
			const day = String(date.getDate()).padStart(2, '0');
			return `${year}-${month}-${day}`;
		}));
		
		return dates;
	});

	// Filter and paginate all events
	const filteredAllEvents = $derived.by(() => {
		if (!data.events) return [];
		let events = data.events;

		// Filter by selected date if enabled
		if (filterBySelectedDate && selectedDate) {
			const year = selectedDate.year;
			const month = String(selectedDate.month).padStart(2, '0');
			const day = String(selectedDate.day).padStart(2, '0');
			const selectedDateStr = `${year}-${month}-${day}`;
			
			events = events.filter(event => {
				const date = new Date(event.start);
				const eventYear = date.getFullYear();
				const eventMonth = String(date.getMonth() + 1).padStart(2, '0');
				const eventDay = String(date.getDate()).padStart(2, '0');
				const eventDateStr = `${eventYear}-${eventMonth}-${eventDay}`;
				return eventDateStr === selectedDateStr;
			});
		}

		// Filter by search
		if (eventSearchQuery.trim()) {
			const search = eventSearchQuery.toLowerCase();
			events = events.filter(event =>
				event.nome?.toLowerCase().includes(search) ||
				event.descricao?.toLowerCase().includes(search)
			);
		}

		return events;
	});

	const paginatedEvents = $derived.by(() => {
		const start = (eventCurrentPage - 1) * eventsPerPage;
		const end = start + eventsPerPage;
		return filteredAllEvents.slice(start, end);
	});

	const totalEventPages = $derived(Math.ceil(filteredAllEvents.length / eventsPerPage));

	// Reset page when search, filter, or selected date changes
	let prevEventSearch = '';
	let prevFilterByDate = false;
	let prevSelectedDateStr = '';
	$effect(() => {
		const currentDateStr = selectedDate ? selectedDate.toString() : '';
		if (eventSearchQuery !== prevEventSearch || filterBySelectedDate !== prevFilterByDate || currentDateStr !== prevSelectedDateStr) {
			eventCurrentPage = 1;
			prevEventSearch = eventSearchQuery;
			prevFilterByDate = filterBySelectedDate;
			prevSelectedDateStr = currentDateStr;
		}
	});

	function formatDateRange(start: string, end?: string | null): string {
		const startDate = new Date(start);
		const startTime = startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

		if (!end) return startTime;

		const endDate = new Date(end);
		const endTime = endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
		return `${startTime} - ${endTime}`;
	}

	function openCreateEventForm() {
		editingEventId = null;
		eventForm = {
			nome: '',
			descricao: '',
			startTime: '09:00',
			endTime: '10:00'
		};
		showForm = true;
	}

	function openEditEventForm(event: any) {
		editingEventId = event.id;
		const startDate = new Date(event.start);
		const startTime = startDate.toTimeString().slice(0, 5);

		let endTime = '10:00';
		if (event.end) {
			const endDate = new Date(event.end);
			endTime = endDate.toTimeString().slice(0, 5);
		}

		// Set selected date to event date
		const eventDate = new Date(event.start);
		selectedDate = new CalendarDate(eventDate.getFullYear(), eventDate.getMonth() + 1, eventDate.getDate());

		eventForm = {
			nome: event.nome,
			descricao: event.descricao || '',
			startTime,
			endTime
		};
		showForm = true;
	}

	function resetForm() {
		eventForm = {
			nome: '',
			descricao: '',
			startTime: '09:00',
			endTime: '10:00'
		};
		editingEventId = null;
		showForm = false;
	}

	function formatEventDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString('pt-BR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric'
		});
	}

	// Reactive form date-time values
	const formStartDateTime = $derived.by(() => {
		// Formatar data diretamente sem conversão UTC
		const year = selectedDate.year;
		const month = String(selectedDate.month).padStart(2, '0');
		const day = String(selectedDate.day).padStart(2, '0');
		const dateStr = `${year}-${month}-${day}`;
		return `${dateStr}T${eventForm.startTime}`;
	});

	const formEndDateTime = $derived.by(() => {
		// Formatar data diretamente sem conversão UTC
		const year = selectedDate.year;
		const month = String(selectedDate.month).padStart(2, '0');
		const day = String(selectedDate.day).padStart(2, '0');
		const dateStr = `${year}-${month}-${day}`;
		return `${dateStr}T${eventForm.endTime}`;
	});
</script>

<div class="space-y-8">
	<div class="space-y-2">
		<h1 class="text-4xl font-bold">Bem-vindo, {data.user.name}!</h1>
		<p class="text-lg text-muted-foreground">Aqui está um resumo do sistema</p>
	</div>

	<!-- Cards de estatísticas -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		<div class="rounded-lg bg-linear-to-r from-primary/10 to-primary/5 p-6 border">
			<div class="flex items-center justify-between gap-3">
				<div class="flex items-center gap-3">
					<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
						<Users class="h-6 w-6 text-primary" />
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Total de Participantes</p>
						<p class="text-3xl font-bold">{data.totalParticipants}</p>
					</div>
				</div>
				<Button
					size="sm"
					variant="outline"
					onclick={() => goto('/participants')}
				>
					Ver Detalhes
				</Button>
			</div>
		</div>

		<div class="rounded-lg bg-linear-to-r from-primary/10 to-primary/5 p-6 border">
			<div class="flex items-center justify-between gap-3">
				<div class="flex items-center gap-3">
					<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
						<Users class="h-6 w-6 text-primary" />
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Total de Facilitadores</p>
						<p class="text-3xl font-bold">{data.totalFacilitators}</p>
					</div>
				</div>
				<Button
					size="sm"
					variant="outline"
					onclick={() => goto('/facilitators')}
				>
					Ver Detalhes
				</Button>
			</div>
		</div>

		<div class="rounded-lg bg-linear-to-r from-primary/10 to-primary/5 p-6 border">
			<div class="flex items-center justify-between gap-3">
				<div class="flex items-center gap-3">
					<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
						<Users class="h-6 w-6 text-primary" />
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Salas Disponíveis</p>
						<p class="text-3xl font-bold">{data.totalRooms}</p>
					</div>
				</div>
				<Button
					size="sm"
					variant="outline"
					onclick={() => goto('/salas')}
				>
					Ver Detalhes
				</Button>
			</div>
		</div>

		<div class="rounded-lg bg-linear-to-r from-primary/10 to-primary/5 p-6 border">
			<div class="flex items-center justify-between gap-3">
				<div class="flex items-center gap-3">
					<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
						<Users class="h-6 w-6 text-primary" />
					</div>
					<div>
						<p class="text-sm text-muted-foreground">Cursos Disponíveis</p>
						<p class="text-3xl font-bold">{data.totalCourses}</p>
					</div>
				</div>
				<Button
					size="sm"
					variant="outline"
					onclick={() => goto('/cursos')}
				>
					Ver Detalhes
				</Button>
			</div>
		</div>
	</div>

	<!-- Layout: Matrículas e Pagamentos lado a lado -->
	<div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
		<!-- Card de Matrículas -->
		<Card class="w-full">
			<CardHeader>
				<CardTitle>Status das Matrículas</CardTitle>
				<CardDescription>Distribuição das matrículas por status</CardDescription>
			</CardHeader>
			<CardContent class="flex flex-col items-center gap-6">
			{#if data.activeEnrollments + data.completedEnrollments + data.cancelledEnrollments + data.droppedEnrollments + data.pendingEnrollments > 0}
				{@const total = data.activeEnrollments + data.completedEnrollments + data.cancelledEnrollments + data.droppedEnrollments + data.pendingEnrollments}
				{@const enrollments = [
					{ label: 'Ativas', value: data.activeEnrollments, color: 'hsl(142 76% 36%)' },
					{ label: 'Concluídas', value: data.completedEnrollments, color: 'hsl(221 83% 53%)' },
					{ label: 'Pendentes', value: data.pendingEnrollments, color: 'hsl(45 93% 47%)' },
					{ label: 'Canceladas', value: data.cancelledEnrollments, color: 'hsl(0 84% 60%)' },
					{ label: 'Abandonadas', value: data.droppedEnrollments, color: 'hsl(0 0% 45%)' }
				].filter(e => e.value > 0)}
				{@const radius = 80}
				{@const circumference = 2 * Math.PI * radius}

				<!-- Total de Matrículas -->
				<div class="w-full text-center pb-4 border-b">
					<p class="text-sm text-muted-foreground">Total de Matrículas</p>
					<p class="text-4xl font-bold">{total}</p>
				</div>

				<div class="flex flex-wrap items-center justify-center gap-8">
					<!-- Gráfico de pizza -->
					<svg width="200" height="200" viewBox="0 0 200 200" class="transform -rotate-90">
						{#each enrollments as enrollment, i}
							{@const percentage = (enrollment.value / total) * 100}
							{@const dashArray = (percentage / 100) * circumference}
							{@const prevPercentages = enrollments.slice(0, i).reduce((acc, e) => acc + (e.value / total) * 100, 0)}
							{@const dashOffset = -(prevPercentages / 100) * circumference}
							<circle
								cx="100"
								cy="100"
								r={radius}
								fill="none"
								stroke={enrollment.color}
								stroke-width="40"
								stroke-dasharray="{dashArray} {circumference}"
								stroke-dashoffset={dashOffset}
							/>
						{/each}
					</svg>

					<!-- Legendas -->
					<div class="grid grid-cols-2 gap-x-6 gap-y-3">
						{#each enrollments as enrollment}
							{@const percentage = (enrollment.value / total) * 100}
							<div class="flex items-center gap-3">
								<div class="w-4 h-4 rounded-full shrink-0" style="background-color: {enrollment.color}"></div>
								<div>
									<p class="text-sm text-muted-foreground">{enrollment.label}</p>
									<p class="text-xl font-bold">{enrollment.value}</p>
									<p class="text-xs text-muted-foreground">{percentage.toFixed(1)}%</p>
								</div>
							</div>
						{/each}
					</div>
				</div>

				<Button class="w-full" variant="outline" onclick={() => goto('/matriculas')}>
					Ver Matrículas
				</Button>
			{:else}
				<div class="text-center py-8">
					<p class="text-muted-foreground mb-4">Nenhuma matrícula registrada</p>
					<Button onclick={() => goto('/matriculas')}>
						Ver Matrículas
					</Button>
				</div>
			{/if}
		</CardContent>
	</Card>

		<!-- Card de Pagamentos -->
		<Card class="w-full">
			<CardHeader>
				<CardTitle>Status dos Pagamentos</CardTitle>
				<CardDescription>Distribuição entre pagamentos pagos e pendentes</CardDescription>
			</CardHeader>
			<CardContent class="flex flex-col items-center gap-6">
				{#if data.paidPayments + data.pendingPayments > 0}
					{@const total = showValues ? data.paidTotal + data.pendingTotal : data.paidPayments + data.pendingPayments}
					{@const paidValue = showValues ? data.paidTotal : data.paidPayments}
					{@const pendingValue = showValues ? data.pendingTotal : data.pendingPayments}
					{@const paidPercentage = (paidValue / total) * 100}
					{@const pendingPercentage = (pendingValue / total) * 100}
					{@const paidAngle = (paidPercentage / 100) * 360}
					{@const pendingAngle = (pendingPercentage / 100) * 360}

					<div class="flex items-center gap-8">
						<svg width="200" height="200" viewBox="0 0 200 200" class="transform -rotate-90">
							<!-- Pago (verde) -->
							<circle
								cx="100"
								cy="100"
								r="80"
								fill="none"
								stroke="hsl(142 76% 36%)"
								stroke-width="40"
								stroke-dasharray="{(paidAngle / 360) * (2 * Math.PI * 80)} {2 * Math.PI * 80}"
								stroke-dashoffset="0"
							/>
							<!-- Pendente (amarelo/laranja) -->
							<circle
								cx="100"
								cy="100"
								r="80"
								fill="none"
								stroke="hsl(45 93% 47%)"
								stroke-width="40"
								stroke-dasharray="{(pendingAngle / 360) * (2 * Math.PI * 80)} {2 * Math.PI * 80}"
								stroke-dashoffset="{-(paidAngle / 360) * (2 * Math.PI * 80)}"
							/>
						</svg>

						<div class="space-y-4">
							<div class="flex items-center gap-3">
								<div class="w-4 h-4 rounded-full" style="background-color: hsl(142 76% 36%)"></div>
								<div>
									<p class="text-sm text-muted-foreground">Pago</p>
									<p class="text-2xl font-bold">
										{#if showValues}
											R$ {paidValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
										{:else}
											{paidValue}
										{/if}
									</p>
									<p class="text-xs text-muted-foreground">{paidPercentage.toFixed(1)}%</p>
								</div>
							</div>
							<div class="flex items-center gap-3">
								<div class="w-4 h-4 rounded-full" style="background-color: hsl(45 93% 47%)"></div>
								<div>
									<p class="text-sm text-muted-foreground">Pendente</p>
									<p class="text-2xl font-bold">
										{#if showValues}
											R$ {pendingValue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
										{:else}
											{pendingValue}
										{/if}
									</p>
									<p class="text-xs text-muted-foreground">{pendingPercentage.toFixed(1)}%</p>
								</div>
							</div>
						</div>
					</div>

					<div class="w-full space-y-2">
						<Button class="w-full" variant="outline" onclick={() => showValues = !showValues}>
							{showValues ? 'Pessoas' : 'Valores'}
						</Button>
						<Button class="w-full" variant="outline" onclick={() => goto('/payments')}>
							Ver Pagamentos
						</Button>
					</div>
				{:else}
					<div class="text-center py-8">
						<p class="text-muted-foreground mb-4">Nenhum pagamento registrado</p>
						<Button onclick={() => goto('/payments')}>
							Ver Pagamentos
						</Button>
					</div>
				{/if}
			</CardContent>
		</Card>
	</div>

	<!-- Calendário e Eventos -->
	<div class="grid grid-cols-1 xl:grid-cols-2 gap-6">
		<!-- Card do Calendário / Formulário -->
		<Card>
			<CardHeader>
				<div class="flex items-center justify-between">
					<div>
						<CardTitle>Eventos</CardTitle>
						<CardDescription>
							{showForm ? (editingEventId ? 'Editar evento' : 'Criar novo evento') : 'Clique em uma data para ver os eventos'}
						</CardDescription>
					</div>
					<Button variant="ghost" size="icon" title={showForm ? 'Voltar ao Calendário' : 'Adicionar Evento'} onclick={() => showForm ? resetForm() : openCreateEventForm()}>
						<Plus class="h-4 w-4 {showForm ? 'rotate-45' : ''} transition-transform" />
						<span class="sr-only">{showForm ? 'Voltar' : 'Adicionar Evento'}</span>
					</Button>
				</div>
			</CardHeader>
			<CardContent>
				{#if showForm}
					<!-- Formulário de Criação/Edição -->
					<form 
						method="POST" 
						action={editingEventId ? '?/updateEvent' : '?/createEvent'} 
						use:enhance={enhanceWithLoadingAndCallback({
							loadingMessage: editingEventId ? 'Atualizando evento...' : 'Criando evento...',
							onSuccess: async () => {
								resetForm();
								await invalidateAll();
							}
						})} 
						class="space-y-4"
					>
						{#if editingEventId}
							<input type="hidden" name="id" value={editingEventId} />
						{/if}

						<div class="space-y-2">
							<Label for="eventDate">Data do Evento *</Label>
							<input
								id="eventDate"
								type="date"
								class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								value={`${selectedDate.year}-${String(selectedDate.month).padStart(2, '0')}-${String(selectedDate.day).padStart(2, '0')}`}
								onchange={(e) => {
									const target = e.target as HTMLInputElement;
									if (target.value) {
										const [year, month, day] = target.value.split('-').map(Number);
										selectedDate = new CalendarDate(year, month, day);
									}
								}}
							/>
						</div>

						<div class="space-y-2">
							<Label for="nome">Nome do Evento *</Label>
							<input
								id="nome"
								name="nome"
								type="text"
								class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								bind:value={eventForm.nome}
								required
							/>
						</div>

						<div class="space-y-2">
							<Label for="descricao">Descrição</Label>
							<textarea
								id="descricao"
								name="descricao"
								rows={3}
								class="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
								bind:value={eventForm.descricao}
							></textarea>
						</div>

						<div class="grid grid-cols-2 gap-4">
							<div class="space-y-2">
								<Label for="startTime">Hora de Início *</Label>
								<input
									id="startTime"
									name="startTime"
									type="time"
									class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									bind:value={eventForm.startTime}
									required
								/>
							</div>

							<div class="space-y-2">
								<Label for="endTime">Hora de Fim</Label>
								<input
									id="endTime"
									name="endTime"
									type="time"
									class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
									bind:value={eventForm.endTime}
								/>
							</div>
						</div>

						<input type="hidden" name="start" value={formStartDateTime} />
						<input type="hidden" name="end" value={formEndDateTime} />

						<div class="flex gap-2 pt-4">
							<Button type="submit" class="flex-1">{editingEventId ? 'Salvar' : 'Criar Evento'}</Button>
							<Button type="button" variant="outline" onclick={resetForm}>Cancelar</Button>
						</div>
					</form>
				{:else}
					<!-- Calendário com marcadores -->
					<div class="flex justify-center items-center w-full min-h-[400px]">
						<Calendar 
							type="single" 
							bind:value={selectedDate} 
							class="bg-transparent p-0 scale-[1.275] [&_table]:w-full [&_td]:p-1 [&_th]:p-1"
						>
							{#snippet day({ day, outsideMonth })}
								{@const dateStr = day ? `${day.year}-${String(day.month).padStart(2, '0')}-${String(day.day).padStart(2, '0')}` : ''}
								{@const hasEvent = dateStr ? eventDates.has(dateStr) : false}
								
								<button
									type="button"
									class="relative flex h-10 w-10 items-center justify-center rounded-md cursor-pointer hover:bg-accent transition-colors"
									onclick={() => {
										if (day) {
											selectedDate = new CalendarDate(day.year, day.month, day.day);
											filterBySelectedDate = true;
										}
									}}
								>
									<span class="{outsideMonth ? 'text-muted-foreground/50' : ''}">
										{day?.day}
									</span>
									{#if hasEvent && !outsideMonth}
										<span class="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary"></span>
									{/if}
								</button>
							{/snippet}
						</Calendar>
					</div>

				{/if}
			</CardContent>
		</Card>

		<!-- Card da Listagem de Eventos -->
		<Card>
			<CardHeader>
				<div class="flex items-start justify-between">
					<div>
						<CardTitle>
							{#if filterBySelectedDate}
								Eventos em {selectedDate.toDate(getLocalTimeZone()).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' })} ({filteredAllEvents.length})
							{:else}
								Todos os Eventos ({filteredAllEvents.length})
							{/if}
						</CardTitle>
						<CardDescription>
							{#if filterBySelectedDate}
								Clique em outra data no calendário para filtrar
							{:else}
								Lista completa de eventos cadastrados
							{/if}
						</CardDescription>
					</div>
					<div class="flex gap-2 items-center">
						{#if filterBySelectedDate}
							<Button
								variant="outline"
								size="sm"
								onclick={() => filterBySelectedDate = false}
							>
								Mostrar todos os eventos
							</Button>
						{:else}
							<Button
								variant="outline"
								size="sm"
								onclick={() => filterBySelectedDate = true}
							>
								Filtrar por data
							</Button>
						{/if}
						<Input
							type="date"
							class="w-auto"
							onchange={(e) => {
								const target = e.target as HTMLInputElement;
								if (target.value) {
									const [year, month, day] = target.value.split('-').map(Number);
									selectedDate = new CalendarDate(year, month, day);
									filterBySelectedDate = true;
								}
							}}
						/>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				<!-- Search Bar -->
				<div class="relative mb-4">
					<Search class="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<Input
						type="text"
						placeholder="Buscar eventos..."
						bind:value={eventSearchQuery}
						class="pl-10"
					/>
				</div>

				<!-- Event List -->
				<div class="space-y-2 min-h-[280px]">
					{#if paginatedEvents.length > 0}
						{#each paginatedEvents as event (event.id)}
							<div class="bg-muted relative rounded-md p-3 text-sm hover:bg-muted/80 transition-colors group">
								<div class="flex items-start justify-between">
									<div class="flex-1">
										<div class="font-medium">{event.nome}</div>
										<div class="text-muted-foreground text-xs">
											{formatEventDate(event.start)} • {formatDateRange(event.start, event.end)}
										</div>
										{#if event.descricao}
											<div class="text-muted-foreground text-xs mt-1 line-clamp-1">{event.descricao}</div>
										{/if}
									</div>
									<div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
										<Button variant="ghost" size="icon" class="h-7 w-7" onclick={() => openEditEventForm(event)}>
											<Pencil class="h-3 w-3" />
										</Button>
										<form 
											method="POST" 
											action="?/deleteEvent" 
											use:enhance={enhanceWithLoadingAndCallback({
												loadingMessage: 'Deletando evento...',
												onSuccess: async () => {
													await invalidateAll();
												}
											})}
										>
											<input type="hidden" name="id" value={event.id} />
											<Button type="submit" variant="ghost" size="icon" class="h-7 w-7 hover:bg-destructive/10">
												<Trash2 class="h-3 w-3 text-destructive" />
											</Button>
										</form>
									</div>
								</div>
							</div>
						{/each}
					{:else}
						<div class="text-center py-8 text-muted-foreground">
							{#if eventSearchQuery}
								Nenhum evento encontrado
							{:else if filterBySelectedDate}
								Nenhum evento nesta data
							{:else}
								Nenhum evento cadastrado
							{/if}
						</div>
					{/if}
				</div>

				<!-- Pagination -->
				{#if totalEventPages > 1}
					<div class="flex items-center justify-between mt-4 pt-4 border-t">
						<Button
							variant="outline"
							size="sm"
							disabled={eventCurrentPage === 1}
							onclick={() => eventCurrentPage--}
						>
							<ChevronLeft class="h-4 w-4" />
						</Button>

						<span class="text-sm text-muted-foreground">
							{eventCurrentPage} / {totalEventPages}
						</span>

						<Button
							variant="outline"
							size="sm"
							disabled={eventCurrentPage === totalEventPages}
							onclick={() => eventCurrentPage++}
						>
							<ChevronRight class="h-4 w-4" />
						</Button>
					</div>
				{/if}
			</CardContent>
		</Card>
	</div>
</div>

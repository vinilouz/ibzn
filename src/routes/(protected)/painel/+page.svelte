<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Calendar } from '$lib/components/ui/calendar';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import { goto, invalidateAll } from '$app/navigation';
	import { Users, Plus, Trash2 } from 'lucide-svelte';
	import { CalendarDate, getLocalTimeZone, type DateValue } from '@internationalized/date';
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let selectedDate = $state<DateValue>(
		new CalendarDate(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate())
	);
	let sheetOpen = $state(false);
	let editingEventId = $state<number | null>(null);
	let eventForm = $state({
		nome: '',
		descricao: '',
		startTime: '09:00',
		endTime: '10:00'
	});
	let showValues = $state(false);

	// Filtrar eventos pela data selecionada
	const filteredEvents = $derived(() => {
		if (!selectedDate || !data.events) return [];

		const selectedDateStr = selectedDate.toDate(getLocalTimeZone()).toISOString().split('T')[0];

		return data.events.filter(event => {
			const eventDateStr = new Date(event.start).toISOString().split('T')[0];
			return eventDateStr === selectedDateStr;
		});
	});

	function formatDateRange(start: string, end?: string | null): string {
		const startDate = new Date(start);
		const startTime = startDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

		if (!end) return startTime;

		const endDate = new Date(end);
		const endTime = endDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
		return `${startTime} - ${endTime}`;
	}

	function openCreateEventSheet() {
		editingEventId = null;
		eventForm = {
			nome: '',
			descricao: '',
			startTime: '09:00',
			endTime: '10:00'
		};
		sheetOpen = true;
	}

	function openEditEventSheet(event: any) {
		editingEventId = event.id;
		const startDate = new Date(event.start);
		const startTime = startDate.toTimeString().slice(0, 5);

		let endTime = '10:00';
		if (event.end) {
			const endDate = new Date(event.end);
			endTime = endDate.toTimeString().slice(0, 5);
		}

		eventForm = {
			nome: event.nome,
			descricao: event.descricao || '',
			startTime,
			endTime
		};
		sheetOpen = true;
	}

	function resetForm() {
		eventForm = {
			nome: '',
			descricao: '',
			startTime: '09:00',
			endTime: '10:00'
		};
		editingEventId = null;
		sheetOpen = false;
	}

	function getFormDateTimes() {
		const date = selectedDate.toDate(getLocalTimeZone());
		const dateStr = date.toISOString().split('T')[0];
		return {
			start: `${dateStr}T${eventForm.startTime}`,
			end: `${dateStr}T${eventForm.endTime}`
		};
	}
</script>

<div class="space-y-8">
	<div class="space-y-2">
		<h1 class="text-4xl font-bold">Bem-vindo, {data.user.name}!</h1>
		<p class="text-lg text-muted-foreground">Aqui está um resumo do sistema</p>
	</div>

	<!-- Cards de estatísticas -->
	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
		<div class="rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-6 border">
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

		<div class="rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-6 border">
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

		<div class="rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-6 border">
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

		<div class="rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-6 border">
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
								<div class="w-4 h-4 rounded-full flex-shrink-0" style="background-color: {enrollment.color}"></div>
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
	<div class="flex justify-center">
		<div class="flex gap-6 w-full {sheetOpen ? 'max-w-6xl' : 'max-w-4xl'}">
			<Card class="w-fit">
				<CardHeader>
					<CardTitle>Eventos</CardTitle>
					<CardDescription>Gerencie os eventos do calendário</CardDescription>
				</CardHeader>
				<CardContent class="p-0">
					<div class="flex gap-0">
						<div class="p-4">
							<Calendar type="single" bind:value={selectedDate} class="bg-transparent p-0" preventDeselect />
						</div>
						<div class="flex flex-col border-l w-[300px]">
							<div class="flex items-center justify-between border-b px-4 py-3">
								<div class="text-sm font-medium">
									{selectedDate.toDate(getLocalTimeZone()).toLocaleDateString('pt-BR', {
										day: 'numeric',
										month: 'long',
										year: 'numeric',
									})}
								</div>
								<Button variant="ghost" size="icon" class="size-8" title="Adicionar Evento" onclick={openCreateEventSheet}>
									<Plus class="h-4 w-4" />
									<span class="sr-only">Adicionar Evento</span>
								</Button>
							</div>
							<div class="flex flex-col gap-2 p-4 overflow-y-auto h-[320px]">
								{#each filteredEvents() as event (event.id)}
									<div class="bg-muted after:bg-primary/70 relative rounded-md p-2 pl-6 pr-16 text-sm after:absolute after:inset-y-2 after:left-2 after:w-1 after:rounded-full hover:bg-muted/80 transition-colors group cursor-pointer" onclick={() => openEditEventSheet(event)}>
										<div class="font-medium">{event.nome}</div>
										<div class="text-muted-foreground text-xs">
											{formatDateRange(event.start, event.end)}
										</div>
										{#if event.descricao}
											<div class="text-muted-foreground text-xs mt-1">{event.descricao}</div>
										{/if}
										<form method="POST" action="?/deleteEvent" use:enhance={() => {
											return async ({ result }) => {
												if (result.type === 'success') {
													await invalidateAll();
												}
											};
										}} class="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity" onclick={(e) => e.stopPropagation()}>
											<input type="hidden" name="id" value={event.id} />
											<Button type="submit" variant="ghost" size="icon" class="h-6 w-6 hover:bg-destructive/10">
												<Trash2 class="h-3 w-3 text-destructive" />
											</Button>
										</form>
									</div>
								{:else}
									<p class="text-sm text-muted-foreground text-center py-4">Nenhum evento nesta data</p>
								{/each}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<!-- Card para criar/editar evento -->
			{#if sheetOpen}
				<Card class="w-[400px] flex-shrink-0">
					<CardHeader>
						<CardTitle>{editingEventId ? 'Editar Evento' : 'Criar Novo Evento'}</CardTitle>
						<CardDescription>
							{editingEventId ? 'Edite os detalhes do evento' : 'Adicione um novo evento ao calendário'}
						</CardDescription>
					</CardHeader>
					<CardContent>
						<form method="POST" action={editingEventId ? '?/updateEvent' : '?/createEvent'} use:enhance={() => {
							return async ({ result }) => {
								if (result.type === 'success') {
									resetForm();
									await invalidateAll();
								}
							};
						}} class="space-y-4">
							{#if editingEventId}
								<input type="hidden" name="id" value={editingEventId} />
							{/if}

							<div class="space-y-2">
								<Label>Data do Evento</Label>
								<div class="text-sm font-medium p-2 bg-muted rounded-md">
									{selectedDate.toDate(getLocalTimeZone()).toLocaleDateString('pt-BR', {
										day: 'numeric',
										month: 'long',
										year: 'numeric',
									})}
								</div>
							</div>

							<div class="space-y-2">
								<Label for="nome">Nome do Evento *</Label>
								<Input id="nome" name="nome" bind:value={eventForm.nome} required />
							</div>

							<div class="space-y-2">
								<Label for="descricao">Descrição</Label>
								<Textarea id="descricao" name="descricao" bind:value={eventForm.descricao} rows={3} />
							</div>

							<div class="grid grid-cols-2 gap-4">
								<div class="space-y-2">
									<Label for="startTime">Hora de Início *</Label>
									<Input id="startTime" name="startTime" type="time" bind:value={eventForm.startTime} required />
								</div>

								<div class="space-y-2">
									<Label for="endTime">Hora de Fim</Label>
									<Input id="endTime" name="endTime" type="time" bind:value={eventForm.endTime} />
								</div>
							</div>

							<input type="hidden" name="start" value={getFormDateTimes().start} />
							<input type="hidden" name="end" value={getFormDateTimes().end} />

							<div class="flex gap-2 pt-4">
								<Button type="submit" class="flex-1">{editingEventId ? 'Salvar' : 'Criar Evento'}</Button>
								<Button type="button" variant="outline" onclick={resetForm}>Cancelar</Button>
							</div>
						</form>
					</CardContent>
				</Card>
			{/if}
		</div>
	</div>
</div>
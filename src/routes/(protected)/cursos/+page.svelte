<script lang="ts">
	import { enhance } from '$app/forms';
	import { page } from '$app/stores';
	import { goto, invalidateAll } from '$app/navigation';
	import type { PageData } from './$types';
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
	import { Plus } from 'lucide-svelte';

	interface CourseFormData {
		courseName: string;
		description: string;
		price: string;
		capacity: string;
		duration: string;
		sessionsInfo: string;
		startDate: string;
		weekdays: string; 
		startTime: string;
		endTime: string;
		teacher: string;
		room: string;
	}

	let { data }: { data: PageData } = $props();
    $effect(() => {
		console.log('Data recebida:', data);
		console.log('Facilitators:', data.facilitators);
		console.log('Rooms:', data.rooms);
	});

	let editingCourse = $state<number | null>(null);
	
	const initialFormData: CourseFormData = {
		courseName: '',
		description: '',
		price: '',
		capacity: '',
		duration: '',
		sessionsInfo: '',
		startDate: '',
		weekdays: '',
		startTime: '',
		endTime: '',
		teacher: '',
		room: ''
	};
	
	let formData = $state<CourseFormData>({ ...initialFormData });

	const weekdayOptions = [
		{ value: 'sunday', label: 'Domingo' },
		{ value: 'monday', label: 'Segunda' },
		{ value: 'tuesday', label: 'Terça' },
		{ value: 'wednesday', label: 'Quarta' },
		{ value: 'thursday', label: 'Quinta' },
		{ value: 'friday', label: 'Sexta' },
		{ value: 'saturday', label: 'Sábado' }
	];

	const activeView = $derived.by(() => {
		const view = $page.url.searchParams.get('view');
		return view === 'create' ? 'form' : (view === 'edit' ? 'form' : 'list');
	}) as 'list' | 'form';

	const isEditing = $derived(editingCourse !== null);

	// Usar $effect para carregar dados quando URL mudar
	$effect(() => {
		const view = $page.url.searchParams.get('view');
		const id = $page.url.searchParams.get('id');

		if (view === 'edit' && id) {
			const courseId = parseInt(id);
			const course = data.courses?.find((c) => c.id === courseId);

			if (course) {
				editingCourse = courseId;
				// Usar setTimeout para garantir que os valores sejam atualizados após o render
				setTimeout(() => {
					formData = {
						courseName: course.courseName || '',
						description: course.description || '',
						price: course.price?.toString() || '',
						capacity: course.capacity?.toString() || '',
						duration: course.duration?.toString() || '',
						sessionsInfo: course.sessionsInfo || '',
						startDate: course.startDate || '',
						weekdays: course.weekdays || '',
						startTime: course.startTime || '',
						endTime: course.endTime || '',
						teacher: course.teacher?.toString() || '',
						room: course.room?.toString() || ''
					};
				}, 0);
			}
		} else if (view === 'create') {
			// Limpar form ao criar novo
			editingCourse = null;
			formData = { ...initialFormData };
		} else if (view === 'list' || !view) {
			// Limpar ao voltar para lista
			editingCourse = null;
			formData = { ...initialFormData };
		}
	});

	function startEdit(course: any) {
		editingCourse = course.id;
		formData = {
			courseName: course.courseName || '',
			description: course.description || '',
			price: course.price?.toString() || '',
			capacity: course.capacity?.toString() || '',
			duration: course.duration?.toString() || '',
			sessionsInfo: course.sessionsInfo || '',
			startDate: course.startDate || '',
			weekdays: course.weekdays || '',
			startTime: course.startTime || '',
			endTime: course.endTime || '',
			teacher: course.teacher?.toString() || '',
			room: course.room?.toString() || ''
		};
		goto(`/cursos?view=edit&id=${course.id}`);
	}

	function resetForm() {
		editingCourse = null;
		formData = { ...initialFormData };
	}

	function cancelEdit() {
		resetForm();
		goto('/cursos?view=list');
	}

	function navigateToCreate() {
		resetForm();
		goto('/cursos?view=create');
	}

	function handleFormSubmit() {
		return async ({ result, update }: any) => {
			// Atualizar dados no servidor
			await update();

			if (result.type === 'success') {
				// Invalidar todos os dados para forçar reload
				await invalidateAll();
				// Limpar form e navegar
				resetForm();
				goto('/cursos?view=list');
			}
		};
	}

	function handleDelete() {
		return async ({ cancel, result, update }: any) => {
			// Confirmar antes de deletar
			const confirmed = confirm('Tem certeza que deseja excluir este curso?');
			if (!confirmed) {
				cancel();
				return;
			}

			await update();
			if (result.type === 'success') {
				await invalidateAll();
			}
		};
	}

	function formatDate(date: string | null) {
		if (!date) return 'A definir';
		return new Date(date).toLocaleDateString('pt-BR');
	}

	function formatPrice(price: number | null) {
		if (!price) return '-';
		return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
	}

	function getWeekdayLabel(weekday: string | null) {
		if (!weekday) return '-';
		return weekdayOptions.find(opt => opt.value === weekday)?.label || weekday;
	}

	function formatTimeRange(start: string | null, end: string | null) {
		if (!start || !end) return '-';
		return `${start.substring(0, 5)} - ${end.substring(0, 5)}`;
	}
</script>

<div class="mx-auto w-full max-w-7xl p-8">
	<div class="mb-8 flex items-center justify-between">
		<h1 class="text-3xl font-bold">Gerenciamento de Cursos</h1>
		{#if activeView === 'list'}
			<Button onclick={navigateToCreate}>
				<Plus class="mr-2 h-4 w-4" />
				Novo Curso
			</Button>
		{/if}
	</div>

	{#if activeView === 'list'}
		<Card>
			<CardHeader>
				<CardTitle>Cursos Cadastrados ({data.courses?.length || 0})</CardTitle>
			</CardHeader>
			<CardContent>
				<div class="rounded-md border overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>ID</TableHead>
								<TableHead>Nome</TableHead>
								<TableHead>Professor</TableHead>
								<TableHead>Sala</TableHead>
								<TableHead>Preço</TableHead>
								<TableHead>Inscrições</TableHead>
								<TableHead>Duração</TableHead>
								<TableHead>Dia/Horário</TableHead>
								<TableHead>Data Início</TableHead>
								<TableHead>Status</TableHead>
								<TableHead class="text-right">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{#if data.courses && data.courses.length > 0}
								{#each data.courses as course (course.id)}
									<TableRow>
										<TableCell class="font-medium">{course.id}</TableCell>
										<TableCell class="max-w-xs truncate">{course.courseName}</TableCell>
										<TableCell>{course.teacherName || '-'}</TableCell>
										<TableCell>{course.roomName ? `${course.roomName} (${course.roomNumber})` : '-'}</TableCell>
										<TableCell>{formatPrice(course.price)}</TableCell>
										<TableCell>
											<span class="font-medium">
												{course.enrollmentCount || 0}/{course.capacity}
											</span>
										</TableCell>
										<TableCell>{course.duration}h</TableCell>
										<TableCell class="text-xs">
											{getWeekdayLabel(course.weekdays)}<br />
											{formatTimeRange(course.startTime, course.endTime)}
										</TableCell>
										<TableCell>{formatDate(course.startDate)}</TableCell>
										<TableCell>
											<span
												class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold {course.isFull
													? 'bg-red-100 text-red-800'
													: 'bg-green-100 text-green-800'}"
											>
												{course.isFull ? 'Cheio' : 'Disponível'}
											</span>
										</TableCell>
										<TableCell class="text-right">
											<div class="flex justify-end gap-2">
												<Button
													type="button"
													variant="outline"
													size="sm"
													onclick={() => startEdit(course)}
												>
													Editar
												</Button>
												<form
													method="POST"
													action="?/delete"
													use:enhance={handleDelete}
													class="inline"
												>
													<input type="hidden" name="id" value={course.id} />
													<Button type="submit" variant="destructive" size="sm">Excluir</Button>
												</form>
											</div>
										</TableCell>
									</TableRow>
								{/each}
							{:else}
								<TableRow>
									<TableCell colspan={11} class="h-24 text-center">
										Nenhum curso encontrado. Crie seu primeiro curso!
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
					{isEditing ? 'Editar Curso' : 'Novo Curso'}
				</CardTitle>
			</CardHeader>
			<CardContent>
				<form
					method="POST"
					action="?/{isEditing ? 'update' : 'create'}"
					use:enhance={handleFormSubmit}
					class="space-y-6"
				>
					{#if isEditing}
						<input type="hidden" name="id" value={editingCourse} />
					{/if}

					
					<div class="space-y-4">
						<h3 class="text-lg font-semibold">Informações Básicas</h3>
						
						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div class="space-y-2 md:col-span-2">
								<Label for="courseName">Nome do Curso *</Label>
								<Input
									type="text"
									id="courseName"
									name="courseName"
									bind:value={formData.courseName}
									required
									placeholder="Ex: Curso Profissionalizante para Maquiador"
								/>
							</div>

							<div class="space-y-2 md:col-span-2">
								<Label for="description">Descrição</Label>
								<Textarea
									id="description"
									name="description"
									bind:value={formData.description}
									placeholder="Descreva o curso, seus objetivos, público-alvo..."
									rows={4}
								/>
							</div>

							<div class="space-y-2">
								<Label for="price">Preço (R$) *</Label>
								<Input
									type="number"
									step="0.01"
									id="price"
									name="price"
									bind:value={formData.price}
									required
									placeholder="Ex: 1500.00"
								/>
							</div>

							<div class="space-y-2">
								<Label for="capacity">Capacidade *</Label>
								<Input
									type="number"
									id="capacity"
									name="capacity"
									bind:value={formData.capacity}
									required
									placeholder="Ex: 10"
								/>
							</div>

							<div class="space-y-2">
								<Label for="duration">Duração (horas totais) *</Label>
								<Input
									type="number"
									id="duration"
									name="duration"
									bind:value={formData.duration}
									required
									placeholder="Ex: 160"
								/>
							</div>

							<div class="space-y-2">
								<Label for="sessionsInfo">Info das Sessões</Label>
								<Input
									type="text"
									id="sessionsInfo"
									name="sessionsInfo"
									bind:value={formData.sessionsInfo}
									placeholder="Ex: 4 encontros de 2h30"
								/>
							</div>
						</div>
					</div>

					
					<div class="space-y-4">
						<h3 class="text-lg font-semibold">Recursos</h3>
						
						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div class="space-y-2">
								<Label for="teacher">Professor *</Label>
								<select
									id="teacher"
									name="teacher"
									bind:value={formData.teacher}
									required
									class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								>
									<option value="">Selecione um professor</option>
									{#each data.facilitators as facilitator}
										<option value={facilitator.id}>{facilitator.name}</option>
									{/each}
								</select>
							</div>

							<div class="space-y-2">
								<Label for="room">Sala *</Label>
								<select
									id="room"
									name="room"
									bind:value={formData.room}
									required
									class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								>
									<option value="">Selecione uma sala</option>
									{#each data.rooms as room}
										<option value={room.id}>{room.name} - Sala {room.number}</option>
									{/each}
								</select>
							</div>
						</div>
					</div>

					
					<div class="space-y-4">
						<h3 class="text-lg font-semibold">Datas e Horários</h3>
						
						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<div class="space-y-2">
								<Label for="startDate">Data de Início</Label>
								<Input
									type="date"
									id="startDate"
									name="startDate"
									bind:value={formData.startDate}
								/>
								<p class="text-xs text-muted-foreground">Deixe vazio para "A definir"</p>
							</div>

							<div class="space-y-2">
								<Label for="weekdays">Dia da Semana</Label>
								<select
									id="weekdays"
									name="weekdays"
									bind:value={formData.weekdays}
									class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								>
									<option value="">Selecione um dia</option>
									{#each weekdayOptions as weekday}
										<option value={weekday.value}>{weekday.label}</option>
									{/each}
								</select>
							</div>

							<div class="space-y-2">
								<Label for="startTime">Horário Início</Label>
								<Input
									type="time"
									id="startTime"
									name="startTime"
									bind:value={formData.startTime}
								/>
							</div>

							<div class="space-y-2">
								<Label for="endTime">Horário Fim</Label>
								<Input
									type="time"
									id="endTime"
									name="endTime"
									bind:value={formData.endTime}
								/>
							</div>
						</div>
					</div>

					<div class="flex gap-2 pt-4">
						<Button type="submit">
							{isEditing ? 'Atualizar Curso' : 'Criar Curso'}
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
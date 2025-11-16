<!-- src/routes/cursos/+page.svelte -->
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
	import { Plus } from 'lucide-svelte';

	interface CourseFormData {
		courseName: string;
		description: string;
		price: string;
		capacity: string;
		isFull: boolean;
		duration: string;
		hourly: string;
		weekdays: string;
		dates: string;
		startDate: string;
	}

	let { data }: { data: PageData } = $props();

	let editingCourse = $state<number | null>(null);
	
	const initialFormData: CourseFormData = {
		courseName: '',
		description: '',
		price: '',
		capacity: '',
		isFull: false,
		duration: '',
		hourly: '',
		weekdays: '',
		dates: '',
		startDate: ''
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
		const id = $page.url.searchParams.get('id');

		if (view === 'edit' && id) {
			loadCourseForEdit(parseInt(id));
			return 'form';
		}

		return view === 'create' ? 'form' : 'list';
	}) as 'list' | 'form';

	const isEditing = $derived(editingCourse !== null);

	function loadCourseForEdit(courseId: number) {
		const course = data.courses?.find((c) => c.id === courseId);
		if (course && editingCourse !== courseId) {
			editingCourse = courseId;
			formData = {
				courseName: course.courseName || '',
				description: course.description || '',
				price: course.price?.toString() || '',
				capacity: course.capacity?.toString() || '',
				isFull: course.isFull ?? false,
				duration: course.duration?.toString() || '',
				hourly: course.hourly || '',
				weekdays: course.weekdays || '',
				dates: course.dates || '',
				startDate: course.startDate || ''
			};
		}
	}

	function startEdit(course: any) {
		editingCourse = course.id;
		formData = {
			courseName: course.courseName || '',
			description: course.description || '',
			price: course.price?.toString() || '',
			capacity: course.capacity?.toString() || '',
			isFull: course.isFull ?? false,
			duration: course.duration?.toString() || '',
			hourly: course.hourly || '',
			weekdays: course.weekdays || '',
			dates: course.dates || '',
			startDate: course.startDate || ''
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
		return async ({ update }: any) => {
			await update();
			resetForm();
			goto('/cursos?view=list');
		};
	}

	function handleDelete() {
		return (e: Event) => {
			if (!confirm('Tem certeza que deseja excluir este curso?')) {
				e.preventDefault();
			}
		};
	}

	function formatDate(date: Date | string | null) {
		if (!date) return '-';
		return new Date(date).toLocaleDateString('pt-BR');
	}

	function formatPrice(price: number | null) {
		if (!price) return '-';
		return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
	}

	function getWeekdayLabel(weekday: string | null) {
		if (!weekday) return '-';
		return weekdayOptions.find(w => w.value === weekday)?.label || weekday;
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
								<TableHead>Preço</TableHead>
								<TableHead>Capacidade</TableHead>
								<TableHead>Duração (min)</TableHead>
								<TableHead>Dia da Semana</TableHead>
								<TableHead>Horário</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Criado em</TableHead>
								<TableHead class="text-right">Ações</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{#if data.courses && data.courses.length > 0}
								{#each data.courses as course (course.id)}
									<TableRow>
										<TableCell class="font-medium">{course.id}</TableCell>
										<TableCell>{course.courseName}</TableCell>
										<TableCell>{formatPrice(course.price)}</TableCell>
										<TableCell>{course.capacity}</TableCell>
										<TableCell>{course.duration}</TableCell>
										<TableCell>{getWeekdayLabel(course.weekdays)}</TableCell>
										<TableCell>{course.hourly || '-'}</TableCell>
										<TableCell>
											<span
												class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold {course.isFull
													? 'bg-red-100 text-red-800'
													: 'bg-green-100 text-green-800'}"
											>
												{course.isFull ? 'Cheio' : 'Disponível'}
											</span>
										</TableCell>
										<TableCell>{formatDate(course.createdAt)}</TableCell>
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
													use:enhance
													class="inline"
													onsubmit={handleDelete()}
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
									<TableCell colspan={10} class="h-24 text-center">
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

					<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label for="courseName">Nome do Curso *</Label>
							<Input
								type="text"
								id="courseName"
								name="courseName"
								bind:value={formData.courseName}
								required
								placeholder="Ex: Yoga Avançado"
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
								placeholder="Ex: 150.00"
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
								placeholder="Ex: 20"
							/>
						</div>

						<div class="space-y-2">
							<Label for="duration">Duração (minutos) *</Label>
							<Input
								type="number"
								id="duration"
								name="duration"
								bind:value={formData.duration}
								required
								placeholder="Ex: 60"
							/>
						</div>

						<div class="space-y-2">
							<Label for="hourly">Horário</Label>
							<Input
								type="time"
								id="hourly"
								name="hourly"
								bind:value={formData.hourly}
								placeholder="Ex: 14:00"
							/>
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
							<Label for="startDate">Data de Início</Label>
							<Input
								type="date"
								id="startDate"
								name="startDate"
								bind:value={formData.startDate}
							/>
						</div>

						<div class="space-y-2">
							<Label for="dates">Data Específica</Label>
							<Input
								type="date"
								id="dates"
								name="dates"
								bind:value={formData.dates}
							/>
						</div>

						<div class="space-y-2 md:col-span-2">
							<Label for="isFull" class="flex items-center justify-between">
								<span>Curso Lotado</span>
								<Switch id="isFull" name="isFull" bind:checked={formData.isFull} />
							</Label>
							<p class="text-sm text-muted-foreground">
								{formData.isFull ? 'Curso está cheio' : 'Vagas disponíveis'}
							</p>
						</div>
					</div>

					<div class="space-y-2">
						<Label for="description">Descrição</Label>
						<Textarea
							id="description"
							name="description"
							bind:value={formData.description}
							placeholder="Descreva o curso, seus objetivos, etc..."
							rows={4}
						/>
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
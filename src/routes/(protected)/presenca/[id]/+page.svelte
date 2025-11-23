<script lang="ts">
	import { enhance } from '$app/forms';
	import { goto } from '$app/navigation';
	import { enhanceWithLoadingAndCallback } from '$lib/utils/enhance';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Textarea } from '$lib/components/ui/textarea';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { 
		ArrowLeft, 
		CheckCircle, 
		XCircle, 
		Clock, 
		AlertCircle, 
		Calendar,
		Plus,
		TrendingUp,
		Users
	} from 'lucide-svelte';

	type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

	let { data }: { data: any } = $props();

	let showCreateListForm = $state(false);
	let selectedDate = $state('');
	let listNotes = $state('');
	let expandedStudentId = $state<number | null>(null);
	
	// Estado local para atualização otimista
	let studentsData = $state(data.students || []);
	
	// Sincronizar com data quando mudar
	$effect(() => {
		studentsData = data.students || [];
	});

	const statusColors: Record<AttendanceStatus, string> = {
		present: 'bg-green-100 text-green-800',
		absent: 'bg-red-100 text-red-800',
		late: 'bg-yellow-100 text-yellow-800',
		excused: 'bg-blue-100 text-blue-800'
	};

	const statusLabels: Record<AttendanceStatus, string> = {
		present: 'Presente',
		absent: 'Ausente',
		late: 'Atrasado',
		excused: 'Justificado'
	};

	const statusIcons: Record<AttendanceStatus, any> = {
		present: CheckCircle,
		absent: XCircle,
		late: Clock,
		excused: AlertCircle
	};

	function formatDate(date: string | null) {
		if (!date) return '-';
		return new Date(date).toLocaleDateString('pt-BR');
	}

	function goBack() {
		goto('/presenca');
	}

	function toggleCreateListForm() {
		showCreateListForm = !showCreateListForm;
		if (showCreateListForm) {
			selectedDate = new Date().toISOString().split('T')[0];
		}
	}

	function toggleStudentDetails(participantId: number) {
		expandedStudentId = expandedStudentId === participantId ? null : participantId;
	}
	
	// Atualização otimista da presença
	function updateAttendanceOptimistically(
		participantId: number,
		listId: number,
		newStatus: AttendanceStatus
	) {
		studentsData = studentsData.map((student: any) => {
			if (student.participantId !== participantId) return student;
			
			// Encontrar o registro atual para esta lista
			const currentRecord = student.attendance.find((a: any) => a.listId === listId);
			const oldStatus = currentRecord?.status || null;
			
			// Atualizar estatísticas
			const stats = { ...student.stats };
			
			// Remover estatística antiga (se existir)
			if (oldStatus === 'present') stats.present = Math.max(0, stats.present - 1);
			else if (oldStatus === 'late') stats.late = Math.max(0, stats.late - 1);
			else if (oldStatus === 'absent') stats.absent = Math.max(0, stats.absent - 1);
			else if (oldStatus === 'excused') stats.excused = Math.max(0, stats.excused - 1);
			
			// Adicionar nova estatística
			if (newStatus === 'present') stats.present++;
			else if (newStatus === 'late') stats.late++;
			else if (newStatus === 'absent') stats.absent++;
			else if (newStatus === 'excused') stats.excused++;
			
			// Recalcular porcentagem
			const totalClasses = data.attendanceLists?.length || 0;
			stats.attendanceRate = totalClasses > 0
				? (((stats.present + stats.late) / totalClasses) * 100).toFixed(1)
				: '0.0';
			
			// Atualizar registro de presença
			const attendance = student.attendance.map((a: any) => 
				a.listId === listId ? { ...a, status: newStatus } : a
			);
			
			return { ...student, stats, attendance };
		});
	}

	const courseStats = $derived.by(() => {
		const totalStudents = studentsData?.length || 0;
		const totalClasses = data.attendanceLists?.length || 0;
		
		if (totalStudents === 0) {
			return { totalStudents, totalClasses, averageAttendance: '0.0' };
		}

		const totalPresences = studentsData.reduce((sum: number, student: any) => 
			sum + student.stats.present + student.stats.late, 0
		);
		
		const averageAttendance = totalClasses > 0 
			? (totalPresences / (totalStudents * totalClasses) * 100).toFixed(1)
			: '0.0';

		return { totalStudents, totalClasses, averageAttendance };
	});
</script>

<div class="mx-auto w-full max-w-7xl p-8">
	<div class="mb-8">
		<Button variant="ghost" onclick={goBack} class="mb-4">
			<ArrowLeft class="mr-2 h-4 w-4" />
			Voltar
		</Button>
		<div class="flex items-start justify-between">
			<div>
				<h1 class="text-3xl font-bold">{data.course?.courseName || 'Curso'}</h1>
				{#if data.course?.description}
					<p class="mt-2 text-muted-foreground">{data.course.description}</p>
				{/if}
				{#if data.course?.startDate}
					<div class="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
						<Calendar class="h-4 w-4" />
						<span>Início: {formatDate(data.course.startDate)}</span>
					</div>
				{/if}
			</div>
			<Button onclick={toggleCreateListForm}>
				<Plus class="mr-2 h-4 w-4" />
				Nova Aula
			</Button>
		</div>
	</div>

	<!-- Statistics Cards -->
	<div class="mb-6 grid gap-4 md:grid-cols-3">
		<Card>
			<CardContent class="pt-6">
				<div class="flex items-center gap-4">
					<div class="rounded-full bg-primary/10 p-3">
						<Users class="h-6 w-6 text-primary" />
					</div>
					<div>
						<p class="text-2xl font-bold">{courseStats.totalStudents}</p>
						<p class="text-sm text-muted-foreground">Alunos Matriculados</p>
					</div>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardContent class="pt-6">
				<div class="flex items-center gap-4">
					<div class="rounded-full bg-blue-100 p-3">
						<Calendar class="h-6 w-6 text-blue-600" />
					</div>
					<div>
						<p class="text-2xl font-bold">{courseStats.totalClasses}</p>
						<p class="text-sm text-muted-foreground">Aulas Realizadas</p>
					</div>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardContent class="pt-6">
				<div class="flex items-center gap-4">
					<div class="rounded-full bg-green-100 p-3">
						<TrendingUp class="h-6 w-6 text-green-600" />
					</div>
					<div>
						<p class="text-2xl font-bold">{courseStats.averageAttendance}%</p>
						<p class="text-sm text-muted-foreground">Frequência Média</p>
					</div>
				</div>
			</CardContent>
		</Card>
	</div>

	<!-- Create Attendance List Form -->
	{#if showCreateListForm}
		<Card class="mb-6">
			<CardHeader>
				<CardTitle>Registrar Nova Aula</CardTitle>
				<CardDescription>
					Crie uma lista de presença para uma nova aula. Todos os alunos matriculados serão incluídos.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form method="POST" action="?/createAttendanceList" use:enhance={enhanceWithLoadingAndCallback({
					loadingMessage: 'Criando lista de presença...',
					onSuccess: () => {
						showCreateListForm = false;
						selectedDate = '';
						listNotes = '';
					}
				})} class="space-y-4">
					<input type="hidden" name="courseId" value={data.course?.id} />
					
					<div class="grid gap-4 md:grid-cols-2">
						<div class="space-y-2">
							<Label for="date">Data da Aula *</Label>
							<Input
								id="date"
								name="date"
								type="date"
								bind:value={selectedDate}
								required
							/>
						</div>
					</div>

					<div class="space-y-2">
						<Label for="notes">Observações</Label>
						<Textarea
							id="notes"
							name="notes"
							bind:value={listNotes}
							placeholder="Tópicos da aula, avisos, etc."
							rows={3}
						/>
					</div>

					<div class="flex gap-2">
						<Button type="submit">
							<Calendar class="mr-2 h-4 w-4" />
							Criar Lista
						</Button>
						<Button type="button" variant="outline" onclick={toggleCreateListForm}>
							Cancelar
						</Button>
					</div>
				</form>
			</CardContent>
		</Card>
	{/if}

	<!-- Students List with Attendance Stats -->
	<Card>
		<CardHeader>
			<CardTitle>Lista de Alunos e Frequência</CardTitle>
			<CardDescription>
				Clique em um aluno para ver o histórico detalhado de presença
			</CardDescription>
		</CardHeader>
		<CardContent>
			{#if studentsData && studentsData.length > 0}
				<div class="space-y-4">
					{#each studentsData as student}
						<div class="rounded-lg border p-4">
							<button 
								type="button"
								class="flex items-center justify-between cursor-pointer w-full text-left"
								onclick={() => toggleStudentDetails(student.participantId)}
							>
								<div class="flex-1">
									<h3 class="font-semibold text-lg">{student.participantName}</h3>
									<p class="text-sm text-muted-foreground">{student.participantPhone}</p>
								</div>

								<div class="flex items-center gap-6 text-sm">
									<div class="text-center">
										<p class="text-2xl font-bold" class:text-green-600={parseFloat(student.stats.attendanceRate) >= 75}>
											{student.stats.attendanceRate}%
										</p>
										<p class="text-xs text-muted-foreground">Frequência</p>
									</div>

									<div class="flex gap-3">
										<div class="text-center">
											<p class="font-semibold text-green-600">{student.stats.present}</p>
											<p class="text-xs text-muted-foreground">Presente</p>
										</div>
										<div class="text-center">
											<p class="font-semibold text-yellow-600">{student.stats.late}</p>
											<p class="text-xs text-muted-foreground">Atrasado</p>
										</div>
										<div class="text-center">
											<p class="font-semibold text-red-600">{student.stats.absent}</p>
											<p class="text-xs text-muted-foreground">Ausente</p>
										</div>
										<div class="text-center">
											<p class="font-semibold text-blue-600">{student.stats.excused}</p>
											<p class="text-xs text-muted-foreground">Justificado</p>
										</div>
									</div>
								</div>
							</button>

							<!-- Expanded: Attendance History -->
							{#if expandedStudentId === student.participantId && data.attendanceLists.length > 0}
								<div class="mt-4 border-t pt-4">
									<h4 class="font-medium mb-3">Histórico de Presença</h4>
									<div class="rounded-md border">
										<Table>
											<TableHeader>
												<TableRow>
													<TableHead>Data</TableHead>
													<TableHead>Status</TableHead>
													<TableHead>Observações</TableHead>
													<TableHead>Ações</TableHead>
												</TableRow>
											</TableHeader>
											<TableBody>
												{#each data.attendanceLists as list}
													{@const record = student.records.find((r: any) => r.listId === list.id)}
													{@const status = record?.status || 'absent'}
													{@const IconComponent = statusIcons[status as AttendanceStatus]}
													<TableRow>
														<TableCell class="font-medium">
															{formatDate(list.date)}
															{#if list.notes}
																<p class="text-xs text-muted-foreground">{list.notes}</p>
															{/if}
														</TableCell>
														<TableCell>
															<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold {statusColors[status as AttendanceStatus]}">
																<IconComponent class="mr-1 h-3 w-3" />
																{statusLabels[status as AttendanceStatus]}
															</span>
														</TableCell>
														<TableCell class="text-sm text-muted-foreground">
															{record?.notes || '-'}
														</TableCell>
														<TableCell>
															<div class="flex gap-1">
																<form 
																	method="POST" 
																	action="?/markAttendanceForDate" 
																	use:enhance={() => {
																		updateAttendanceOptimistically(student.participantId, list.id, 'present');
																		return async ({ update }: { update: (opts?: { reset?: boolean }) => Promise<void> }) => {
																			await update({ reset: false });
																		};
																	}}
																>
																	<input type="hidden" name="listId" value={list.id} />
																	<input type="hidden" name="participantId" value={student.participantId} />
																	<input type="hidden" name="status" value="present" />
																	<Button 
																		type="submit" 
																		size="sm" 
																		variant={status === 'present' ? 'default' : 'ghost'}
																		class="h-7 w-7 p-0"
																		title="Presente"
																	>
																		<CheckCircle class="h-3.5 w-3.5" />
																	</Button>
																</form>

																<form 
																	method="POST" 
																	action="?/markAttendanceForDate"
																	use:enhance={() => {
																		updateAttendanceOptimistically(student.participantId, list.id, 'late');
																		return async ({ update }: { update: (opts?: { reset?: boolean }) => Promise<void> }) => {
																			await update({ reset: false });
																		};
																	}}
																>
																	<input type="hidden" name="listId" value={list.id} />
																	<input type="hidden" name="participantId" value={student.participantId} />
																	<input type="hidden" name="status" value="late" />
																	<Button 
																		type="submit" 
																		size="sm" 
																		variant={status === 'late' ? 'default' : 'ghost'}
																		class="h-7 w-7 p-0"
																		title="Atrasado"
																	>
																		<Clock class="h-3.5 w-3.5" />
																	</Button>
																</form>

																<form 
																	method="POST" 
																	action="?/markAttendanceForDate"
																	use:enhance={() => {
																		updateAttendanceOptimistically(student.participantId, list.id, 'absent');
																		return async ({ update }: { update: (opts?: { reset?: boolean }) => Promise<void> }) => {
																			await update({ reset: false });
																		};
																	}}
																>
																	<input type="hidden" name="listId" value={list.id} />
																	<input type="hidden" name="participantId" value={student.participantId} />
																	<input type="hidden" name="status" value="absent" />
																	<Button 
																		type="submit" 
																		size="sm" 
																		variant={status === 'absent' ? 'default' : 'ghost'}
																		class="h-7 w-7 p-0"
																		title="Ausente"
																	>
																		<XCircle class="h-3.5 w-3.5" />
																	</Button>
																</form>

																<form 
																	method="POST" 
																	action="?/markAttendanceForDate"
																	use:enhance={() => {
																		updateAttendanceOptimistically(student.participantId, list.id, 'excused');
																		return async ({ update }: { update: (opts?: { reset?: boolean }) => Promise<void> }) => {
																			await update({ reset: false });
																		};
																	}}
																>
																	<input type="hidden" name="listId" value={list.id} />
																	<input type="hidden" name="participantId" value={student.participantId} />
																	<input type="hidden" name="status" value="excused" />
																	<Button 
																		type="submit" 
																		size="sm" 
																		variant={status === 'excused' ? 'default' : 'ghost'}
																		class="h-7 w-7 p-0"
																		title="Justificado"
																	>
																		<AlertCircle class="h-3.5 w-3.5" />
																	</Button>
																</form>
															</div>
														</TableCell>
													</TableRow>
												{/each}
											</TableBody>
										</Table>
									</div>
								</div>
							{/if}
						</div>
					{/each}
				</div>
			{:else}
				<div class="py-12 text-center text-muted-foreground">
					<Users class="mx-auto h-12 w-12 mb-4" />
					<p class="text-lg font-medium">Nenhum aluno matriculado</p>
					<p class="text-sm">Matricule alunos neste curso para começar o controle de presença</p>
				</div>
			{/if}
		</CardContent>
	</Card>
</div>

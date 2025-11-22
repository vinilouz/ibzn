<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle } from '$lib/components/ui/card';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import { ClipboardCheck } from 'lucide-svelte';
	import Pagination from '$lib/components/Pagination.svelte';

	let { data }: { data: any } = $props();

	let currentPage = $state(1);
	const itemsPerPage = 10;

	function navigateToCourse(courseId: number) {
		goto(`/presenca/${courseId}`);
	}

	function formatDate(date: string | Date | null) {
		if (!date) return '-';
		return new Date(date).toLocaleDateString('pt-BR');
	}

	const paginatedCourses = $derived.by(() => {
		const courses = data.courses || [];
		const start = (currentPage - 1) * itemsPerPage;
		const end = start + itemsPerPage;
		return courses.slice(start, end);
	});
</script>

<div class="mx-auto w-full max-w-7xl p-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold">Controle de Presença por Curso</h1>
		<p class="text-muted-foreground mt-2">
			Selecione um curso para visualizar e gerenciar a frequência dos alunos
		</p>
	</div>

	<Card>
		<CardHeader>
			<CardTitle>
				Cursos ({data.courses?.length || 0})
			</CardTitle>
		</CardHeader>
		<CardContent>
			{#if paginatedCourses && paginatedCourses.length > 0}
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>ID</TableHead>
							<TableHead>Nome do Curso</TableHead>
							<TableHead>Descrição</TableHead>
							<TableHead>Alunos Ativos</TableHead>
							<TableHead>Capacidade</TableHead>
							<TableHead>Data de Início</TableHead>
							<TableHead class="text-right">Ações</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each paginatedCourses as course}
							<TableRow>
								<TableCell class="font-medium">{course.id}</TableCell>
								<TableCell>{course.courseName}</TableCell>
								<TableCell class="max-w-xs truncate">{course.description || '-'}</TableCell>
								<TableCell>{course.totalStudents}</TableCell>
								<TableCell>{course.capacity || '-'}</TableCell>
								<TableCell>{formatDate(course.startDate)}</TableCell>
								<TableCell class="text-right">
									<Button variant="outline" size="sm" onclick={() => navigateToCourse(course.id)}>
										<ClipboardCheck class="mr-2 h-4 w-4" />
										Ver Frequência
									</Button>
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>
				<Pagination
					bind:currentPage
					totalItems={data.courses?.length || 0}
					{itemsPerPage}
					onPageChange={() => {}}
				/>
			{:else}
				<div class="py-12 text-center text-muted-foreground">
					<ClipboardCheck class="mx-auto h-12 w-12 mb-4" />
					<p class="text-lg font-medium">Nenhum curso encontrado</p>
					<p class="text-sm">Crie cursos e matricule alunos para começar o controle de presença</p>
				</div>
			{/if}
		</CardContent>
	</Card>
</div>

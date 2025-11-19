<script lang="ts">
	import { goto } from '$app/navigation';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { ClipboardCheck, Users, Calendar } from 'lucide-svelte';

	let { data }: { data: any } = $props();

	function navigateToCourse(courseId: number) {
		goto(`/presenca/${courseId}`);
	}

	function formatDate(date: string | Date | null) {
		if (!date) return '-';
		return new Date(date).toLocaleDateString('pt-BR');
	}
</script>

<div class="mx-auto w-full max-w-7xl p-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold">Controle de Presença por Curso</h1>
		<p class="text-muted-foreground mt-2">
			Selecione um curso para visualizar e gerenciar a frequência dos alunos
		</p>
	</div>

	{#if data.courses && data.courses.length > 0}
		<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
			{#each data.courses as course}
				<Card class="cursor-pointer transition-all hover:shadow-lg hover:border-primary" onclick={() => navigateToCourse(course.id)}>
					<CardHeader>
						<CardTitle class="flex items-center gap-2">
							<ClipboardCheck class="h-5 w-5 text-primary" />
							{course.courseName}
						</CardTitle>
						{#if course.description}
							<CardDescription class="line-clamp-2">{course.description}</CardDescription>
						{/if}
					</CardHeader>
					<CardContent>
						<div class="space-y-2 text-sm">
							<div class="flex items-center gap-2 text-muted-foreground">
								<Users class="h-4 w-4" />
								<span>{course.totalStudents} aluno{course.totalStudents !== 1 ? 's' : ''} matriculado{course.totalStudents !== 1 ? 's' : ''}</span>
							</div>
							{#if course.startDate}
								<div class="flex items-center gap-2 text-muted-foreground">
									<Calendar class="h-4 w-4" />
									<span>Início: {formatDate(course.startDate)}</span>
								</div>
							{/if}
						</div>
						<Button class="w-full mt-4" variant="outline">
							Ver Frequência
						</Button>
					</CardContent>
				</Card>
			{/each}
		</div>
	{:else}
		<Card>
			<CardContent class="py-12 text-center text-muted-foreground">
				<ClipboardCheck class="mx-auto h-12 w-12 mb-4" />
				<p class="text-lg font-medium">Nenhum curso encontrado</p>
				<p class="text-sm">Crie cursos e matricule alunos para começar o controle de presença</p>
			</CardContent>
		</Card>
	{/if}
</div>

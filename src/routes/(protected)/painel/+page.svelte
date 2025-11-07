<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
</script>

<div class="space-y-6">
	<div>
		<h1 class="text-3xl font-bold">Painel</h1>
		<p class="text-gray-600">Bem-vindo ao sistema IBZN</p>
	</div>

	<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
		<Card class="hover:shadow-lg transition-shadow cursor-pointer" onclick={() => goto('/painel/salas')}>
			<CardHeader>
				<CardTitle>Salas</CardTitle>
				<CardDescription>Gerencie as salas do sistema</CardDescription>
			</CardHeader>
			<CardContent>
				<Button class="w-full" onclick={() => goto('/painel/salas')}>
					Acessar
				</Button>
			</CardContent>
		</Card>
	</div>
</div>
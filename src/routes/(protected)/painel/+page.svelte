<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { goto } from '$app/navigation';
	import { Users } from 'lucide-svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

<div class="space-y-8">
	<div class="space-y-2">
		<h1 class="text-4xl font-bold">Bem-vindo, {data.user.name}!</h1>
		<p class="text-lg text-muted-foreground">Aqui está um resumo do sistema</p>
	</div>

	<div class="rounded-lg bg-gradient-to-r from-primary/10 to-primary/5 p-6 border">
		<div class="flex items-center gap-3">
			<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
				<Users class="h-6 w-6 text-primary" />
			</div>
			<div>
				<p class="text-sm text-muted-foreground">Total de Participantes</p>
				<p class="text-3xl font-bold">{data.totalParticipants}</p>
			</div>
		</div>
	</div>

	<div>
		<h2 class="text-2xl font-semibold mb-4">Salas Disponíveis</h2>
		
		{#if data.rooms && data.rooms.length > 0}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each data.rooms as room}
					<Card 
						class="hover:shadow-lg transition-all group"
					>
						<CardHeader class="pb-3">
							<div class="flex items-start justify-between">
								<div>
									<CardTitle class="text-xl mb-1">{room.name}</CardTitle>
									<CardDescription>Sala {room.number}</CardDescription>
								</div>
								<span class="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold {room.status ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
									{room.status ? '● Ativa' : '● Inativa'}
								</span>
							</div>
						</CardHeader>
						
						<CardContent class="space-y-4">
							{#if room.description}
								<p class="text-sm text-muted-foreground line-clamp-3">{room.description}</p>
							{/if}
							
							<div class="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
								<Users class="h-4 w-4" />
								<span>Capacidade: <strong class="text-foreground">{room.capacity || 'Sem limite'}</strong></span>
							</div>
							
							<Button 
								class="w-full" 
								variant="outline" 
								onclick={() => goto(`/salas/${room.id}`)}
							>
								Ver Detalhes
							</Button>
						</CardContent>
					</Card>
				{/each}
			</div>
		{:else}
			<Card>
				<CardContent class="p-12 text-center">
					<p class="text-muted-foreground mb-4">Nenhuma sala cadastrada ainda</p>
					<Button onclick={() => goto('/salas?view=create')}>
						Criar Primeira Sala
					</Button>
				</CardContent>
			</Card>
		{/if}
	</div>
</div>
<script lang="ts">
	import { Wrench } from 'lucide-svelte';
</script>

<div class="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
	<div class="mb-6 rounded-full bg-primary/10 p-6">
		<Wrench class="h-12 w-12 text-primary" />
	</div>
	<h1 class="mb-2 text-3xl font-bold tracking-tight">Em Manutenção</h1>
	<p class="mb-8 max-w-md text-muted-foreground">
		Estamos realizando algumas melhorias no sistema. Por favor, tente novamente mais tarde.
	</p>
</div>

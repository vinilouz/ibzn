<!-- src/lib/components/logout-button.svelte -->
<script lang="ts">
	import { Button, type ButtonProps } from "$lib/components/ui/button";
	import { goto } from "$app/navigation";
	import type { WithElementRef } from "$lib/utils";

	// Props do componente
	let {
		ref = $bindable(null),
		class: className = "",
		variant = "outline",
		redirectTo = "/login",
		...restProps
	}: WithElementRef<ButtonProps & { redirectTo?: string }> = $props();

	let isLoading = $state(false);

	async function handleLogout() {
		isLoading = true;
		
		try {
			const response = await fetch("/api/auth/sign-out", { 
				method: "POST" 
			});

			if (response.ok) {
				// Redireciona para a página de login após logout
				await goto(redirectTo);
			} else {
				console.error("Erro ao fazer logout");
				// Você pode adicionar um toast ou alerta de erro aqui
			}
		} catch (error) {
			console.error("Erro ao fazer logout:", error);
		} finally {
			isLoading = false;
		}
	}
</script>

<Button 
	onclick={handleLogout} 
	{variant} 
	{ref}
	class={className}
	disabled={isLoading}
	{...restProps}
>
	{#if isLoading}
		<svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
			<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
		</svg>
	{/if}
</Button>
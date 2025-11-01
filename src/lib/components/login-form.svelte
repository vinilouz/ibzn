<!-- src/lib/components/login-form.svelte -->
<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import {
		FieldGroup,
		Field,
		FieldLabel,
		FieldDescription,
	} from "$lib/components/ui/field/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { cn, type WithElementRef } from "$lib/utils.js";
	import { goto } from "$app/navigation";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();

	const id = $props.id();

	// Estados do formulário
	let username = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let error = $state('');

	async function handleSubmit(event: Event) {
		event.preventDefault();
		isLoading = true;
		error = '';

		try {
			const response = await fetch('/api/auth/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, password }),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error?.message || 'Erro ao fazer login');
			}

			// Redireciona para a página inicial após o login bem-sucedido
			await goto('/');
		} catch (err) {
			error = err instanceof Error ? err.message : 'Erro desconhecido';
		} finally {
			isLoading = false;
		}
	}
</script>

<div class={cn("flex flex-col gap-6", className)} bind:this={ref} {...restProps}>
	<form onsubmit={handleSubmit}>
		<FieldGroup>
			<div class="flex flex-col items-center gap-2 text-center">
				<h1 class="text-xl font-bold">Tela de Login</h1>
			</div>

			<Field>
				<FieldLabel for="username-{id}">Nome de usuário</FieldLabel>
				<Input 
					id="username-{id}" 
					type="text" 
					placeholder="Digite seu nome de usuário" 
					required 
					bind:value={username}
					disabled={isLoading}
				/>
			</Field>
			<Field>
				<FieldLabel for="password-{id}">Senha</FieldLabel>
				<Input 
					id="password-{id}" 
					type="password" 
					placeholder="Digite sua senha" 
					required 
					bind:value={password}
					disabled={isLoading}
				/>
			</Field>
			<Field>
				<Button type="submit" disabled={isLoading}>
					{#if isLoading}
						Entrando...
					{:else}
						Login
					{/if}
				</Button>
			</Field>
		</FieldGroup>
	</form>
	<FieldDescription class="px-6 text-center">
		IBZN
	</FieldDescription>
</div>

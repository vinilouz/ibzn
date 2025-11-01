<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements';
	import {
		FieldGroup,
		Field,
		FieldLabel,
		FieldDescription
	} from '$lib/components/ui/field/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { cn, type WithElementRef } from '$lib/utils.js';
	import { authClient } from '$lib/auth-client';
	import { goto } from '$app/navigation';

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();

	const id = $props.id();

	let loading = $state(false);
	let error = $state('');

	async function handleSubmit(event: Event) {
		event.preventDefault();
		const formData = new FormData(event.target as HTMLFormElement);
		const username = formData.get('username') as string;
		const password = formData.get('password') as string;
		const confirmPassword = formData.get('confirm-password') as string;

		if (password !== confirmPassword) {
			error = 'Senhas não coincidem';
			return;
		}

		loading = true;
		error = '';

		try {
			const result = await authClient.signUp.email({
				email: username,
				password,
				name: username,
				callbackURL: '/login'
			});

			if (result.error) {
				error = result.error.message || 'Erro ao cadastrar';
			} else {
				goto('/login');
			}
		} catch (err) {
			error = 'Erro inesperado';
		} finally {
			loading = false;
		}
	}
</script>

<div class="flex min-h-svh flex-col items-center justify-center gap-6 bg-background p-6 md:p-10">
	<div class="w-full max-w-sm">
		<div class={cn('flex flex-col gap-6', className)} bind:this={ref} {...restProps}>
			<form onsubmit={handleSubmit}>
				<FieldGroup>
					<div class="flex flex-col items-center gap-2 text-center">
						<h1 class="text-xl font-bold">Novo usuário</h1>
						{#if error}
							<p class="text-sm text-red-500">{error}</p>
						{/if}
					</div>
					<Field>
						<FieldLabel for="username-{id}">Email</FieldLabel>
						<Input
							id="username-{id}"
							name="username"
							type="email"
							placeholder="Digite seu email"
							required
						/>
					</Field>
					<Field>
						<FieldLabel for="password-{id}">Criar senha</FieldLabel>
						<Input
							id="password-{id}"
							name="password"
							type="password"
							placeholder="Digite sua senha"
							required
						/>
					</Field>
					<Field>
						<FieldLabel for="confirm-password-{id}">Confirmar senha</FieldLabel>
						<Input
							id="confirm-password-{id}"
							name="confirm-password"
							type="password"
							placeholder="Confirme sua senha"
							required
						/>
					</Field>
					<Field>
						<Button type="submit" disabled={loading}>
							{#if loading}
								Cadrastando...
							{:else}
								Cadastrar
							{/if}
						</Button>
					</Field>
				</FieldGroup>
			</form>
		</div>
	</div>
</div>

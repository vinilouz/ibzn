<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';

	import { signUp } from '$lib/auth.client';
	import { goto } from '$app/navigation';
	import { Eye, EyeOff } from 'lucide-svelte';

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let confirmPassword = $state('');
	let loading = $state(false);
	let error = $state('');
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);

	const handleSignup = async () => {
		if (!name || !email || !password || !confirmPassword) {
			error = 'Preencha todos os campos';
			return;
		}

		if (password !== confirmPassword) {
			error = 'As senhas não coincidem';
			return;
		}

		if (password.length < 8) {
			error = 'A senha deve ter pelo menos 8 caracteres';
			return;
		}

		loading = true;
		error = '';

		try {
			const result = await signUp.email({
				email,
				password,
				name
			});

			if (result.error) {
				error = result.error.message || 'Erro ao criar conta';
				loading = false;
				return;
			}

			await goto('/painel');
		} catch (err: any) {
			error = err.message || 'Erro ao criar conta. Verifique os dados e tente novamente.';
			loading = false;
		}
	};

	
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col items-center gap-1 text-center">
		<h1 class="text-2xl font-bold">Cadastre-se</h1>
		<p class="text-muted-foreground text-balance text-sm">
			Crie sua conta
		</p>
	</div>

	{#if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
			{error}
		</div>
	{/if}

	<div class="space-y-4">
		<div class="space-y-2">
			<Label for="name">Nome</Label>
			<Input
				id="name"
				type="text"
				placeholder="Seu nome"
				bind:value={name}
				required
			/>
		</div>

		<div class="space-y-2">
			<Label for="email">Email</Label>
			<Input
				id="email"
				type="email"
				placeholder="seu@email.com"
				bind:value={email}
				required
			/>
		</div>

		<div class="space-y-2">
			<Label for="password">Senha</Label>
			<div class="relative">
				<Input
					id="password"
					type={showPassword ? 'text' : 'password'}
					placeholder="Mínimo 8 caracteres"
					bind:value={password}
					required
					class="pr-10"
				/>
				<button
					type="button"
					class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
					onclick={() => showPassword = !showPassword}
				>
					{#if showPassword}
						<EyeOff class="h-4 w-4" />
					{:else}
						<Eye class="h-4 w-4" />
					{/if}
				</button>
			</div>
		</div>

		<div class="space-y-2">
			<Label for="confirmPassword">Confirmar Senha</Label>
			<div class="relative">
				<Input
					id="confirmPassword"
					type={showConfirmPassword ? 'text' : 'password'}
					placeholder="Repita sua senha"
					bind:value={confirmPassword}
					required
					class="pr-10"
				/>
				<button
					type="button"
					class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
					onclick={() => showConfirmPassword = !showConfirmPassword}
				>
					{#if showConfirmPassword}
						<EyeOff class="h-4 w-4" />
					{:else}
						<Eye class="h-4 w-4" />
					{/if}
				</button>
			</div>
		</div>

		<Button
			class="w-full"
			onclick={handleSignup}
			disabled={loading}
		>
			{#if loading}
				<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
			{/if}
			Criar Conta
		</Button>
	</div>

	

	<div class="text-center text-sm text-muted-foreground">
		Já tem uma conta?
		<a href="/login" class="underline underline-offset-4 hover:text-primary">
			Entre aqui
		</a>
	</div>
</div>
<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { signIn } from '$lib/auth.client';
	import { goto } from '$app/navigation';

	let email = $state('');
	let password = $state('');
	let loading = $state(false);
	let error = $state('');

	const handleEmailLogin = async () => {
		if (!email || !password) {
			error = 'Preencha todos os campos';
			return;
		}

		loading = true;
		error = '';

		try {
			const result = await signIn.email({
				email,
				password
			});

			if (result.error) {
				error = result.error.message || 'Email ou senha incorretos';
				loading = false;
				return;
			}

			await goto('/painel');
		} catch (err: any) {
			error = err.message || 'Erro ao fazer login. Verifique suas credenciais.';
			loading = false;
		}
	};



	</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col items-center gap-1 text-center">
		<h1 class="text-2xl font-bold">Acesse</h1>
		<p class="text-muted-foreground text-balance text-sm">
			Entre com email
		</p>
	</div>

	{#if error}
		<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
			{error}
		</div>
	{/if}

	<div class="space-y-4">
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
			<div class="flex items-center justify-between">
				<Label for="password">Senha</Label>
				<a href="/forgot-password" class="text-sm underline-offset-4 hover:underline text-primary">
					Esqueceu a senha?
				</a>
			</div>
			<Input
				id="password"
				type="password"
				bind:value={password}
				required
			/>
		</div>

		<Button
			class="w-full"
			onclick={handleEmailLogin}
			disabled={loading}
		>
			{#if loading}
				<div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
			{/if}
			Entrar
		</Button>
	</div>

	

	<div class="text-center text-sm text-muted-foreground">
		Não tem uma conta?
		<a href="/signup" class="underline underline-offset-4 hover:text-primary">
			Cadastre-se
		</a>
	</div>
</div>
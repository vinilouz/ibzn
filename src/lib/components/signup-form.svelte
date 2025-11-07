<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Separator } from '$lib/components/ui/separator';
	import { authClient } from '$lib/auth.client';

	let name = '';
	let email = '';
	let password = '';
	let confirmPassword = '';
	let loading = false;
	let error = '';

	const handleSignup = async () => {
		if (!name || !email || !password || !confirmPassword) {
			error = 'Preencha todos os campos';
			return;
		}

		if (password !== confirmPassword) {
			error = 'As senhas não coincidem';
			return;
		}

		if (password.length < 6) {
			error = 'A senha deve ter pelo menos 6 caracteres';
			return;
		}

		loading = true;
		error = '';

		try {
			await authClient.signUp.email({
				email,
				password,
				name,
				callbackURL: '/painel'
			});
		} catch (err) {
			error = 'Erro ao criar conta. Verifique os dados e tente novamente.';
		} finally {
			loading = false;
		}
	};

	const handleGoogleSignup = async () => {
		await authClient.signIn.social({
			provider: 'google',
			callbackURL: '/painel'
		});
	};
</script>

<div class="flex flex-col gap-6">
	<div class="flex flex-col items-center gap-1 text-center">
		<h1 class="text-2xl font-bold">Cadastre-se</h1>
		<p class="text-muted-foreground text-balance text-sm">
			Crie sua conta ou entre com Google
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
			<Input
				id="password"
				type="password"
				placeholder="Mínimo 6 caracteres"
				bind:value={password}
				required
			/>
		</div>

		<div class="space-y-2">
			<Label for="confirmPassword">Confirmar Senha</Label>
			<Input
				id="confirmPassword"
				type="password"
				placeholder="Repita sua senha"
				bind:value={confirmPassword}
				required
			/>
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

	<div class="space-y-4">
		<div class="relative">
			<div class="absolute inset-0 flex items-center">
				<Separator class="w-full" />
			</div>
			<div class="relative flex justify-center text-xs uppercase">
				<span class="bg-white px-2 text-muted-foreground">Ou continue com</span>
			</div>
		</div>

		<div class="w-full">
			<Button variant="outline" onclick={handleGoogleSignup} class="w-full">
				<svg class="mr-2 h-4 w-4" viewBox="0 0 24 24">
					<path
						fill="currentColor"
						d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
					/>
					<path
						fill="currentColor"
						d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
					/>
					<path
						fill="currentColor"
						d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
					/>
					<path
						fill="currentColor"
						d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
					/>
				</svg>
				Google
			</Button>
		</div>
	</div>

	<div class="text-center text-sm text-muted-foreground">
		Já tem uma conta?
		<a href="/login" class="underline underline-offset-4 hover:text-primary">
			Entre aqui
		</a>
	</div>
</div>
<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import { enhanceWithLoadingAndCallback } from '$lib/utils/enhance';
	import { User, Lock, Trash2, Mail, Shield, AlertTriangle, Users } from 'lucide-svelte';

	let { data } = $props();

	let showDeleteConfirm = $state(false);
	let deleteConfirmation = $state('');
	let deletePassword = $state('');

	let profileData = $state({
		name: data.user?.name || '',
		email: data.user?.email || ''
	});

	let passwordData = $state({
		currentPassword: '',
		newPassword: '',
		confirmPassword: ''
	});

	function handleSuccess() {
		passwordData = {
			currentPassword: '',
			newPassword: '',
			confirmPassword: ''
		};
		showDeleteConfirm = false;
		deleteConfirmation = '';
		deletePassword = '';
	}
</script>

<div class="mx-auto w-full max-w-4xl p-8">
	<div class="mb-8">
		<h1 class="text-3xl font-bold">Configurações</h1>
		<p class="text-muted-foreground mt-2">Gerencie suas preferências e informações da conta</p>
	</div>

	<!-- Informações do Usuário -->
	<Card class="mb-6">
		<CardHeader>
			<div class="flex items-center gap-3">
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
					<User class="h-6 w-6 text-primary" />
				</div>
				<div>
					<CardTitle>Informações do Perfil</CardTitle>
					<CardDescription>Atualize suas informações pessoais</CardDescription>
				</div>
			</div>
		</CardHeader>
		<CardContent>
			<form method="POST" action="?/updateProfile" use:enhance={enhanceWithLoadingAndCallback(handleSuccess)} class="space-y-4">
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="name">Nome Completo *</Label>
						<Input id="name" name="name" bind:value={profileData.name} required />
					</div>

					<div class="space-y-2">
						<Label for="email">Email</Label>
						<div class="relative">
							<Mail class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
							<Input id="email" name="email" type="email" bind:value={profileData.email} class="pl-10" disabled />
						</div>
						<p class="text-xs text-muted-foreground">Email não pode ser alterado</p>
					</div>
				</div>

				{#if data.user?.role}
					<div class="flex items-center gap-2 rounded-lg border p-3">
						<Shield class="h-5 w-5 text-primary" />
						<span class="text-sm font-medium">Função:</span>
						<Badge variant="secondary">
							{#if data.user.role === 'admin'}
								Administrador
							{:else if data.user.role === 'manager'}
								Manager
							{:else}
								Manager
							{/if}
						</Badge>
					</div>
				{/if}

				<Button type="submit">Salvar Alterações</Button>
			</form>
		</CardContent>
	</Card>

	<!-- Alterar Senha (Admin only) -->
	{#if data.user?.role === 'admin'}
	<Card class="mb-6">
		<CardHeader>
			<div class="flex items-center gap-3">
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
					<Lock class="h-6 w-6 text-orange-600" />
				</div>
				<div>
					<CardTitle>Segurança</CardTitle>
					<CardDescription>Altere sua senha para manter sua conta segura</CardDescription>
				</div>
			</div>
		</CardHeader>
		<CardContent>
			<form method="POST" action="?/changePassword" use:enhance={enhanceWithLoadingAndCallback(handleSuccess)} class="space-y-4">
				<div class="space-y-2">
					<Label for="currentPassword">Senha Atual *</Label>
					<Input
						id="currentPassword"
						name="currentPassword"
						type="password"
						bind:value={passwordData.currentPassword}
						placeholder="Digite sua senha atual"
						required
					/>
				</div>

				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="newPassword">Nova Senha *</Label>
						<Input
							id="newPassword"
							name="newPassword"
							type="password"
							bind:value={passwordData.newPassword}
							placeholder="Mínimo 8 caracteres"
							required
						/>
					</div>

					<div class="space-y-2">
						<Label for="confirmPassword">Confirmar Nova Senha *</Label>
						<Input
							id="confirmPassword"
							name="confirmPassword"
							type="password"
							bind:value={passwordData.confirmPassword}
							placeholder="Digite novamente"
							required
						/>
					</div>
				</div>

				<div class="rounded-lg bg-blue-50 border border-blue-200 p-3">
					<p class="text-sm text-blue-800">
						<strong>Dica:</strong> Use uma senha forte com letras, números e símbolos.
					</p>
				</div>

				<Button type="submit" variant="default">Alterar Senha</Button>
			</form>
		</CardContent>
	</Card>
	{/if}

	<!-- Gerenciar Usuários (Admin Only) -->
	{#if data.user?.role === 'admin'}
	<Card class="mb-6">
		<CardHeader>
			<div class="flex items-center gap-3">
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
					<Users class="h-6 w-6 text-blue-600" />
				</div>
				<div>
					<CardTitle>Gerenciar Usuários</CardTitle>
					<CardDescription>Controle as permissões dos usuários</CardDescription>
				</div>
			</div>
		</CardHeader>
		<CardContent>
			<div class="space-y-3">
				{#each data.users as user}
					<div class="flex items-center justify-between p-3 border-b last:border-b-0">
						<div class="flex-1">
							<p class="font-medium">{user.name}</p>
							<p class="text-sm text-muted-foreground">{user.email}</p>
						</div>
						<div class="flex items-center gap-2">
							<form method="POST" action="?/updateUserRole" use:enhance={enhanceWithLoadingAndCallback(handleSuccess)}>
								<input type="hidden" name="userId" value={user.id} />
								<select 
									name="role" 
									class="rounded-md border border-input bg-background px-3 py-2 text-sm"
									onchange={(e) => e.currentTarget.form?.requestSubmit()}
								>
									<option value="admin" selected={user.role === 'admin'}>Admin</option>
									<option value="manager" selected={user.role === 'manager'}>Manager</option>
								</select>
							</form>
					{#if user.id !== data.user.id}
						<form 
							method="POST" 
							action="?/deleteUser" 
							use:enhance={() => {
								return async ({ result, update }) => {
									if (result.type === 'success') {
										await update();
										window.location.reload();
									} else {
										await update();
									}
								};
							}}
						>
							<input type="hidden" name="userId" value={user.id} />
							<Button 
								type="submit" 
								variant="destructive" 
								size="sm"
								onclick={(e) => {
									if (!confirm(`Tem certeza que deseja excluir ${user.name}?`)) {
										e.preventDefault();
									}
								}}
							>
								<Trash2 class="h-4 w-4" />
							</Button>
						</form>
					{/if}
						</div>
					</div>
				{/each}
			</div>
		</CardContent>
	</Card>

	<!-- Manutenção do Sistema (Admin Only) -->
	<Card class="mb-6 border-orange-200">
		<CardHeader>
			<div class="flex items-center gap-3">
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
					<AlertTriangle class="h-6 w-6 text-orange-600" />
				</div>
				<div>
					<CardTitle class="text-orange-700">Manutenção do Sistema</CardTitle>
					<CardDescription>Gerencie o acesso ao sistema</CardDescription>
				</div>
			</div>
		</CardHeader>
		<CardContent>
			<div class="rounded-lg bg-orange-50 border border-orange-200 p-4 mb-4">
				<p class="text-sm text-orange-800 mb-2">
					Quando o modo de manutenção estiver ativo, apenas administradores poderão acessar o sistema.
					Todos os outros usuários serão redirecionados para uma página de aviso.
				</p>
				<p class="text-sm font-bold {data.maintenanceMode ? 'text-red-600' : 'text-green-600'}">
					Status atual: {data.maintenanceMode ? 'EM MANUTENÇÃO' : 'OPERACIONAL'}
				</p>
			</div>

			<form method="POST" action="?/toggleMaintenance" use:enhance={enhanceWithLoadingAndCallback(() => {})}>
				<input type="hidden" name="enabled" value={(!data.maintenanceMode).toString()} />
				<Button 
					type="submit" 
					variant={data.maintenanceMode ? "outline" : "destructive"}
					class="w-full sm:w-auto"
				>
					{data.maintenanceMode ? 'Desativar Modo Manutenção' : 'Ativar Modo Manutenção'}
				</Button>
			</form>
		</CardContent>
	</Card>
	{/if}

	<!-- Zona de Perigo (Admin only) -->
	{#if data.user?.role === 'admin'}
	<Card class="border-red-200">
		<CardHeader>
			<div class="flex items-center gap-3">
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
					<Trash2 class="h-6 w-6 text-red-600" />
				</div>
				<div>
					<CardTitle class="text-red-600">Zona de Perigo</CardTitle>
					<CardDescription>Ações irreversíveis na sua conta</CardDescription>
				</div>
			</div>
		</CardHeader>
		<CardContent>
			{#if !showDeleteConfirm}
				<div class="rounded-lg bg-red-50 border border-red-200 p-4">
					<p class="text-sm text-red-800 mb-4">
						Excluir sua conta removerá permanentemente todos os seus dados. Esta ação não pode ser desfeita.
					</p>
					<Button 
						variant="destructive" 
						onclick={() => showDeleteConfirm = true}
					>
						Excluir Conta
					</Button>
				</div>
			{:else}
				<form method="POST" action="?/deleteAccount" use:enhance={enhanceWithLoadingAndCallback(handleSuccess)} class="space-y-4">
					<div class="rounded-lg bg-red-50 border border-red-200 p-4">
						<p class="text-sm text-red-800 font-semibold mb-2">⚠️ Confirmação de Exclusão</p>
						<p class="text-sm text-red-800">Esta ação é permanente e não pode ser desfeita.</p>
					</div>

					<div class="space-y-2">
						<Label for="deletePassword">Senha *</Label>
						<Input 
							id="deletePassword" 
							name="password" 
							type="password" 
							bind:value={deletePassword}
							placeholder="Digite sua senha"
							required 
						/>
					</div>

					<div class="space-y-2">
						<Label for="confirmation">Digite "EXCLUIR" para confirmar *</Label>
						<Input 
							id="confirmation" 
							name="confirmation" 
							bind:value={deleteConfirmation}
							placeholder="EXCLUIR"
							required 
						/>
					</div>

					<div class="flex gap-2">
						<Button type="submit" variant="destructive" disabled={deleteConfirmation !== 'EXCLUIR'}>
							Confirmar Exclusão
						</Button>
						<Button type="button" variant="outline" onclick={() => showDeleteConfirm = false}>
							Cancelar
						</Button>
					</div>
				</form>
			{/if}
		</CardContent>
	</Card>
	{/if}
</div>

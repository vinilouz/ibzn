<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Badge } from '$lib/components/ui/badge';
	import { enhanceWithLoadingAndCallback } from '$lib/utils/enhance';
	import { showLoading, hideLoading } from '$lib/stores/loading';
	import { User, Lock, Trash2, Mail, Shield, AlertTriangle, Users, Eye, EyeOff } from 'lucide-svelte';

	let { data, form } = $props();

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

	let passwordSuccess = $state(false);

	let showCurrentPassword = $state(false);
	let showNewPassword = $state(false);
	let showConfirmPassword = $state(false);
	let showDeletePassword = $state(false);
	let showNewManagerPassword = $state(false);

	let newManagerData = $state({
		name: '',
		email: '',
		password: ''
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
			<form method="POST" action="?/updateProfile" use:enhance={enhanceWithLoadingAndCallback({ loadingMessage: 'Atualizando perfil...', onSuccess: handleSuccess })} class="space-y-4">
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

	<!-- Alterar Senha -->
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
			<form method="POST" action="?/changePassword" use:enhance={() => {
					passwordSuccess = false;
					showLoading('Alterando senha...');
					return async ({ result, update }) => {
						try {
							await update({ reset: false });
							if (result.type === 'success') {
								handleSuccess();
								passwordSuccess = true;
							}
						} finally {
							hideLoading();
						}
					};
				}} class="space-y-4">
				{#if passwordSuccess}
					<div class="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
						Senha alterada com sucesso!
					</div>
				{/if}
				{#if form?.message && !passwordSuccess}
					<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
						{form.message}
					</div>
				{/if}

				<div class="space-y-2">
					<Label for="currentPassword">Senha Atual *</Label>
					<div class="relative">
						<Input
							id="currentPassword"
							name="currentPassword"
							type={showCurrentPassword ? 'text' : 'password'}
							bind:value={passwordData.currentPassword}
							placeholder="Digite sua senha atual"
							required
							class="pr-10"
						/>
						<button
							type="button"
							class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
							onclick={() => showCurrentPassword = !showCurrentPassword}
						>
							{#if showCurrentPassword}
								<EyeOff class="h-4 w-4" />
							{:else}
								<Eye class="h-4 w-4" />
							{/if}
						</button>
					</div>
				</div>

				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="newPassword">Nova Senha *</Label>
						<div class="relative">
							<Input
								id="newPassword"
								name="newPassword"
								type={showNewPassword ? 'text' : 'password'}
								bind:value={passwordData.newPassword}
								placeholder="Mínimo 8 caracteres"
								required
								class="pr-10"
							/>
							<button
								type="button"
								class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
								onclick={() => showNewPassword = !showNewPassword}
							>
								{#if showNewPassword}
									<EyeOff class="h-4 w-4" />
								{:else}
									<Eye class="h-4 w-4" />
								{/if}
							</button>
						</div>
					</div>

					<div class="space-y-2">
						<Label for="confirmPassword">Confirmar Nova Senha *</Label>
						<div class="relative">
							<Input
								id="confirmPassword"
								name="confirmPassword"
								type={showConfirmPassword ? 'text' : 'password'}
								bind:value={passwordData.confirmPassword}
								placeholder="Digite novamente"
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
							<form method="POST" action="?/updateUserRole" use:enhance={enhanceWithLoadingAndCallback({ loadingMessage: 'Atualizando função...', onSuccess: handleSuccess })}>
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

	<!-- Criar Novo Manager (Admin Only) -->
	<Card class="mb-6">
		<CardHeader>
			<div class="flex items-center gap-3">
				<div class="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
					<Users class="h-6 w-6 text-green-600" />
				</div>
				<div>
					<CardTitle>Criar Novo Manager</CardTitle>
					<CardDescription>Adicione um novo usuário com permissões de gerenciamento</CardDescription>
				</div>
			</div>
		</CardHeader>
		<CardContent>
			<form method="POST" action="?/createManager" use:enhance={enhanceWithLoadingAndCallback({ loadingMessage: 'Criando manager...', onSuccess: () => {
				newManagerData = { name: '', email: '', password: '' };
				handleSuccess();
			}})} class="space-y-4">
				<div class="grid gap-4 md:grid-cols-2">
					<div class="space-y-2">
						<Label for="newManagerName">Nome Completo *</Label>
						<Input 
							id="newManagerName" 
							name="name" 
							bind:value={newManagerData.name}
							placeholder="Nome do manager"
							required 
						/>
					</div>

					<div class="space-y-2">
						<Label for="newManagerEmail">Email *</Label>
						<div class="relative">
							<Mail class="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
							<Input 
								id="newManagerEmail" 
								name="email" 
								type="email"
								bind:value={newManagerData.email}
								placeholder="email@exemplo.com"
								class="pl-10"
								required 
							/>
						</div>
					</div>
				</div>

				<div class="space-y-2">
					<Label for="newManagerPassword">Senha Inicial *</Label>
					<div class="relative">
						<Input
							id="newManagerPassword"
							name="password"
							type={showNewManagerPassword ? 'text' : 'password'}
							bind:value={newManagerData.password}
							placeholder="Mínimo 8 caracteres"
							required
							class="pr-10"
						/>
						<button
							type="button"
							class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
							onclick={() => showNewManagerPassword = !showNewManagerPassword}
						>
							{#if showNewManagerPassword}
								<EyeOff class="h-4 w-4" />
							{:else}
								<Eye class="h-4 w-4" />
							{/if}
						</button>
					</div>
					<p class="text-xs text-muted-foreground">O manager poderá alterar esta senha após o primeiro login</p>
				</div>

				<Button type="submit">Criar Manager</Button>
			</form>
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

			<form method="POST" action="?/toggleMaintenance" use:enhance={enhanceWithLoadingAndCallback({ loadingMessage: 'Atualizando modo manutenção...' })}>
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
				<form method="POST" action="?/deleteAccount" use:enhance={enhanceWithLoadingAndCallback({ loadingMessage: 'Excluindo conta...', onSuccess: handleSuccess })} class="space-y-4">
					<div class="rounded-lg bg-red-50 border border-red-200 p-4">
						<p class="text-sm text-red-800 font-semibold mb-2">Confirmação de Exclusão</p>
						<p class="text-sm text-red-800">Esta ação é permanente e não pode ser desfeita.</p>
					</div>

					<div class="space-y-2">
						<Label for="deletePassword">Senha *</Label>
						<div class="relative">
							<Input
								id="deletePassword"
								name="password"
								type={showDeletePassword ? 'text' : 'password'}
								bind:value={deletePassword}
								placeholder="Digite sua senha"
								required
								class="pr-10"
							/>
							<button
								type="button"
								class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
								onclick={() => showDeletePassword = !showDeletePassword}
							>
								{#if showDeletePassword}
									<EyeOff class="h-4 w-4" />
								{:else}
									<Eye class="h-4 w-4" />
								{/if}
							</button>
						</div>
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

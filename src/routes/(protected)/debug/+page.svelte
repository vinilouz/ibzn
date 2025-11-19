<script lang="ts">
  import { authClient } from '$lib/auth.client';
  import { onMount } from 'svelte';

  let session: any = $state(null);
  let loading = $state(true);

  onMount(async () => {
    session = await authClient.getSession();
    loading = false;
  });
</script>

<div class="container mx-auto p-8 max-w-4xl">
  <h1 class="text-3xl font-bold mb-6">🔍 Debug - Informações do Usuário</h1>

  {#if loading}
    <p>Carregando...</p>
  {:else if session?.data?.user}
    <div class="space-y-6">
      <!-- Card Principal -->
      <div class="border rounded-lg p-6 bg-card">
        <h2 class="text-xl font-semibold mb-4">Dados da Sessão</h2>

        <div class="grid grid-cols-2 gap-4">
          <div>
            <p class="text-sm text-muted-foreground">Nome</p>
            <p class="font-medium">{session.data.user.name}</p>
          </div>

          <div>
            <p class="text-sm text-muted-foreground">Email</p>
            <p class="font-medium">{session.data.user.email}</p>
          </div>

          <div>
            <p class="text-sm text-muted-foreground">ID</p>
            <p class="font-mono text-sm">{session.data.user.id}</p>
          </div>

          <div>
            <p class="text-sm text-muted-foreground">Role</p>
            <div class="flex items-center gap-2">
              <span class="px-3 py-1 rounded-full text-xs font-medium {
                session.data.user.role === 'admin' ? 'bg-red-100 text-red-800' :
                session.data.user.role === 'manager' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }">
                {session.data.user.role === 'admin' ? ' Admin' :
                 session.data.user.role === 'manager' ? ' Manager' :
                 session.data.user.role || 'user'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Sessão Completa (JSON) -->
      <div class="border rounded-lg p-6 bg-card">
        <h2 class="text-xl font-semibold mb-4">Sessão Completa (JSON)</h2>
        <pre class="bg-muted p-4 rounded-md overflow-x-auto text-xs">{JSON.stringify(session.data.user, null, 2)}</pre>
      </div>

      <!-- Verificações -->
      <div class="border rounded-lg p-6 bg-card">
        <h2 class="text-xl font-semibold mb-4">Verificações</h2>

        <div class="space-y-2">
          <div class="flex items-center gap-2">
            {#if session.data.user.role === 'admin'}
              <span class="text-green-600"></span>
              <span>Você é <strong>Admin</strong> - Tem acesso total ao sistema</span>
            {:else if session.data.user.role === 'manager'}
              <span class="text-blue-600"></span>
              <span>Você é <strong>Manager</strong> - Tem acesso operacional completo</span>
            {:else}
              <span class="text-yellow-600"></span>
              <span>Você é <strong>{session.data.user.role || 'user'}</strong> - Acesso limitado</span>
            {/if}
          </div>

          <div class="flex items-center gap-2">
            {#if session.data.user.role}
              <span class="text-green-600"></span>
              <span>Campo <code>role</code> está presente</span>
            {:else}
              <span class="text-red-600"></span>
              <span>Campo <code>role</code> está ausente ou vazio</span>
            {/if}
          </div>

          <div class="flex items-center gap-2">
            {#if session.data.user.emailVerified}
              <span class="text-green-600"></span>
              <span>Email verificado</span>
            {:else}
              <span class="text-yellow-600"></span>
              <span>Email não verificado</span>
            {/if}
          </div>
        </div>
      </div>

      <!-- Instruções -->
      <div class="border border-blue-500 rounded-lg p-6 bg-blue-50 dark:bg-blue-950">
        <h2 class="text-xl font-semibold mb-4 text-blue-900 dark:text-blue-100">💡 Como Mudar seu Role</h2>

        <ol class="list-decimal list-inside space-y-2 text-blue-800 dark:text-blue-200">
          <li>Abra o Drizzle Studio: <code class="bg-blue-200 dark:bg-blue-900 px-2 py-1 rounded">npm run db:studio</code></li>
          <li>Clique na tabela <strong>user</strong></li>
          <li>Encontre seu usuário pelo email: <strong>{session.data.user.email}</strong></li>
          <li>Clique no campo <strong>role</strong></li>
          <li>Selecione: <code>admin</code>, <code>manager</code>, <code>user</code> ou <code>guest</code></li>
          <li>Salve e recarregue esta página (F5)</li>
        </ol>
      </div>
    </div>
  {:else}
    <div class="border border-red-500 rounded-lg p-6 bg-red-50">
      <p class="text-red-800">❌ Nenhuma sessão encontrada. Faça login primeiro.</p>
    </div>
  {/if}
</div>

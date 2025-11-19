#  Como Usar o Sistema de Permissões

##  Resumo das Permissões

### **Admin (Chefe)**
-  Acesso total a tudo
-  Pode gerenciar usuários do sistema (criar/editar/deletar admins e managers)
-  Pode acessar configurações
-  Pode gerenciar roles

### **Manager (Secretária)**
-  Acesso operacional completo (cursos, salas, pagamentos, participantes, professores)
-  PODE deletar cursos, salas, pagamentos, etc.
-  PODE fazer reembolsos
-  NÃO pode gerenciar usuários do SISTEMA (admin/manager)
-  NÃO pode acessar configurações
-  NÃO pode mudar roles

---

##  Como Implementar

### **1. No Backend (Server-Side)**

#### Exemplo: Proteger rota de deletar usuários do sistema

```typescript
// src/routes/(protected)/admin/users/+page.server.ts
import { requirePermission } from '$lib/server/permissions';
import { fail } from '@sveltejs/kit';

export const actions: Actions = {
  deleteSystemUser: async ({ request, locals }) => {
    const session = await locals.auth();
    const userRole = session?.user?.role || 'guest';

    try {
      //  Verificar permissão - lança erro se não tiver
      requirePermission(userRole, 'canDeleteUsers');

      const data = await request.formData();
      const userId = data.get('userId') as string;

      // Executar ação
      await db.delete(user).where(eq(user.id, userId));

      return { success: true };
    } catch (error) {
      return fail(403, {
        error: 'Você não tem permissão para deletar usuários do sistema'
      });
    }
  }
};
```

### **2. No Frontend (Client-Side)**

#### Exemplo: Esconder botões baseado em permissões

```svelte
<!-- src/routes/(protected)/admin/users/+page.svelte -->
<script lang="ts">
  import { can } from '$lib/server/permissions';

  export let data;

  // Pegar role do usuário logado
  const userRole = data.user?.role || 'guest';
</script>

<div>
  <h1>Usuários do Sistema</h1>

  {#each data.systemUsers as systemUser}
    <div class="user-card">
      <p>{systemUser.name} - {systemUser.role}</p>

      <!--  Manager NÃO vê este botão -->
      {#if can(userRole, 'canDeleteUsers')}
        <form method="POST" action="?/deleteSystemUser">
          <input type="hidden" name="userId" value={systemUser.id} />
          <Button variant="destructive" type="submit">
            Deletar Usuário
          </Button>
        </form>
      {:else}
        <p class="text-muted-foreground text-sm">
          Apenas admins podem deletar usuários do sistema
        </p>
      {/if}
    </div>
  {/each}
</div>
```

---

##  Exemplos Práticos

### **Exemplo 1: Página de Configurações**

```typescript
// src/routes/(protected)/settings/+page.server.ts
export const load: PageServerLoad = async ({ locals }) => {
  const session = await locals.auth();
  const userRole = session?.user?.role || 'guest';

  //  Bloquear acesso se não for admin
  if (!can(userRole, 'canAccessSettings')) {
    throw redirect(303, '/painel');
  }

  return {
    settings: await getSettings()
  };
};
```

### **Exemplo 2: Botão de Reembolso**

```svelte
<!-- src/routes/(protected)/payments/+page.svelte -->
<script lang="ts">
  import { can } from '$lib/server/permissions';
  export let data;

  const userRole = data.user?.role || 'guest';
</script>

<!-- Ambos admin E manager veem este botão -->
{#if can(userRole, 'canRefundPayments')}
  <Button onclick={() => refundPayment(payment.id)}>
    Reembolsar
  </Button>
{/if}
```

### **Exemplo 3: Menu Lateral Condicional**

```svelte
<!-- src/lib/components/Sidebar.svelte -->
<script lang="ts">
  import { can } from '$lib/server/permissions';
  export let user;

  const userRole = user?.role || 'guest';
</script>

<nav>
  <a href="/painel">Dashboard</a>
  <a href="/cursos">Cursos</a>
  <a href="/payments">Pagamentos</a>

  <!--  Só admin vê Configurações -->
  {#if can(userRole, 'canAccessSettings')}
    <a href="/settings">⚙️ Configurações</a>
  {/if}

  <!--  Só admin vê Gerenciar Usuários do Sistema -->
  {#if can(userRole, 'canManageRoles')}
    <a href="/admin/users">👥 Gerenciar Sistema</a>
  {/if}
</nav>
```

---

##  Regras Importantes

1. **SEMPRE verificar no backend** - Nunca confie apenas no frontend
2. **Esconder botões no frontend** - Melhora UX, mas não é segurança
3. **Usar `requirePermission`** em ações críticas - Lança erro automaticamente
4. **Usar `can`** para condicionais - Retorna boolean

---

##  Checklist de Implementação

Quando criar novas features:

- [ ] Adicionar permissão em `permissions.ts` se necessário
- [ ] Proteger rota no `+page.server.ts` com `requirePermission`
- [ ] Esconder/mostrar botões no `+page.svelte` com `can`
- [ ] Testar como admin (deve ver tudo)
- [ ] Testar como manager (não deve ver configs/gerenciamento de sistema)
- [ ] Adicionar mensagens de erro amigáveis

---

##  Referência Rápida

```typescript
// Importar
import { can, requirePermission, getPermissions } from '$lib/server/permissions';

// Verificar permissão (retorna boolean)
if (can(userRole, 'canDeleteCourses')) { ... }

// Exigir permissão (lança erro se não tiver)
requirePermission(userRole, 'canDeleteCourses');

// Obter todas as permissões do role
const permissions = getPermissions('manager');
console.log(permissions.canDeleteCourses); // true
```

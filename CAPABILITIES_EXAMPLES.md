# Guia de Uso: Sistema de Capabilities

Este documento mostra como usar o sistema de capabilities (permissões) no projeto.

## 📚 Índice

1. [Capabilities Disponíveis](#capabilities-disponíveis)
2. [Permissões por Role](#permissões-por-role)
3. [Funções Disponíveis](#funções-disponíveis)
4. [Exemplos de Uso em Rotas](#exemplos-de-uso-em-rotas)
5. [Exemplos de Uso em Components](#exemplos-de-uso-em-components)

---

## Capabilities Disponíveis

```typescript
// Importar as capabilities
import { CAPABILITIES } from '$lib/server/capabilities';

// Cursos
CAPABILITIES.COURSES_VIEW              // Visualizar cursos
CAPABILITIES.COURSES_CREATE            // Criar cursos
CAPABILITIES.COURSES_UPDATE            // Editar cursos
CAPABILITIES.COURSES_DELETE            // Deletar cursos
CAPABILITIES.COURSES_ENROLL            // Inscrever-se em cursos
CAPABILITIES.COURSES_MANAGE_ENROLLMENTS // Gerenciar inscrições

// Salas
CAPABILITIES.ROOMS_VIEW                // Visualizar salas
CAPABILITIES.ROOMS_CREATE              // Criar salas
CAPABILITIES.ROOMS_UPDATE              // Editar salas
CAPABILITIES.ROOMS_DELETE              // Deletar salas

// Usuários
CAPABILITIES.USERS_VIEW                // Visualizar usuários
CAPABILITIES.USERS_CREATE              // Criar usuários
CAPABILITIES.USERS_UPDATE              // Editar usuários
CAPABILITIES.USERS_DELETE              // Deletar usuários
CAPABILITIES.USERS_MANAGE_ROLES        // Gerenciar roles de usuários

// Sistema
CAPABILITIES.SYSTEM_SETTINGS           // Configurações do sistema
CAPABILITIES.SYSTEM_LOGS               // Visualizar logs
CAPABILITIES.SYSTEM_BACKUP             // Fazer backup
```

---

## Permissões por Role

### 🔴 Admin
- **Acesso completo** a todas as capabilities

### 🟡 Manager
- **Cursos**: todas as permissões (create, update, delete, manage enrollments)
- **Salas**: todas as permissões (create, update, delete)
- **Usuários**: apenas visualizar
- **Sistema**: sem acesso

### 🟢 User
- **Cursos**: visualizar e se inscrever
- **Salas**: apenas visualizar
- **Usuários**: sem acesso
- **Sistema**: sem acesso

### ⚪ Guest
- **Cursos**: apenas visualizar
- **Salas**: apenas visualizar
- **Usuários**: sem acesso
- **Sistema**: sem acesso

---

## Funções Disponíveis

### Verificação por Role

```typescript
// Requer autenticação (qualquer usuário logado)
requireAuth(event)

// Requer role específica
requireAdmin(event)           // Apenas admin
requireManager(event)         // Admin ou Manager
requireRole(event, 'user')    // Role específica
```

### Verificação por Capability

```typescript
// Requer UMA capability específica
requireCapability(event, CAPABILITIES.COURSES_CREATE)

// Requer TODAS as capabilities
requireAllCapabilities(event, [
  CAPABILITIES.COURSES_CREATE,
  CAPABILITIES.ROOMS_VIEW
])

// Requer QUALQUER UMA das capabilities
requireAnyCapability(event, [
  CAPABILITIES.COURSES_VIEW,
  CAPABILITIES.COURSES_CREATE
])

// Verifica sem lançar erro (retorna true/false)
hasCapability(event, CAPABILITIES.COURSES_DELETE)

// Obtém todas as capabilities do usuário
getUserCapabilities(event)
```

---

## Exemplos de Uso em Rotas

### Exemplo 1: Criar Curso (POST)

```typescript
// src/routes/api/courses/+server.ts
import type { RequestEvent } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { requireCapability } from '$lib/server/middleware/auth';
import { CAPABILITIES } from '$lib/server/capabilities';

export async function POST(event: RequestEvent) {
  // Apenas usuários com permissão de criar cursos
  const user = await requireCapability(event, CAPABILITIES.COURSES_CREATE);

  const body = await event.request.json();

  // Criar curso no banco de dados
  // ...

  return json({ success: true });
}
```

### Exemplo 2: Deletar Sala (DELETE)

```typescript
// src/routes/api/rooms/[id]/+server.ts
import type { RequestEvent } from '@sveltejs/kit';
import { json } from '@sveltejs/kit';
import { requireCapability } from '$lib/server/middleware/auth';
import { CAPABILITIES } from '$lib/server/capabilities';

export async function DELETE(event: RequestEvent) {
  // Apenas admin ou manager podem deletar salas
  await requireCapability(event, CAPABILITIES.ROOMS_DELETE);

  const roomId = event.params.id;

  // Deletar sala do banco
  // ...

  return json({ success: true });
}
```

### Exemplo 3: Visualizar ou Criar Curso

```typescript
// src/routes/api/courses/+server.ts
import { json } from '@sveltejs/kit';
import { requireAnyCapability } from '$lib/server/middleware/auth';
import { CAPABILITIES } from '$lib/server/capabilities';

export async function GET(event: RequestEvent) {
  // Qualquer um que possa VER ou CRIAR cursos
  await requireAnyCapability(event, [
    CAPABILITIES.COURSES_VIEW,
    CAPABILITIES.COURSES_CREATE
  ]);

  // Buscar cursos do banco
  // ...

  return json({ courses: [] });
}
```

### Exemplo 4: Gerenciar Usuários (requer múltiplas permissões)

```typescript
// src/routes/api/users/manage/+server.ts
import { json } from '@sveltejs/kit';
import { requireAllCapabilities } from '$lib/server/middleware/auth';
import { CAPABILITIES } from '$lib/server/capabilities';

export async function POST(event: RequestEvent) {
  // Precisa poder VER usuários E GERENCIAR roles
  await requireAllCapabilities(event, [
    CAPABILITIES.USERS_VIEW,
    CAPABILITIES.USERS_MANAGE_ROLES
  ]);

  // Atualizar role do usuário
  // ...

  return json({ success: true });
}
```

### Exemplo 5: Verificação Condicional

```typescript
// src/routes/api/courses/[id]/+server.ts
import { json, error } from '@sveltejs/kit';
import { requireAuth, hasCapability } from '$lib/server/middleware/auth';
import { CAPABILITIES } from '$lib/server/capabilities';

export async function PATCH(event: RequestEvent) {
  const user = await requireAuth(event);

  // Verifica se pode editar qualquer curso
  const canEditAll = await hasCapability(event, CAPABILITIES.COURSES_UPDATE);

  if (!canEditAll) {
    // Se não pode editar todos, verifica se é o professor do curso
    const courseId = event.params.id;
    const course = await db.getCourse(courseId);

    if (course.teacher !== user.id) {
      throw error(403, 'Você só pode editar seus próprios cursos');
    }
  }

  // Editar curso
  // ...

  return json({ success: true });
}
```

---

## Exemplos de Uso em Components

### Exemplo 1: Mostrar botão apenas se tiver permissão

```svelte
<!-- src/routes/(protected)/courses/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;

  const canCreate = data.capabilities.includes('courses.create');
  const canDelete = data.capabilities.includes('courses.delete');
</script>

<div>
  <h1>Cursos</h1>

  {#if canCreate}
    <a href="/courses/new" class="btn">
      + Criar Novo Curso
    </a>
  {/if}

  {#each data.courses as course}
    <div class="course-card">
      <h2>{course.name}</h2>

      {#if canDelete}
        <button on:click={() => deleteCourse(course.id)}>
          Deletar
        </button>
      {/if}
    </div>
  {/each}
</div>
```

### Exemplo 2: Layout com capabilities

```typescript
// src/routes/(protected)/courses/+layout.server.ts
import type { LayoutServerLoad } from './$types';
import { getUserCapabilities } from '$lib/server/middleware/auth';

export const load: LayoutServerLoad = async (event) => {
  const capabilities = await getUserCapabilities(event);

  return {
    capabilities
  };
};
```

---

## Resumo dos Métodos

| Método | Uso | Quando Usar |
|--------|-----|-------------|
| `requireAuth()` | Requer login | Qualquer rota protegida |
| `requireAdmin()` | Requer admin | Funcionalidades administrativas |
| `requireManager()` | Requer admin/manager | Gerenciamento de recursos |
| `requireRole()` | Requer role específica | Controle exato de role |
| `requireCapability()` | Requer 1 permissão | Ação específica (ex: criar) |
| `requireAllCapabilities()` | Requer TODAS | Operações complexas |
| `requireAnyCapability()` | Requer QUALQUER UMA | Acesso alternativo |
| `hasCapability()` | Verifica (sem erro) | UI condicional |
| `getUserCapabilities()` | Lista todas | Dados para componentes |

---

## Modificando Permissões

Para adicionar/modificar capabilities, edite:

**`src/lib/server/capabilities.ts`**

```typescript
// 1. Adicionar nova capability
export const CAPABILITIES = {
  // ... existentes
  REPORTS_VIEW: 'reports.view',  // ← Nova
} as const;

// 2. Atribuir aos roles
export const ROLE_CAPABILITIES: Record<Role, Capability[]> = {
  admin: [
    // ... existentes
    CAPABILITIES.REPORTS_VIEW,  // ← Adicionar aqui
  ],
  manager: [
    CAPABILITIES.REPORTS_VIEW,  // ← E aqui se necessário
  ],
  // ...
};
```

---

**Implementado com sucesso! 🎉**

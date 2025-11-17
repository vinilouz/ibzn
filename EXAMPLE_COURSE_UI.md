# Exemplo de UI: Controle de Vagas e Financeiro

Este documento mostra exemplos de como implementar a UI para exibir vagas e processar pagamentos.

---

## 📋 Exemplo 1: Card de Curso com Vagas

```svelte
<!-- src/routes/(protected)/courses/CourseCard.svelte -->
<script lang="ts">
  export let course: {
    id: number;
    courseName: string;
    description: string;
    price: number;
    capacity: number;
    isFull: boolean;
    teacher: string;
  };

  export let enrollmentCount: number = 0; // Receber do servidor
  export let isEnrolled: boolean = false;
  export let canEnroll: boolean = true; // Baseado em capabilities

  $: availableSpots = course.capacity - enrollmentCount;
  $: spotsPercentage = (enrollmentCount / course.capacity) * 100;

  async function handleEnroll() {
    const res = await fetch('/api/enroll', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: course.id })
    });

    const data = await res.json();

    if (data.success) {
      alert(`Inscrição realizada! Valor: R$ ${data.coursePrice}`);
      // Redirecionar para pagamento
      window.location.href = `/payments/${course.id}`;
    } else {
      alert(data.error);
    }
  }
</script>

<div class="card">
  <h3>{course.courseName}</h3>
  <p>{course.description}</p>

  <!-- Informação de Vagas -->
  <div class="vacancy-info">
    <div class="vacancy-bar">
      <div
        class="vacancy-fill"
        style="width: {spotsPercentage}%"
        class:full={course.isFull}
      ></div>
    </div>

    <div class="vacancy-text">
      {#if course.isFull}
        <span class="badge badge-danger">LOTADO</span>
      {:else if availableSpots <= 3}
        <span class="badge badge-warning">
          Últimas {availableSpots} vagas!
        </span>
      {:else}
        <span class="badge badge-info">
          {availableSpots} de {course.capacity} vagas
        </span>
      {/if}
    </div>
  </div>

  <!-- Preço -->
  <div class="price">
    <span class="price-label">Investimento:</span>
    <span class="price-value">R$ {course.price.toFixed(2)}</span>
  </div>

  <!-- Botão de Inscrição -->
  <div class="actions">
    {#if isEnrolled}
      <button class="btn btn-secondary" disabled>
        ✓ Já Inscrito
      </button>
    {:else if course.isFull}
      <button class="btn btn-disabled" disabled>
        Curso Lotado
      </button>
    {:else if !canEnroll}
      <p class="text-muted">Você não tem permissão para se inscrever</p>
    {:else}
      <button class="btn btn-primary" on:click={handleEnroll}>
        Inscrever-se
      </button>
    {/if}
  </div>
</div>

<style>
  .card {
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1.5rem;
    margin-bottom: 1rem;
  }

  .vacancy-bar {
    width: 100%;
    height: 8px;
    background: #e0e0e0;
    border-radius: 4px;
    overflow: hidden;
    margin: 0.5rem 0;
  }

  .vacancy-fill {
    height: 100%;
    background: #4caf50;
    transition: width 0.3s ease;
  }

  .vacancy-fill.full {
    background: #f44336;
  }

  .vacancy-text {
    margin: 0.5rem 0;
  }

  .badge {
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .badge-info {
    background: #2196f3;
    color: white;
  }

  .badge-warning {
    background: #ff9800;
    color: white;
  }

  .badge-danger {
    background: #f44336;
    color: white;
  }

  .price {
    margin: 1rem 0;
    font-size: 1.25rem;
  }

  .price-value {
    font-weight: bold;
    color: #4caf50;
  }

  .btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    transition: all 0.2s;
  }

  .btn-primary {
    background: #4caf50;
    color: white;
  }

  .btn-primary:hover {
    background: #45a049;
  }

  .btn-secondary {
    background: #9e9e9e;
    color: white;
  }

  .btn-disabled {
    background: #e0e0e0;
    color: #9e9e9e;
    cursor: not-allowed;
  }
</style>
```

---

## 📋 Exemplo 2: Página de Listagem com Server Load

```typescript
// src/routes/(protected)/courses/+page.server.ts
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { courses, courseEnrollments } from '$lib/server/db/schema';
import { eq, count } from 'drizzle-orm';
import { getUserCapabilities } from '$lib/server/middleware/auth';
import { CAPABILITIES } from '$lib/server/capabilities';

export const load: PageServerLoad = async (event) => {
    // Buscar capabilities do usuário
    const capabilities = await getUserCapabilities(event);
    const canEnroll = capabilities.includes(CAPABILITIES.COURSES_ENROLL);

    // Buscar todos os cursos
    const allCourses = await db.select().from(courses);

    // Para cada curso, contar inscrições
    const coursesWithEnrollments = await Promise.all(
        allCourses.map(async (course) => {
            const [enrollmentData] = await db
                .select({ count: count() })
                .from(courseEnrollments)
                .where(eq(courseEnrollments.courseId, course.id));

            return {
                ...course,
                enrollmentCount: enrollmentData?.count || 0
            };
        })
    );

    return {
        courses: coursesWithEnrollments,
        canEnroll
    };
};
```

```svelte
<!-- src/routes/(protected)/courses/+page.svelte -->
<script lang="ts">
  import CourseCard from './CourseCard.svelte';
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<div class="container">
  <h1>Cursos Disponíveis</h1>

  <div class="filters">
    <label>
      <input type="checkbox" bind:checked={showFullOnly} />
      Mostrar apenas com vagas
    </label>
  </div>

  <div class="course-grid">
    {#each data.courses as course}
      {#if !showFullOnly || !course.isFull}
        <CourseCard
          {course}
          enrollmentCount={course.enrollmentCount}
          canEnroll={data.canEnroll}
        />
      {/if}
    {:else}
      <p>Nenhum curso encontrado.</p>
    {/each}
  </div>
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .course-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 1.5rem;
    margin-top: 2rem;
  }

  .filters {
    margin: 1rem 0;
  }
</style>
```

---

## 📋 Exemplo 3: Página de Pagamento

```svelte
<!-- src/routes/(protected)/payments/[courseId]/+page.svelte -->
<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;

  let paymentMethod = 'pix';
  let processing = false;

  async function confirmPayment() {
    processing = true;

    const res = await fetch(`/api/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId: data.course.id,
        paymentMethod
      })
    });

    const result = await res.json();

    if (result.success) {
      alert('Pagamento registrado! Aguardando confirmação.');
      window.location.href = '/my-courses';
    } else {
      alert(result.error);
    }

    processing = false;
  }
</script>

<div class="payment-page">
  <h1>Finalizar Inscrição</h1>

  <div class="course-summary">
    <h2>{data.course.courseName}</h2>
    <p class="price">R$ {data.course.price.toFixed(2)}</p>
  </div>

  <div class="payment-methods">
    <h3>Forma de Pagamento</h3>

    <label>
      <input type="radio" bind:group={paymentMethod} value="pix" />
      PIX
    </label>

    <label>
      <input type="radio" bind:group={paymentMethod} value="credit_card" />
      Cartão de Crédito
    </label>

    <label>
      <input type="radio" bind:group={paymentMethod} value="boleto" />
      Boleto
    </label>
  </div>

  <button
    class="btn btn-primary"
    on:click={confirmPayment}
    disabled={processing}
  >
    {processing ? 'Processando...' : 'Confirmar Pagamento'}
  </button>
</div>
```

---

## 🎯 Resumo das Features Implementadas

| Feature | Status | Arquivo |
|---------|--------|---------|
| **Controle de Vagas** | ✅ | `/api/enroll/+server.ts` |
| **Flag `isFull` Automática** | ✅ | `/api/enroll/+server.ts` |
| **Cancelamento de Inscrição** | ✅ | `/api/enroll/+server.ts` (DELETE) |
| **Schema de Pagamentos** | ✅ | `schema/payments.ts` |
| **API de Pagamentos** | ✅ | `/api/payments/+server.ts` |
| **Atualizar Status Pagamento** | ✅ | `/api/payments/[id]/+server.ts` |
| **Verificação de Capabilities** | ✅ | Middleware aplicado |
| **UI com Vagas Disponíveis** | ✅ | Exemplos neste arquivo |

---

**Tudo implementado!** 🎊

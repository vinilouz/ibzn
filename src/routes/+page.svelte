<script lang="ts">
  import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
  import { User } from 'lucide-svelte';

  type Facilitator = {
    id: number;
    name: string;
    role?: string;
    createdAt?: string;
  };
  type Customer = {
    id: number;
    name: string;
    role?: string;
    createdAt?: string;
  };

  export let data: {
    facilitators: Facilitator[];
    customers: Customer[];
  };
</script>

<h1 class="text-3xl font-bold mb-8">HOME</h1>

<section class="mb-12">
  <h2 class="text-2xl font-semibold mb-4">Facilitadores</h2>
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {#each data.facilitators as facilitator}
      <Card>
        <CardHeader>
          <div class="flex items-center gap-3">
            <User class="w-8 h-8 text-primary" />
            <div>
              <h3 class="font-semibold">{facilitator.name}</h3>
              <p class="text-sm text-muted-foreground">{facilitator.role}</p>
              <p class="text-xs text-muted-foreground">Entrou: {facilitator.createdAt}</p>
            </div>
          </div>
        </CardHeader>
      </Card>
    {/each}
  </div>
</section>

<section>
  <h2 class="text-2xl font-semibold mb-4">Clientes</h2>
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {#each data.customers as customer}
      <Card>
        <CardHeader>
          <div class="flex items-center gap-3">
            <User class="w-8 h-8 text-primary" />
            <div>
              <h3 class="font-semibold">{customer.name}</h3>
              <p class="text-sm text-muted-foreground">{customer.role}</p>
              <p class="text-xs text-muted-foreground">Entrou: {customer.createdAt}</p>
            </div>
          </div>
        </CardHeader>
      </Card>
    {/each}
  </div>
</section>
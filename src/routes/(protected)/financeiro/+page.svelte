<script lang="ts">
  import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { Input } from '$lib/components/ui/input';
  import { Button } from '$lib/components/ui/button';
  import { DollarSign, Clock, CheckCircle, Gift, AlertCircle, Search, ShieldAlert } from 'lucide-svelte';
  import Pagination from '$lib/components/Pagination.svelte';
  import type { PageData } from './$types';
  import { goto } from '$app/navigation';

  let { data }: { data: PageData } = $props();

  let currentPageCursos = $state(1);
  const itemsPerPageCursos = 5;
  let searchTerm = $state('');

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }



  const filteredCursos = $derived.by(() => {
    const cursos = data.cursosComEstatisticas || [];
    if (!searchTerm.trim()) return cursos;

    return cursos.filter(curso =>
      curso.courseName.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const paginatedCursos = $derived.by(() => {
    const start = (currentPageCursos - 1) * itemsPerPageCursos;
    const end = start + itemsPerPageCursos;
    return filteredCursos.slice(start, end);
  });

  $effect(() => {
    currentPageCursos = 1;
  });
</script>

{#if data.unauthorized}
  <!-- Mensagem de Acesso Negado -->
  <div class="flex items-center justify-center min-h-[calc(100vh-200px)]">
    <Card class="w-full max-w-md border-destructive">
      <CardHeader>
        <div class="flex flex-col items-center gap-4">
          <div class="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <ShieldAlert class="h-8 w-8 text-destructive" />
          </div>
          <div class="text-center">
            <CardTitle class="text-2xl text-destructive">Acesso Negado</CardTitle>
            <CardDescription class="mt-2">
              Você não possui permissão para acessar esta página
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent class="space-y-4">
        <div class="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
          <p class="text-sm text-center">
            Esta área é restrita apenas para <strong>Administradores</strong>.
          </p>
        </div>
        <Button 
          class="w-full" 
          onclick={() => goto('/painel')}
        >
          Voltar ao Dashboard
        </Button>
      </CardContent>
    </Card>
  </div>
{:else}
  <div class="container mx-auto p-6 max-w-7xl">
    <div class="mb-8">
      <h1 class="text-3xl font-bold">Dashboard Financeiro</h1>
      <p class="text-muted-foreground mt-1">Visão geral de receitas e pagamentos</p>
    </div>

    <!-- Cards de Estatísticas -->
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
    <!-- Total Receita -->
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Receita Total</CardTitle>
        <DollarSign class="h-4 w-4 text-green-600" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold text-green-600">{formatCurrency(data.stats?.totalReceita ?? 0)}</div>
        <p class="text-xs text-muted-foreground mt-1">Pagamentos confirmados</p>
      </CardContent>
    </Card>

    <!-- Total Pendente -->
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Pendente</CardTitle>
        <Clock class="h-4 w-4 text-yellow-600" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold text-yellow-600">{formatCurrency(data.stats?.totalPendente ?? 0)}</div>
        <p class="text-xs text-muted-foreground mt-1">Aguardando pagamento</p>
      </CardContent>
    </Card>

    <!-- Vagas Gratuitas -->
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Vagas Gratuitas</CardTitle>
        <Gift class="h-4 w-4 text-blue-600" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold text-blue-600">{data.stats?.totalGratuito ?? 0}</div>
        <p class="text-xs text-muted-foreground mt-1">Participantes com 100% desconto</p>
      </CardContent>
    </Card>

    <!-- Total Pago -->
    <Card>
      <CardHeader class="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle class="text-sm font-medium">Pagamentos</CardTitle>
        <CheckCircle class="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div class="text-2xl font-bold">{formatCurrency(data.stats?.totalPago ?? 0)}</div>
        <p class="text-xs text-muted-foreground mt-1">Total arrecadado</p>
      </CardContent>
    </Card>
  </div>

  <!-- Receita por Curso -->
  <div class="grid gap-6 md:grid-cols-2 mb-8">
    <Card>
      <CardHeader>
        <CardTitle>Receita por Curso</CardTitle>
        <CardDescription>Cursos com maior arrecadação</CardDescription>
      </CardHeader>
      <CardContent>
        {#if !data.receitaPorCurso || data.receitaPorCurso.length === 0}
          <p class="text-sm text-muted-foreground">Nenhum pagamento registrado ainda</p>
        {:else}
          <div class="space-y-4">
            {#each data.receitaPorCurso.slice(0, 5) as curso}
              <div class="flex items-center justify-between">
                <div class="flex-1">
                  <p class="font-medium">{curso.courseName}</p>
                  <p class="text-sm text-muted-foreground">{curso.count} pagamento(s)</p>
                </div>
                <div class="text-right">
                  <p class="font-bold text-green-600">{formatCurrency(curso.total)}</p>
                </div>
              </div>
            {/each}
          </div>
        {/if}
      </CardContent>
    </Card>

    <!-- Estatísticas por Curso -->
    <Card>
      <CardHeader>
        <CardTitle>Participantes por Curso</CardTitle>
        <CardDescription>Pagantes vs Não-Pagantes</CardDescription>
      </CardHeader>
      <CardContent>
        {#if !data.cursosComEstatisticas || data.cursosComEstatisticas.length === 0}
          <p class="text-sm text-muted-foreground">Nenhum curso cadastrado ainda</p>
        {:else}
          <div class="mb-4">
            <div class="relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por nome do curso..."
                bind:value={searchTerm}
                class="pl-10"
              />
            </div>
          </div>

          {#if filteredCursos.length === 0}
            <p class="text-sm text-muted-foreground text-center py-8">Nenhum curso encontrado com "{searchTerm}"</p>
          {:else}
            <div class="space-y-4">
            {#each paginatedCursos as curso}
              <div class="border-b pb-3 last:border-b-0">
                <div class="flex items-center justify-between mb-2">
                  <p class="font-medium">{curso.courseName}</p>
                  <Badge variant="outline">{curso.totalMatriculas} matriculados</Badge>
                </div>
                <div class="grid grid-cols-3 gap-2 text-sm">
                  <div class="flex items-center gap-1">
                    <CheckCircle class="h-3 w-3 text-green-600" />
                    <span class="text-muted-foreground">{curso.pagantes} pagantes</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <Gift class="h-3 w-3 text-blue-600" />
                    <span class="text-muted-foreground">{curso.naoPagantes} gratuitos</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <AlertCircle class="h-3 w-3 text-yellow-600" />
                    <span class="text-muted-foreground">{curso.semPagamento} sem registro</span>
                  </div>
                </div>
                <p class="text-sm font-medium text-green-600 mt-1">
                  Total: {formatCurrency(curso.receitaTotal)}
                </p>
              </div>
            {/each}
          </div>
          <Pagination
            bind:currentPage={currentPageCursos}
            totalItems={filteredCursos.length}
            itemsPerPage={itemsPerPageCursos}
            onPageChange={() => {}}
          />
          {/if}
        {/if}
      </CardContent>
    </Card>
    </div>
  </div>
{/if}

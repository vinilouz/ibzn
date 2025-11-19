<script lang="ts">
  import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '$lib/components/ui/card';
  import { Badge } from '$lib/components/ui/badge';
  import { DollarSign, Clock, CheckCircle, Gift, AlertCircle } from 'lucide-svelte';

  export let data;

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'refunded': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'paid': return 'Pago';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      case 'refunded': return 'Reembolsado';
      default: return status;
    }
  }
</script>

<div class="container mx-auto p-6 max-w-7xl">
  <!-- Header -->
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
        <div class="text-2xl font-bold text-green-600">{formatCurrency(data.stats.totalReceita)}</div>
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
        <div class="text-2xl font-bold text-yellow-600">{formatCurrency(data.stats.totalPendente)}</div>
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
        <div class="text-2xl font-bold text-blue-600">{data.stats.totalGratuito}</div>
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
        <div class="text-2xl font-bold">{formatCurrency(data.stats.totalPago)}</div>
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
        {#if data.receitaPorCurso.length === 0}
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
        {#if data.cursosComEstatisticas.length === 0}
          <p class="text-sm text-muted-foreground">Nenhum curso cadastrado ainda</p>
        {:else}
          <div class="space-y-4">
            {#each data.cursosComEstatisticas as curso}
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
        {/if}
      </CardContent>
    </Card>
  </div>

  <!-- Últimos Pagamentos -->
  <Card>
    <CardHeader>
      <CardTitle>Últimos Pagamentos</CardTitle>
      <CardDescription>Histórico recente de transações</CardDescription>
    </CardHeader>
    <CardContent>
      {#if data.payments.length === 0}
        <div class="flex flex-col items-center justify-center py-8">
          <DollarSign class="w-12 h-12 text-muted-foreground mb-3" />
          <p class="text-muted-foreground">Nenhum pagamento registrado ainda</p>
        </div>
      {:else}
        <div class="space-y-3">
          {#each data.payments.slice(0, 10) as item}
            <div class="flex items-center justify-between p-3 border rounded-lg hover:bg-accent/50 transition-colors">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <p class="font-medium">{item.participantName || 'Participante'}</p>
                  {#if item.participantPhone}
                    <span class="text-xs text-muted-foreground">({item.participantPhone})</span>
                  {/if}
                  <span class={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(item.payment.status)}`}>
                    {getStatusText(item.payment.status)}
                  </span>
                </div>
                <p class="text-sm text-muted-foreground">{item.courseName || 'Curso'}</p>
                <p class="text-xs text-muted-foreground mt-1">{formatDate(item.payment.createdAt)}</p>
              </div>
              <div class="text-right">
                {#if item.payment.discount && item.payment.discount > 0}
                  <p class="text-xs text-muted-foreground line-through">{formatCurrency(item.payment.amount)}</p>
                  <p class="text-sm text-green-600 font-medium">-{formatCurrency(item.payment.discount)}</p>
                {/if}
                <p class="font-bold text-lg">{formatCurrency(item.payment.finalAmount)}</p>
                {#if item.payment.finalAmount === 0}
                  <Badge variant="secondary" class="text-xs">Gratuito</Badge>
                {/if}
              </div>
            </div>
          {/each}
        </div>

        {#if data.payments.length > 10}
          <div class="mt-4 text-center">
            <a href="/payments" class="text-sm text-primary hover:underline">
              Ver todos os pagamentos ({data.payments.length})
            </a>
          </div>
        {/if}
      {/if}
    </CardContent>
  </Card>
</div>

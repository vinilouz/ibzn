<script lang="ts">
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Sheet, SheetContent, SheetHeader, SheetTitle } from '$lib/components/ui/sheet';
  import { enhance } from '$app/forms';
  import { Plus, DollarSign, Check, X, Clock, RefreshCw } from 'lucide-svelte';

  export let data;

  let drawerOpen = false;
  let selectedPayment: typeof data.payments[0] | null = null;
  let isEditMode = false;

  function openCreateDrawer() {
    selectedPayment = null;
    isEditMode = false;
    drawerOpen = true;
  }

  function openEditDrawer(payment: typeof data.payments[0]) {
    selectedPayment = payment;
    isEditMode = true;
    drawerOpen = true;
  }

  function closeDrawer() {
    drawerOpen = false;
    selectedPayment = null;
    isEditMode = false;
  }

  function getStatusColor(status: string) {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'refunded': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusIcon(status: string) {
    switch (status) {
      case 'paid': return Check;
      case 'pending': return Clock;
      case 'cancelled': return X;
      case 'refunded': return RefreshCw;
      default: return Clock;
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

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }
</script>

<div class="container mx-auto p-6 max-w-7xl">
  <!-- Header -->
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="text-3xl font-bold">Pagamentos</h1>
      <p class="text-muted-foreground mt-1">Gerencie os pagamentos dos cursos</p>
    </div>
    <button type="button" on:click={openCreateDrawer} class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
      <Plus class="w-4 h-4" />
      Registrar Pagamento
    </button>
  </div>

  <!-- Lista de Pagamentos -->
  <div class="grid gap-4">
    {#each data.payments as payment}
      {@const StatusIcon = getStatusIcon(payment.payment.status)}
      <Card class="hover:shadow-lg transition-shadow">
        <CardContent class="p-6">
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-2">
                <DollarSign class="w-5 h-5 text-primary" />
                <h3 class="font-semibold text-lg">{payment.participantName || 'Participante'}</h3>
                {#if payment.participantPhone}
                  <span class="text-sm text-muted-foreground">({payment.participantPhone})</span>
                {/if}
                <span class={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusColor(payment.payment.status)}`}>
                  <StatusIcon class="w-3 h-3" />
                  {getStatusText(payment.payment.status)}
                </span>
              </div>

              <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div>
                  <p class="text-sm text-muted-foreground">Curso</p>
                  <p class="font-medium">{payment.courseName || 'N/A'}</p>
                </div>
                <div>
                  <p class="text-sm text-muted-foreground">Valor</p>
                  <p class="font-medium">{formatCurrency(payment.payment.amount)}</p>
                </div>
                {#if payment.payment.discount && payment.payment.discount > 0}
                <div>
                  <p class="text-sm text-muted-foreground">Desconto</p>
                  <p class="font-medium text-green-600">-{formatCurrency(payment.payment.discount)}</p>
                </div>
                {/if}
                <div>
                  <p class="text-sm text-muted-foreground">Valor Final</p>
                  <p class="font-bold text-primary">{formatCurrency(payment.payment.finalAmount)}</p>
                </div>
                {#if payment.payment.paymentMethod}
                <div>
                  <p class="text-sm text-muted-foreground">Método</p>
                  <p class="font-medium capitalize">{payment.payment.paymentMethod.replace('_', ' ')}</p>
                </div>
                {/if}
                <div>
                  <p class="text-sm text-muted-foreground">Data</p>
                  <p class="font-medium">{formatDate(payment.payment.createdAt)}</p>
                </div>
              </div>

              {#if payment.payment.notes}
                <div class="mt-3 p-3 bg-muted rounded-md">
                  <p class="text-sm text-muted-foreground">Observações:</p>
                  <p class="text-sm">{payment.payment.notes}</p>
                </div>
              {/if}
            </div>

            <div class="flex flex-col gap-2 ml-4">
              <button
                type="button"
                on:click={() => openEditDrawer(payment)}
                class="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
              >
                Gerenciar
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    {/each}
  </div>

  {#if data.payments.length === 0}
    <Card class="mt-8">
      <CardContent class="flex flex-col items-center justify-center py-12">
        <DollarSign class="w-16 h-16 text-muted-foreground mb-4" />
        <h3 class="text-xl font-semibold mb-2">Nenhum pagamento registrado</h3>
        <p class="text-muted-foreground mb-4">Comece registrando o primeiro pagamento</p>
        <button type="button" on:click={openCreateDrawer} class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          <Plus class="w-4 h-4" />
          Registrar Pagamento
        </button>
      </CardContent>
    </Card>
  {/if}

  <!-- Drawer -->
  <Sheet bind:open={drawerOpen}>
    <SheetContent class="w-full sm:max-w-md overflow-y-auto">
      <SheetHeader>
        <SheetTitle>
          {isEditMode ? 'Gerenciar Pagamento' : 'Registrar Pagamento'}
        </SheetTitle>
      </SheetHeader>

      <div class="mt-6">
        {#if isEditMode && selectedPayment}
          <!-- Modo Gerenciamento -->
          <div class="space-y-6">
            <!-- Status atual -->
            <div class="p-4 border rounded-lg">
              <p class="text-sm text-muted-foreground mb-2">Status Atual</p>
              {#snippet statusDisplay()}
                {@const StatusIcon = getStatusIcon(selectedPayment.payment.status)}
                <div class={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 ${getStatusColor(selectedPayment.payment.status)}`}>
                  <StatusIcon class="w-4 h-4" />
                  {getStatusText(selectedPayment.payment.status)}
                </div>
              {/snippet}
              {@render statusDisplay()}
            </div>

            <!-- Alterar Status -->
            <form
              method="POST"
              action="?/updateStatus"
              use:enhance={() => {
                return async ({ result, update }) => {
                  if (result.type === 'success') {
                    closeDrawer();
                  }
                  await update();
                };
              }}
            >
              <input type="hidden" name="id" value={selectedPayment.payment.id} />

              <div>
                <label for="status" class="text-sm font-medium mb-2 block">Alterar Status</label>
                <select
                  id="status"
                  name="status"
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="pending" selected={selectedPayment.payment.status === 'pending'}>Pendente</option>
                  <option value="paid" selected={selectedPayment.payment.status === 'paid'}>Pago</option>
                  <option value="cancelled" selected={selectedPayment.payment.status === 'cancelled'}>Cancelado</option>
                  <option value="refunded" selected={selectedPayment.payment.status === 'refunded'}>Reembolsado</option>
                </select>
              </div>

              <Button type="submit" class="w-full mt-4">
                Atualizar Status
              </Button>
            </form>

            <!-- Deletar -->
            <form
              method="POST"
              action="?/delete"
              use:enhance={() => {
                return async ({ result, update }) => {
                  if (result.type === 'success') {
                    closeDrawer();
                  }
                  await update();
                };
              }}
            >
              <input type="hidden" name="id" value={selectedPayment.payment.id} />
              <Button variant="destructive" type="submit" class="w-full">
                Deletar Pagamento
              </Button>
            </form>
          </div>
        {:else}
          <!-- Modo Criação -->
          <form
            method="POST"
            action="?/create"
            use:enhance={() => {
              return async ({ result, update }) => {
                if (result.type === 'success') {
                  closeDrawer();
                }
                await update();
              };
            }}
            class="space-y-4"
          >
            <div>
              <label for="participantId" class="text-sm font-medium mb-2 block">Participante *</label>
              <select
                id="participantId"
                name="participantId"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Selecione um participante</option>
                {#each data.participants as participant}
                  <option value={participant.id}>
                    {participant.name}
                    {#if participant.phone}
                      - {participant.phone}
                    {/if}
                  </option>
                {/each}
              </select>
            </div>

            <div>
              <label for="courseId" class="text-sm font-medium mb-2 block">Curso *</label>
              <select
                id="courseId"
                name="courseId"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                required
              >
                <option value="">Selecione um curso</option>
                {#each data.courses as course}
                  <option value={course.id}>{course.courseName} - {formatCurrency(course.price)}</option>
                {/each}
              </select>
            </div>

            <div>
              <label for="amount" class="text-sm font-medium mb-2 block">Valor *</label>
              <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" required />
            </div>

            <div>
              <label for="discount" class="text-sm font-medium mb-2 block">Desconto</label>
              <Input id="discount" name="discount" type="number" step="0.01" placeholder="0.00" />
            </div>

            <div>
              <label for="paymentMethod" class="text-sm font-medium mb-2 block">Método de Pagamento</label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">Selecione</option>
                <option value="pix">PIX</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="debit_card">Cartão de Débito</option>
                <option value="bank_transfer">Transferência Bancária</option>
                <option value="boleto">Boleto</option>
                <option value="cash">Dinheiro</option>
              </select>
            </div>

            <div>
              <label for="notes" class="text-sm font-medium mb-2 block">Observações</label>
              <textarea
                id="notes"
                name="notes"
                rows="3"
                class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Informações adicionais sobre o pagamento"
              ></textarea>
            </div>

            <Button type="submit" class="w-full">
              <Plus class="w-4 h-4 mr-2" />
              Registrar Pagamento
            </Button>
          </form>
        {/if}
      </div>
    </SheetContent>
  </Sheet>
</div>

<script lang="ts">
  import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Sheet, SheetContent, SheetHeader, SheetTitle } from '$lib/components/ui/sheet';
  import { enhance } from '$app/forms';
  import { Plus, Pencil, Trash2, User } from 'lucide-svelte';
  
  export let data;
  
  let drawerOpen = false;
  let selectedCustomer: typeof data.customers[0] | null = null;
  let isEditMode = false;

  function openCreateDrawer() {
    console.log('Abrindo drawer de criação');
    selectedCustomer = null;
    isEditMode = false;
    drawerOpen = true;
  }

  function openEditDrawer(customer: typeof data.customers[0]) {
    selectedCustomer = customer;
    isEditMode = true;
    drawerOpen = true;
  }

  function closeDrawer() {
    drawerOpen = false;
    selectedCustomer = null;
    isEditMode = false;
  }
</script>

<div class="container mx-auto p-6 max-w-6xl">
  <!-- Header -->
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="text-3xl font-bold">Clientes</h1>
      <p class="text-muted-foreground mt-1">Gerencie seus clientes</p>
    </div>
    <button type="button" on:click={openCreateDrawer} class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
      <Plus class="w-4 h-4" />
      Novo Cliente
    </button>
  </div>

  <!-- Lista de Clientes -->
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {#each data.customers as customer}
      <button 
        type="button"
        on:click={() => openEditDrawer(customer)}
        class="text-left w-full"
      >
        <Card class="hover:shadow-lg transition-shadow cursor-pointer h-full">
          <CardHeader>
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User class="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 class="font-semibold text-lg">{customer.name}</h3>
                  <p class="text-sm text-muted-foreground">{customer.phone}</p>
                </div>
              </div>
            </div>
          </CardHeader>
          {#if customer.role || customer.address}
            <CardContent>
              {#if customer.role}
                <p class="text-sm"><span class="font-medium">Função:</span> {customer.role}</p>
              {/if}
              {#if customer.address}
                <p class="text-sm text-muted-foreground truncate">{customer.address}</p>
              {/if}
            </CardContent>
          {/if}
        </Card>
      </button>
    {/each}
  </div>

  {#if data.customers.length === 0}
    <Card class="mt-8">
      <CardContent class="flex flex-col items-center justify-center py-12">
        <User class="w-16 h-16 text-muted-foreground mb-4" />
        <h3 class="text-xl font-semibold mb-2">Nenhum cliente cadastrado</h3>
        <p class="text-muted-foreground mb-4">Comece adicionando seu primeiro cliente</p>
        <button type="button" on:click={openCreateDrawer} class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          <Plus class="w-4 h-4 mr-2" />
          Adicionar Cliente
        </button>
      </CardContent>
    </Card>
  {/if}

  <!-- Drawer -->
  <Sheet bind:open={drawerOpen}>
    <SheetContent class="w-full sm:max-w-md overflow-y-auto">
      <SheetHeader>
        <SheetTitle>
          {isEditMode ? 'Detalhes do Cliente' : 'Novo Cliente'}
        </SheetTitle>
      </SheetHeader>

      <div class="mt-6">
        {#if isEditMode && selectedCustomer}
          <!-- Modo Visualização/Edição -->
          <div class="space-y-6">
            <!-- Perfil -->
            <div class="flex items-center gap-4 pb-6 border-b">
              <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User class="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 class="text-xl font-semibold">{selectedCustomer.name}</h2>
                <p class="text-muted-foreground">{selectedCustomer.phone}</p>
              </div>
            </div>

            <!-- Formulário de Edição -->
            <form method="POST" action="?/update" use:enhance on:submit={closeDrawer} class="space-y-4">
              <input type="hidden" name="id" value={selectedCustomer.id} />
              
              <div>
                <label for="edit-name" class="text-sm font-medium mb-2 block">Nome</label>
                <Input id="edit-name" name="name" value={selectedCustomer.name} required />
              </div>

              <div>
                <label for="edit-phone" class="text-sm font-medium mb-2 block">Telefone</label>
                <Input id="edit-phone" name="phone" value={selectedCustomer.phone} required />
              </div>

              <div>
                <label for="edit-address" class="text-sm font-medium mb-2 block">Endereço</label>
                <Input id="edit-address" name="address" value={selectedCustomer.address || ''} />
              </div>

              <div>
                <label for="edit-role" class="text-sm font-medium mb-2 block">Função</label>
                <Input id="edit-role" name="role" value={selectedCustomer.role || ''} />
              </div>

              <div>
                <label for="edit-birthdate" class="text-sm font-medium mb-2 block">Data de Nascimento</label>
                <Input id="edit-birthdate" name="birthdate" type="date" value={selectedCustomer.birthdate || ''} />
              </div>

              <div class="flex gap-2 pt-4">
                <Button type="submit" class="flex-1">
                  <Pencil class="w-4 h-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </form>

            <!-- Botão Excluir -->
            <form method="POST" action="?/delete" use:enhance on:submit={closeDrawer}>
              <input type="hidden" name="id" value={selectedCustomer.id} />
              <Button variant="destructive" type="submit" class="w-full">
                <Trash2 class="w-4 h-4 mr-2" />
                Excluir Cliente
              </Button>
            </form>
          </div>
        {:else}
          <!-- Modo Criação -->
          <form 
            method="POST" 
            action="?/create" 
            use:enhance={() => {
              console.log('Enviando formulário de criação');
              return async ({ result, update }) => {
                console.log('Resultado:', result);
                if (result.type === 'success') {
                  closeDrawer();
                }
                await update();
              };
            }}
            class="space-y-4"
          >
            <div>
              <label for="create-name" class="text-sm font-medium mb-2 block">Nome *</label>
              <Input id="create-name" name="name" placeholder="Nome completo" required />
            </div>

            <div>
              <label for="create-phone" class="text-sm font-medium mb-2 block">Telefone *</label>
              <Input id="create-phone" name="phone" placeholder="(00) 00000-0000" required />
            </div>

            <div>
              <label for="create-address" class="text-sm font-medium mb-2 block">Endereço</label>
              <Input id="create-address" name="address" placeholder="Endereço completo" />
            </div>

            <div>
              <label for="create-role" class="text-sm font-medium mb-2 block">Função</label>
              <Input id="create-role" name="role" placeholder="Cargo ou função" />
            </div>

            <div>
              <label for="create-birthdate" class="text-sm font-medium mb-2 block">Data de Nascimento</label>
              <Input id="create-birthdate" name="birthdate" type="date" />
            </div>

            <Button type="submit" class="w-full">
              <Plus class="w-4 h-4 mr-2" />
              Criar Cliente
            </Button>
          </form>
        {/if}
      </div>
    </SheetContent>
  </Sheet>
</div>
<script lang="ts">
  import { enhance } from '$app/forms';
  import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Sheet, SheetContent, SheetHeader, SheetTitle } from '$lib/components/ui/sheet';
  import { enhanceWithLoadingAndCallback } from '$lib/utils/enhance';
  import { Plus, Pencil, Trash2, Users } from 'lucide-svelte';
  
  export let data;
  
  let drawerOpen = false;
  let selectedFacilitator: typeof data.facilitators[0] | null = null;
  let isEditMode = false;

  function openCreateDrawer() {
    console.log('Abrindo drawer de criação');
    selectedFacilitator = null;
    isEditMode = false;
    drawerOpen = true;
  }

  function openEditDrawer(facilitator: typeof data.facilitators[0]) {
    selectedFacilitator = facilitator;
    isEditMode = true;
    drawerOpen = true;
  }

  function closeDrawer() {
    drawerOpen = false;
    selectedFacilitator = null;
    isEditMode = false;
  }
</script>

<div class="container mx-auto p-6 max-w-6xl">
  <!-- Header -->
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="text-3xl font-bold">Facilitadores</h1>
      <p class="text-muted-foreground mt-1">Gerencie seus facilitadores</p>
    </div>
    <button type="button" on:click={openCreateDrawer} class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
      <Plus class="w-4 h-4" />
      Novo Facilitador
    </button>
  </div>

  <!-- Lista de Facilitadores -->
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {#each data.facilitators as facilitator}
      <button 
        type="button"
        on:click={() => openEditDrawer(facilitator)}
        class="text-left w-full"
      >
        <Card class="hover:shadow-lg transition-shadow cursor-pointer h-full">
          <CardHeader>
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3">
                <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users class="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 class="font-semibold text-lg">{facilitator.name}</h3>
                  <p class="text-sm text-muted-foreground">{facilitator.phone}</p>
                </div>
              </div>
            </div>
          </CardHeader>
          {#if facilitator.role || facilitator.email}
            <CardContent>
              {#if facilitator.role}
                <p class="text-sm"><span class="font-medium">Função:</span> {facilitator.role}</p>
              {/if}
              {#if facilitator.email}
                <p class="text-sm text-muted-foreground truncate">{facilitator.email}</p>
              {/if}
            </CardContent>
          {/if}
        </Card>
      </button>
    {/each}
  </div>

  {#if data.facilitators.length === 0}
    <Card class="mt-8">
      <CardContent class="flex flex-col items-center justify-center py-12">
        <Users class="w-16 h-16 text-muted-foreground mb-4" />
        <h3 class="text-xl font-semibold mb-2">Nenhum facilitador cadastrado</h3>
        <p class="text-muted-foreground mb-4">Comece adicionando seu primeiro facilitador</p>
        <button type="button" on:click={openCreateDrawer} class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          <Plus class="w-4 h-4 mr-2" />
          Adicionar Facilitador
        </button>
      </CardContent>
    </Card>
  {/if}

  <!-- Drawer -->
  <Sheet bind:open={drawerOpen}>
    <SheetContent class="w-full sm:max-w-md overflow-y-auto">
      <SheetHeader>
        <SheetTitle>
          {isEditMode ? 'Detalhes do Facilitador' : 'Novo Facilitador'}
        </SheetTitle>
      </SheetHeader>

      <div class="mt-6">
        {#if isEditMode && selectedFacilitator}
          <!-- Modo Visualização/Edição -->
          <div class="space-y-6">
            <!-- Perfil -->
            <div class="flex items-center gap-4 pb-6 border-b">
              <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Users class="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 class="text-xl font-semibold">{selectedFacilitator.name}</h2>
                <p class="text-muted-foreground">{selectedFacilitator.phone}</p>
              </div>
            </div>

            <!-- Formulário de Edição -->
            <form 
              method="POST" 
              action="?/update" 
              use:enhance={enhanceWithLoadingAndCallback(closeDrawer)}
              class="space-y-4"
            >
              <input type="hidden" name="id" value={selectedFacilitator.id} />
              
              <div>
                <label for="edit-name" class="text-sm font-medium mb-2 block">Nome</label>
                <Input id="edit-name" name="name" value={selectedFacilitator.name} required />
              </div>

              <div>
                <label for="edit-phone" class="text-sm font-medium mb-2 block">Telefone</label>
                <Input id="edit-phone" name="phone" value={selectedFacilitator.phone} required />
              </div>

              <div>
                <label for="edit-email" class="text-sm font-medium mb-2 block">Email</label>
                <Input id="edit-email" name="email" type="email" value={selectedFacilitator.email || ''} />
              </div>

              <div>
                <label for="edit-role" class="text-sm font-medium mb-2 block">Função</label>
                <Input id="edit-role" name="role" value={selectedFacilitator.role || ''} />
              </div>

              <div>
                <label for="edit-birthdate" class="text-sm font-medium mb-2 block">Data de Nascimento</label>
                <Input id="edit-birthdate" name="birthdate" type="date" value={selectedFacilitator.birthdate || ''} />
              </div>

              <div class="flex gap-2 pt-4">
                <Button type="submit" class="flex-1">
                  <Pencil class="w-4 h-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </form>

            <!-- Botão Excluir -->
            <form 
              method="POST" 
              action="?/delete" 
              use:enhance={enhanceWithLoadingAndCallback(closeDrawer)}
            >
              <input type="hidden" name="id" value={selectedFacilitator.id} />
              <Button variant="destructive" type="submit" class="w-full">
                <Trash2 class="w-4 h-4 mr-2" />
                Excluir Facilitador
              </Button>
            </form>
          </div>
        {:else}
          <!-- Modo Criação -->
          <form 
            method="POST" 
            action="?/create" 
            use:enhance={enhanceWithLoadingAndCallback(closeDrawer)}
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
              <label for="create-email" class="text-sm font-medium mb-2 block">Email</label>
              <Input id="create-email" name="email" type="email" placeholder="email@exemplo.com" />
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
              Criar Facilitador
            </Button>
          </form>
        {/if}
      </div>
    </SheetContent>
  </Sheet>
</div>
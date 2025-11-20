<script lang="ts">
  import { enhance } from '$app/forms';
  import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Sheet, SheetContent, SheetHeader, SheetTitle } from '$lib/components/ui/sheet';
  import { Badge } from '$lib/components/ui/badge';
  import { enhanceWithLoadingAndCallback } from '$lib/utils/enhance';
  import { Plus, Pencil, Trash2, User, GraduationCap, Calendar } from 'lucide-svelte';

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('pt-BR');
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'dropped': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  function getStatusText(status: string) {
    switch (status) {
      case 'active': return 'Ativo';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      case 'dropped': return 'Desistente';
      default: return status;
    }
  }
  
  export let data;

  let drawerOpen = false;
  let selectedParticipant: typeof data.participants[0] | null = null;
  let isEditMode = false;

  function openCreateDrawer() {
    console.log('Abrindo drawer de criação');
    selectedParticipant = null;
    isEditMode = false;
    drawerOpen = true;
  }

  function openEditDrawer(participant: typeof data.participants[0]) {
    selectedParticipant = participant;
    isEditMode = true;
    drawerOpen = true;
  }

  function closeDrawer() {
    drawerOpen = false;
    selectedParticipant = null;
    isEditMode = false;
  }
</script>

<div class="container mx-auto p-6 max-w-6xl">
  <!-- Header -->
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="text-3xl font-bold">Participantes</h1>
      <p class="text-muted-foreground mt-1">Gerencie os participantes dos cursos</p>
    </div>
    <button type="button" on:click={openCreateDrawer} class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
      <Plus class="w-4 h-4" />
      Novo Participante
    </button>
  </div>

  <!-- Lista de Participantes -->
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {#each data.participants as participant}
      <button
        type="button"
        on:click={() => openEditDrawer(participant)}
        class="text-left w-full"
      >
        <Card class="hover:shadow-lg transition-shadow cursor-pointer h-full">
          <CardHeader>
            <div class="flex items-start justify-between">
              <div class="flex items-center gap-3 flex-1">
                <div class="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <User class="w-6 h-6 text-primary" />
                </div>
                <div class="flex-1">
                  <h3 class="font-semibold text-lg">{participant.name}</h3>
                  <p class="text-sm text-muted-foreground">{participant.phone}</p>
                </div>
              </div>
              {#if participant.courses && participant.courses.length > 0}
                <Badge variant="secondary" class="ml-2 flex items-center gap-1">
                  <GraduationCap class="w-3 h-3" />
                  {participant.courses.length}
                </Badge>
              {/if}
            </div>
          </CardHeader>
          {#if participant.role || participant.address}
            <CardContent>
              {#if participant.role}
                <p class="text-sm"><span class="font-medium">Função:</span> {participant.role}</p>
              {/if}
              {#if participant.address}
                <p class="text-sm text-muted-foreground truncate">{participant.address}</p>
              {/if}
            </CardContent>
          {/if}
        </Card>
      </button>
    {/each}
  </div>

  {#if data.participants.length === 0}
    <Card class="mt-8">
      <CardContent class="flex flex-col items-center justify-center py-12">
        <User class="w-16 h-16 text-muted-foreground mb-4" />
        <h3 class="text-xl font-semibold mb-2">Nenhum cliente cadastrado</h3>
        <p class="text-muted-foreground mb-4">Comece adicionando seu primeiro cliente</p>
        <button type="button" on:click={openCreateDrawer} class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
          <Plus class="w-4 h-4 mr-2" />
          Adicionar Participante
        </button>
      </CardContent>
    </Card>
  {/if}

  <!-- Drawer -->
  <Sheet bind:open={drawerOpen}>
    <SheetContent side="center" class="w-full sm:max-w-md overflow-y-auto max-h-[90vh]">
      <SheetHeader>
        <SheetTitle>
          {isEditMode ? 'Detalhes do Participante' : 'Novo Participante'}
        </SheetTitle>
      </SheetHeader>

      <div class="mt-6">
        {#if isEditMode && selectedParticipant}
          <!-- Modo Visualização/Edição -->
          <div class="space-y-6">
            <!-- Perfil -->
            <div class="flex items-center gap-4 pb-6 border-b">
              <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <User class="w-8 h-8 text-primary" />
              </div>
              <div>
                <h2 class="text-xl font-semibold">{selectedParticipant.name}</h2>
                <p class="text-muted-foreground">{selectedParticipant.phone}</p>
              </div>
            </div>

            <!-- Cursos Matriculados -->
            <div class="space-y-3">
              <div class="flex items-center gap-2">
                <GraduationCap class="w-5 h-5 text-primary" />
                <h3 class="font-semibold">Cursos Matriculados</h3>
              </div>

              {#if selectedParticipant.courses && selectedParticipant.courses.length > 0}
                <div class="space-y-2">
                  {#each selectedParticipant.courses as enrollment}
                    <div class="p-3 border rounded-lg bg-accent/50">
                      <div class="flex items-center justify-between mb-2">
                        <p class="font-medium">{enrollment.courseName || 'Curso'}</p>
                        <Badge class={getStatusBadge(enrollment.status)}>
                          {getStatusText(enrollment.status)}
                        </Badge>
                      </div>
                      <div class="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar class="w-3 h-3" />
                        <span>Matriculado em: {formatDate(enrollment.enrolledAt)}</span>
                      </div>
                    </div>
                  {/each}
                </div>
              {:else}
                <p class="text-sm text-muted-foreground py-4 text-center">
                  Nenhum curso matriculado ainda
                </p>
              {/if}
            </div>

            <!-- Formulário de Edição -->
            <form method="POST" action="?/update" use:enhance={enhanceWithLoadingAndCallback(closeDrawer)} class="space-y-4">
              <input type="hidden" name="id" value={selectedParticipant.id} />
              
              <div>
                <label for="edit-name" class="text-sm font-bold mb-2 block text-center">Nome</label>
                <Input id="edit-name" name="name" value={selectedParticipant.name} required class="text-center border-none shadow-none opacity-50" />
              </div>

              <div>
                <label for="edit-phone" class="text-sm font-bold mb-2 block text-center">Telefone</label>
                <Input id="edit-phone" name="phone" value={selectedParticipant.phone} required class="text-center border-none shadow-none opacity-50" />
              </div>

              <div>
                <label for="edit-address" class="text-sm font-bold mb-2 block text-center">Endereço</label>
                <Input id="edit-address" name="address" value={selectedParticipant.address || ''} class="text-center border-none shadow-none opacity-50" />
              </div>

              <div>
                <label for="edit-role" class="text-sm font-bold mb-2 block text-center">Função</label>
                <Input id="edit-role" name="role" value={selectedParticipant.role || ''} class="text-center border-none shadow-none opacity-50" />
              </div>

              <div>
                <label for="edit-birthdate" class="text-sm font-bold mb-2 block text-center">Data de Nascimento</label>
                <Input id="edit-birthdate" name="birthdate" type="date" value={selectedParticipant.birthdate || ''} class="text-center border-none shadow-none opacity-50" />
              </div>

              <div class="flex gap-2 pt-4">
                <Button type="submit" class="flex-1">
                  <Pencil class="w-4 h-4 mr-2" />
                  Atualizar
                </Button>
              </div>
            </form>

            <!-- Botão Excluir -->
            <form method="POST" action="?/delete" use:enhance={enhanceWithLoadingAndCallback(closeDrawer)}>
              <input type="hidden" name="id" value={selectedParticipant.id} />
              <Button variant="destructive" type="submit" class="w-full">
                <Trash2 class="w-4 h-4 mr-2" />
                Excluir Participante
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
              <label for="create-name" class="text-sm font-bold mb-2 block text-center">Nome *</label>
              <Input id="create-name" name="name" placeholder="Nome completo" required class="text-center border-none shadow-none opacity-50" />
            </div>

            <div>
              <label for="create-phone" class="text-sm font-bold mb-2 block text-center">Telefone *</label>
              <Input id="create-phone" name="phone" placeholder="(00) 00000-0000" required class="text-center border-none shadow-none opacity-50" />
            </div>

            <div>
              <label for="create-address" class="text-sm font-bold mb-2 block text-center">Endereço</label>
              <Input id="create-address" name="address" placeholder="Endereço completo" class="text-center border-none shadow-none opacity-50" />
            </div>

            <div>
              <label for="create-role" class="text-sm font-bold mb-2 block text-center">Função</label>
              <Input id="create-role" name="role" placeholder="Cargo ou função" class="text-center border-none shadow-none opacity-50" />
            </div>

            <div>
              <label for="create-birthdate" class="text-sm font-bold mb-2 block text-center">Data de Nascimento</label>
              <Input id="create-birthdate" name="birthdate" type="date" class="text-center border-none shadow-none opacity-50" />
            </div>

            <div class="flex justify-center pt-4">
              <Button type="submit" class="w-full md:w-1/2">
                <Plus class="w-4 h-4 mr-2" />
                Criar Participante
              </Button>
            </div>
          </form>
        {/if}
      </div>
    </SheetContent>
  </Sheet>
</div>
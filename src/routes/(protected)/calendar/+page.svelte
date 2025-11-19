<script lang="ts">
  import { enhance } from '$app/forms';
  import { Card, CardHeader, CardContent } from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Sheet, SheetContent, SheetHeader, SheetTitle } from '$lib/components/ui/sheet';
  import { enhanceWithLoadingAndCallback } from '$lib/utils/enhance';
  import { Plus, Pencil, Trash2, Calendar as CalendarIcon, Clock, User, MapPin, Mail, Phone } from 'lucide-svelte';
  import { Switch } from '$lib/components/ui/switch';

  let { data } = $props();

  let drawerOpen = $state(false);

  // Estados do formulário (apenas para criação)
  let selectedDateString = $state('');
  let name = $state('');
  let email = $state('');
  let phone = $state('');
  let reason = $state('');
  let startTime = $state('');
  let endTime = $state('');
  let isSignedUp = $state(false);
  let selectedParticipantId = $state<number | null>(null);
  let selectedFacilitatorId = $state<number | null>(null);
  let selectedRoomId = $state<number | null>(null);

  // Busca de participantes
  let participantSearchTerm = $state('');
  let searchResults = $state<Array<{id: number, name: string}>>([]);
  let showParticipantDropdown = $state(false);

  function openCreateDrawer() {
    resetForm();
    drawerOpen = true;
  }

  function closeDrawer() {
    drawerOpen = false;
    resetForm();
  }

  function resetForm() {
    selectedDateString = '';
    name = '';
    email = '';
    phone = '';
    reason = '';
    startTime = '';
    endTime = '';
    isSignedUp = false;
    selectedParticipantId = null;
    selectedFacilitatorId = null;
    selectedRoomId = null;
    participantSearchTerm = '';
    searchResults = [];
    showParticipantDropdown = false;
  }

  function formatDateTime(dateTimeStr: string) {
    const date = new Date(dateTimeStr);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function searchParticipants() {
    if (participantSearchTerm.length < 2) {
      searchResults = [];
      showParticipantDropdown = false;
      return;
    }

    const filteredParticipants = data.participants?.filter(p =>
      p.name.toLowerCase().includes(participantSearchTerm.toLowerCase())
    ) || [];

    searchResults = filteredParticipants.slice(0, 10);
    showParticipantDropdown = searchResults.length > 0;
  }

  function selectParticipant(participant: {id: number, name: string}) {
    selectedParticipantId = participant.id;
    participantSearchTerm = participant.name;
    name = participant.name;
    displayName = participant.name;
    showParticipantDropdown = false;
    searchResults = [];
  }

  // Watcher para limpar dados quando desmarca isSignedUp
  $effect(() => {
    if (!isSignedUp) {
      selectedParticipantId = null;
      searchResults = [];
      showParticipantDropdown = false;
      participantSearchTerm = '';
    }
  });

  // Sincronizar participantSearchTerm com name quando isSignedUp é true
  $effect(() => {
    if (isSignedUp && participantSearchTerm) {
      searchParticipants();
    }
  });

  // Computed value para o campo nome que sempre está sincronizado
  let displayName = $state('');

  // Sincroniza displayName com a fonte correta baseado em isSignedUp
  $effect(() => {
    displayName = isSignedUp ? participantSearchTerm : name;
  });

  // Sincroniza de volta quando o usuário digita
  function handleNameInput(value: string) {
    displayName = value;
    if (isSignedUp) {
      participantSearchTerm = value;
      searchParticipants();
    } else {
      name = value;
    }
  }
</script>

<div class="container mx-auto p-6 max-w-7xl">
  <!-- Header -->
  <div class="flex items-center justify-between mb-8">
    <div>
      <h1 class="text-3xl font-bold">Agendamentos</h1>
      <p class="text-muted-foreground mt-1">Gerencie os agendamentos de visitas</p>
    </div>
    <button
      type="button"
      onclick={openCreateDrawer}
      class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
    >
      <Plus class="w-4 h-4" />
      Novo Agendamento
    </button>
  </div>

  <!-- Lista de Agendamentos -->
  <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
    {#each data.appointments as appointment}
      <Card class="hover:shadow-lg transition-shadow h-full flex flex-col">
        <CardHeader>
          <div class="flex items-start justify-between">
            <div class="flex-1">
              <h3 class="font-semibold text-lg">{appointment.name}</h3>
              <div class="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <CalendarIcon class="w-4 h-4" />
                <span>{formatDateTime(appointment.dateTime)}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent class="space-y-2 flex-1">
          {#if appointment.reason}
            <div class="flex items-start gap-2 text-sm">
              <CalendarIcon class="w-4 h-4 text-muted-foreground mt-0.5" />
              <span class="flex-1">{appointment.reason}</span>
            </div>
          {/if}
          {#if appointment.facilitatorName}
            <div class="flex items-center gap-2 text-sm">
              <User class="w-4 h-4 text-muted-foreground" />
              <span>Facilitador: {appointment.facilitatorName}</span>
            </div>
          {/if}
          {#if appointment.roomName}
            <div class="flex items-center gap-2 text-sm">
              <MapPin class="w-4 h-4 text-muted-foreground" />
              <span>Sala: {appointment.roomName}</span>
            </div>
          {/if}
          {#if appointment.email}
            <div class="flex items-center gap-2 text-sm">
              <Mail class="w-4 h-4 text-muted-foreground" />
              <span>{appointment.email}</span>
            </div>
          {/if}
          {#if appointment.phone}
            <div class="flex items-center gap-2 text-sm">
              <Phone class="w-4 h-4 text-muted-foreground" />
              <span>{appointment.phone}</span>
            </div>
          {/if}
          {#if appointment.endTime}
            <div class="flex items-center gap-2 text-sm">
              <Clock class="w-4 h-4 text-muted-foreground" />
              <span>Término: {appointment.endTime}</span>
            </div>
          {/if}
        </CardContent>

        <!-- Botões de Ação -->
        <div class="px-6 pb-4 flex gap-2">
          <a href="/calendar/{appointment.id}/edit" class="flex-1">
            <Button
              variant="outline"
              size="sm"
              class="w-full"
            >
              <Pencil class="w-4 h-4 mr-1" />
              Editar
            </Button>
          </a>
          <Button
            variant="destructive"
            size="sm"
            class="flex-1"
            onclick={async () => {
              if (!confirm('Tem certeza que deseja excluir este agendamento?')) {
                return;
              }

              try {
                const formData = new FormData();
                formData.append('id', String(appointment.id));

                const response = await fetch('?/delete', {
                  method: 'POST',
                  body: formData
                });

                if (response.ok) {
                  window.location.reload();
                }
              } catch (error) {
                console.error('Error deleting appointment:', error);
              }
            }}
          >
            <Trash2 class="w-4 h-4 mr-1" />
            Excluir
          </Button>
        </div>
      </Card>
    {/each}
  </div>

  {#if data.appointments.length === 0}
    <Card class="mt-8">
      <CardContent class="flex flex-col items-center justify-center py-12">
        <CalendarIcon class="w-16 h-16 text-muted-foreground mb-4" />
        <h3 class="text-xl font-semibold mb-2">Nenhum agendamento cadastrado</h3>
        <p class="text-muted-foreground mb-4">Comece adicionando seu primeiro agendamento</p>
        <button
          type="button"
          onclick={openCreateDrawer}
          class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
        >
          <Plus class="w-4 h-4 mr-2" />
          Adicionar Agendamento
        </button>
      </CardContent>
    </Card>
  {/if}

  <!-- Drawer -->
  <Sheet bind:open={drawerOpen}>
    <SheetContent class="w-full sm:max-w-4xl overflow-y-auto">
      <SheetHeader>
        <SheetTitle>Novo Agendamento</SheetTitle>
      </SheetHeader>

      <div class="mt-6">
        <form
          method="POST"
          action="?/create"
          use:enhance={enhanceWithLoadingAndCallback(closeDrawer)}
          class="space-y-6"
        >

          <div class="flex flex-col lg:flex-row gap-6">
            <!-- Lado Esquerdo: Seleção de Data -->
            <div class="lg:w-1/2">
              <label for="dateInput" class="text-sm font-medium mb-2 block">Data da Visita *</label>

              <!-- Input date -->
              <Input
                id="dateInput"
                type="date"
                bind:value={selectedDateString}
                name="date"
                required
              />

              <!-- TODO: Adicionar calendário visual quando o tipo estiver correto -->
              <!-- Calendário visual comentado temporariamente
              <div class="border rounded-md p-2 mt-4">
                <Calendar
                  bind:value={selectedDate}
                  locale="pt-BR"
                />
              </div>
              -->
            </div>

            <!-- Lado Direito: Formulário -->
            <div class="lg:w-1/2 space-y-4">
              <!-- Horário de Início -->
              <div>
                <label for="startTime" class="text-sm font-medium mb-2 block">Horário de Início *</label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  bind:value={startTime}
                  required
                />
              </div>

              <!-- Horário de Finalização -->
              <div>
                <label for="endTime" class="text-sm font-medium mb-2 block">Horário de Finalização</label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  bind:value={endTime}
                />
              </div>

              <!-- Nome e Checkbox de Usuário Cadastrado -->
              <div>
                <label for="name" class="text-sm font-medium mb-2 block">Nome *</label>
                <div class="flex gap-2 items-start">
                  <div class="flex-1 relative">
                    <Input
                      id="name"
                      name="name"
                      bind:value={displayName}
                      placeholder="Digite o nome"
                      oninput={(e) => {
                        const target = e.target as HTMLInputElement;
                        handleNameInput(target.value);
                      }}
                      required
                    />
                    <!-- Dropdown de Participantes -->
                    {#if isSignedUp && showParticipantDropdown && searchResults.length > 0}
                      <div class="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                        {#each searchResults as participant}
                          <button
                            type="button"
                            class="w-full px-4 py-2 text-left hover:bg-accent transition-colors"
                            onclick={() => selectParticipant(participant)}
                          >
                            {participant.name}
                          </button>
                        {/each}
                      </div>
                    {/if}
                  </div>

                  <div class="flex items-center gap-2 pt-2">
                    <Switch bind:checked={isSignedUp} />
                    <label class="text-sm whitespace-nowrap">Usuário já cadastrado</label>
                  </div>
                </div>
                <input type="hidden" name="isSignedUp" value={String(isSignedUp)} />
                <input type="hidden" name="participantId" value={selectedParticipantId || ''} />
              </div>

              <!-- Email (apenas se não for usuário cadastrado) -->
              {#if !isSignedUp}
                <div>
                  <label for="email" class="text-sm font-medium mb-2 block">Email</label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    bind:value={email}
                    placeholder="email@exemplo.com"
                  />
                </div>

                <!-- Telefone (apenas se não for usuário cadastrado) -->
                <div>
                  <label for="phone" class="text-sm font-medium mb-2 block">Telefone</label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    bind:value={phone}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              {/if}

              <!-- Motivo -->
              <div>
                <label for="reason" class="text-sm font-medium mb-2 block">Motivo da Visita</label>
                <Input
                  id="reason"
                  name="reason"
                  bind:value={reason}
                  placeholder="Descreva o motivo da visita"
                />
              </div>

              <!-- Dropdown de Facilitador -->
              <div>
                <label for="facilitatorId" class="text-sm font-medium mb-2 block">Facilitador</label>
                <select
                  id="facilitatorId"
                  name="facilitatorId"
                  bind:value={selectedFacilitatorId}
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecione um facilitador</option>
                  {#each data.facilitators as facilitator}
                    <option value={facilitator.id}>{facilitator.name}</option>
                  {/each}
                </select>
              </div>

              <!-- Dropdown de Sala -->
              <div>
                <label for="roomId" class="text-sm font-medium mb-2 block">Sala</label>
                <select
                  id="roomId"
                  name="roomId"
                  bind:value={selectedRoomId}
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecione uma sala</option>
                  {#each data.rooms as room}
                    <option value={room.id}>{room.name} (Sala {room.number})</option>
                  {/each}
                </select>
              </div>

              <!-- Botões de Ação -->
              <div class="flex gap-2 pt-4">
                <Button type="submit" class="flex-1">
                  <Plus class="w-4 h-4 mr-2" />
                  Criar Agendamento
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </SheetContent>
  </Sheet>
</div>

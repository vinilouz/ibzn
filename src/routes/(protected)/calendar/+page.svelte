<script lang="ts">
	import { enhance } from '$app/forms';
	import { Card, CardHeader, CardContent, CardTitle } from '$lib/components/ui/card';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Label } from '$lib/components/ui/label';
	import { Sheet, SheetContent, SheetHeader, SheetTitle } from '$lib/components/ui/sheet';
	import { enhanceWithLoadingAndCallback } from '$lib/utils/enhance';
	import { showLoading, hideLoading } from '$lib/stores/loading';
	import { invalidateAll } from '$app/navigation';
  import { Plus, Pencil, Trash2, Calendar as CalendarIcon, Search } from 'lucide-svelte';
  import { Switch } from '$lib/components/ui/switch';
  import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
  } from '$lib/components/ui/table';
  import Pagination from '$lib/components/Pagination.svelte';

  let { data } = $props();

  let drawerOpen = $state(false);
  let currentPage = $state(1);
  const itemsPerPage = 10;
  let searchTerm = $state('');
  let showSignedUp = $state(false);
  let filterDate = $state('');
  let filterRoomId = $state<number | null>(null);

  let selectedDateString = $state('');
  let formName = $state('');
  let email = $state('');
  let phone = $state('');
  let reason = $state('');

  $effect(() => void formName);
  let startTime = $state('');
  let endTime = $state('');
  let isSignedUp = $state(false);
  let selectedParticipantId = $state<number | null>(null);
  let selectedFacilitatorId = $state<number | null>(null);
  let selectedRoomId = $state<number | null>(null);

  let participantSearchTerm = $state('');
  let searchResults = $state<Array<{id: number, name: string}>>([]);
  let showParticipantDropdown = $state(false);
  let searchTimeout: ReturnType<typeof setTimeout> | null = null;

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
    formName = '';
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

  function formatDate(dateTimeStr: string) {
    const date = new Date(dateTimeStr);
    return date.toLocaleDateString('pt-BR');
  }

  function formatTime(dateTimeStr: string) {
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
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
    formName = participant.name;
    displayName = participant.name;
    showParticipantDropdown = false;
    searchResults = [];
  }

  $effect(() => {
    if (!isSignedUp) {
      selectedParticipantId = null;
      searchResults = [];
      showParticipantDropdown = false;
      participantSearchTerm = '';
    }
  });

  let displayName = $state('');

  function handleNameInput(value: string) {
    displayName = value;
    if (isSignedUp) {
      participantSearchTerm = value;
      // Debounce the search to prevent freezing
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      searchTimeout = setTimeout(() => {
        searchParticipants();
      }, 300);
    } else {
      formName = value;
    }
  }

  const filteredAppointments = $derived.by(() => {
    const appointments = data.appointments || [];

    return appointments.filter(appointment => {
      // Filtro por tipo (cadastrado ou não)
      const signedUpMatch = appointment.isSignedUp === showSignedUp;

      // Filtro por nome
      const nameMatch = !searchTerm.trim() || 
        appointment.name.toLowerCase().includes(searchTerm.toLowerCase());

      // Filtro por data
      let dateMatch = true;
      if (filterDate) {
        const appointmentDate = new Date(appointment.dateTime).toISOString().split('T')[0];
        dateMatch = appointmentDate === filterDate;
      }

      // Filtro por sala
      const roomMatch = !filterRoomId || appointment.roomId === filterRoomId;

      return signedUpMatch && nameMatch && dateMatch && roomMatch;
    });
  });

  const paginatedAppointments = $derived.by(() => {
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredAppointments.slice(start, end);
  });

  let prevSearchTerm = '';
  let prevShowSignedUp = false;
  let prevFilterDate = '';
  let prevFilterRoomId: number | null = null;
  $effect(() => {
    if (searchTerm !== prevSearchTerm || 
        showSignedUp !== prevShowSignedUp || 
        filterDate !== prevFilterDate ||
        filterRoomId !== prevFilterRoomId) {
      currentPage = 1;
      prevSearchTerm = searchTerm;
      prevShowSignedUp = showSignedUp;
      prevFilterDate = filterDate;
      prevFilterRoomId = filterRoomId;
    }
  });
</script>

<div class="container mx-auto p-6 max-w-7xl">
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

  <Card>
    <CardHeader>
      <CardTitle>
        Agendamentos ({data.appointments?.length || 0})
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div class="mb-4 space-y-3">
        <!-- Primeira linha: Nome e Switch -->
        <div class="flex gap-2">
          <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por nome..."
              bind:value={searchTerm}
              class="pl-10"
            />
          </div>
          <div class="flex items-center gap-2 px-3 h-10 rounded-md border border-input bg-background">
            <Switch bind:checked={showSignedUp} />
            <Label class="text-sm cursor-pointer whitespace-nowrap">
              {showSignedUp ? 'Cadastrado' : 'Não Cadastrado'}
            </Label>
          </div>
        </div>

        <!-- Segunda linha: Data e Sala -->
        <div class="flex gap-2">
          <div class="flex-1">
            <Input
              type="date"
              placeholder="Filtrar por data"
              bind:value={filterDate}
            />
          </div>
          <div class="flex-1">
            <select
              bind:value={filterRoomId}
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value={null}>Todas as salas</option>
              {#each data.rooms as room}
                <option value={room.id}>{room.name} (Sala {room.number})</option>
              {/each}
            </select>
          </div>
          {#if filterDate || filterRoomId}
            <Button
              variant="outline"
              size="sm"
              onclick={() => {
                filterDate = '';
                filterRoomId = null;
              }}
            >
              Limpar
            </Button>
          {/if}
        </div>
      </div>

      {#if filteredAppointments.length === 0 && searchTerm}
        <p class="text-sm text-muted-foreground text-center py-8">
          Nenhum agendamento encontrado com nome "{searchTerm}"
        </p>
      {:else if paginatedAppointments && paginatedAppointments.length > 0}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Horário</TableHead>
              <TableHead>Facilitador</TableHead>
              <TableHead>Sala</TableHead>
              <TableHead>Contato</TableHead>
              <TableHead>Motivo</TableHead>
              <TableHead class="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {#each paginatedAppointments as appointment}
              <TableRow>
                <TableCell class="font-medium">{appointment.id}</TableCell>
                <TableCell>{appointment.name}</TableCell>
                <TableCell>{formatDate(appointment.dateTime)}</TableCell>
                <TableCell>
                  {formatTime(appointment.dateTime)}
                  {#if appointment.endTime}
                    - {appointment.endTime}
                  {/if}
                </TableCell>
                <TableCell>{appointment.facilitatorName || '-'}</TableCell>
                <TableCell>{appointment.roomName || '-'}</TableCell>
                <TableCell class="max-w-xs">
                  <div class="text-sm">
                    {#if appointment.email}
                      <div class="truncate">{appointment.email}</div>
                    {/if}
                    {#if appointment.phone}
                      <div class="truncate">{appointment.phone}</div>
                    {/if}
                    {#if !appointment.email && !appointment.phone}
                      -
                    {/if}
                  </div>
                </TableCell>
                <TableCell class="max-w-xs truncate">{appointment.reason || '-'}</TableCell>
                <TableCell class="text-right">
                  <div class="flex gap-2 justify-end">
                    <a href="/calendar/{appointment.id}/edit">
                      <Button variant="outline" size="sm">
                        <Pencil class="w-4 h-4" />
                      </Button>
                    </a>
                    <Button
                      variant="destructive"
                      size="sm"
                      onclick={async () => {
                        if (!confirm('Tem certeza que deseja excluir este agendamento?')) {
                          return;
                        }

                        showLoading('Excluindo agendamento...');

                        try {
                          const formData = new FormData();
                          formData.append('id', String(appointment.id));

                          const response = await fetch('?/delete', {
                            method: 'POST',
                            body: formData
                          });

                          if (response.ok) {
                            await invalidateAll();
                          } else {
                            alert('Erro ao excluir agendamento');
                          }
                        } catch (error) {
                          console.error('Error deleting appointment:', error);
                          alert('Erro ao excluir agendamento');
                        } finally {
                          hideLoading();
                        }
                      }}
                    >
                      <Trash2 class="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            {/each}
          </TableBody>
        </Table>
        <Pagination
          bind:currentPage
          totalItems={filteredAppointments.length}
          {itemsPerPage}
          onPageChange={() => {}}
        />
      {:else if !searchTerm}
        <div class="py-12 text-center text-muted-foreground">
          <CalendarIcon class="mx-auto h-12 w-12 mb-4" />
          <p class="text-lg font-medium">Nenhum agendamento cadastrado</p>
          <p class="text-sm mb-4">Comece adicionando seu primeiro agendamento</p>
          <button
            type="button"
            onclick={openCreateDrawer}
            class="inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          >
            <Plus class="w-4 h-4 mr-2" />
            Adicionar Agendamento
          </button>
        </div>
      {/if}
    </CardContent>
  </Card>

  <Sheet bind:open={drawerOpen}>
    <SheetContent side="center" class="w-full sm:max-w-4xl overflow-y-auto max-h-[90vh]">
      <SheetHeader>
        <SheetTitle>Novo Agendamento</SheetTitle>
      </SheetHeader>

      <div class="mt-6">
        <form
          method="POST"
          action="?/create"
          use:enhance={enhanceWithLoadingAndCallback({
            loadingMessage: 'Criando agendamento...',
            onSuccess: closeDrawer
          })}
          class="space-y-6"
        >

          <div class="grid gap-4 py-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label for="dateInput" class="text-sm font-bold mb-2 block text-center">Data da Visita *</label>
                <Input
                  id="dateInput"
                  type="date"
                  bind:value={selectedDateString}
                  name="date"
                  class="text-center opacity-50"
                  required
                />
              </div>
              <div>
                <label for="startTime" class="text-sm font-bold mb-2 block text-center">Horário de Início *</label>
                <Input
                  id="startTime"
                  name="startTime"
                  type="time"
                  bind:value={startTime}
                  class="text-center opacity-50"
                  required
                />
              </div>
              <div>
                <label for="endTime" class="text-sm font-bold mb-2 block text-center">Horário de Finalização</label>
                <Input
                  id="endTime"
                  name="endTime"
                  type="time"
                  class="text-center opacity-50"
                  bind:value={endTime}
                />
              </div>
            </div>

            <div>
                <label for="name" class="text-sm font-bold mb-2 block text-center">Nome *</label>
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
                      class="text-center opacity-50"
                      required
                    />
                    {#if isSignedUp && showParticipantDropdown && searchResults.length > 0}
                      <div class="absolute z-50 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
                        {#each searchResults as participant}
                          <button
                            type="button"
                            class="w-full px-4 py-2 text-left hover:bg-accent transition-colors text-gray-900 font-medium"
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
                    <span class="text-sm whitespace-nowrap">Usuário já cadastrado</span>
                  </div>
                </div>
                <input type="hidden" name="isSignedUp" value={String(isSignedUp)} />
                <input type="hidden" name="participantId" value={selectedParticipantId || ''} />
            </div>

            {#if !isSignedUp}
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label for="email" class="text-sm font-bold mb-2 block text-center">Email</label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    bind:value={email}
                    placeholder="email@exemplo.com"
                    class="text-center opacity-50"
                  />
                </div>
                <div>
                  <label for="phone" class="text-sm font-bold mb-2 block text-center">Telefone</label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    bind:value={phone}
                    placeholder="(00) 00000-0000"
                    class="text-center opacity-50"
                  />
                </div>
              </div>
            {/if}

            <div>
                <label for="reason" class="text-sm font-bold mb-2 block text-center">Motivo da Visita</label>
                <Input
                  id="reason"
                  name="reason"
                  bind:value={reason}
                  placeholder="Descreva o motivo da visita"
                  class="text-center opacity-50"
                />
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label for="facilitatorId" class="text-sm font-bold mb-2 block text-center">Facilitador</label>
                <select
                  id="facilitatorId"
                  name="facilitatorId"
                  bind:value={selectedFacilitatorId}
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-center opacity-50"
                >
                  <option value="">Selecione um facilitador</option>
                  {#each data.facilitators as facilitator}
                    <option value={facilitator.id}>{facilitator.name}</option>
                  {/each}
                </select>
              </div>
              <div>
                <label for="roomId" class="text-sm font-bold mb-2 block text-center">Sala</label>
                <select
                  id="roomId"
                  name="roomId"
                  bind:value={selectedRoomId}
                  class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 text-center opacity-50"
                >
                  <option value="">Selecione uma sala</option>
                  {#each data.rooms as room}
                    <option value={room.id}>{room.name} (Sala {room.number})</option>
                  {/each}
                </select>
              </div>
            </div>

            <div class="flex gap-2 pt-4 justify-center">
              <Button type="submit" class="w-full md:w-1/2">
                <Plus class="w-4 h-4 mr-2" />
                Criar Agendamento
              </Button>
            </div>
          </div>
        </form>
      </div>
    </SheetContent>
  </Sheet>
</div>

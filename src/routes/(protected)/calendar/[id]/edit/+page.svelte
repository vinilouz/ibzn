<script lang="ts">
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Card, CardContent } from '$lib/components/ui/card';
  import { Switch } from '$lib/components/ui/switch';
  import { ArrowLeft, Save, Trash2 } from 'lucide-svelte';

  let { data } = $props();

  // Estados do formulário
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
  let displayName = $state('');
  let initialized = $state(false);

  // Inicializar formulário com dados do agendamento (apenas uma vez)
  $effect(() => {
    if (data.appointment && !initialized) {
      initialized = true;
      const time = new Date(data.appointment.dateTime);
      selectedDateString = time.toISOString().split('T')[0];

      name = data.appointment.name;
      email = data.appointment.email || '';
      phone = data.appointment.phone || '';
      reason = data.appointment.reason || '';

      startTime = time.toTimeString().slice(0, 5);
      endTime = data.appointment.endTime || '';

      isSignedUp = data.appointment.isSignedUp;
      selectedParticipantId = data.appointment.participantId;
      selectedFacilitatorId = data.appointment.facilitatorId;
      selectedRoomId = data.appointment.roomId;

      if (isSignedUp && data.appointment.participantName) {
        participantSearchTerm = data.appointment.participantName;
        displayName = data.appointment.participantName;
      } else {
        displayName = data.appointment.name;
      }
    }
  });

  // Sincroniza displayName com a fonte correta baseado em isSignedUp
  $effect(() => {
    displayName = isSignedUp ? participantSearchTerm : name;
  });

  // Watcher para limpar dados quando desmarca isSignedUp
  $effect(() => {
    if (!isSignedUp) {
      selectedParticipantId = null;
      searchResults = [];
      showParticipantDropdown = false;
      participantSearchTerm = '';
    }
  });

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
    displayName = participant.name;
    showParticipantDropdown = false;
  }

  function handleNameInput(value: string) {
    displayName = value;
    if (isSignedUp) {
      participantSearchTerm = value;
      searchParticipants();
    } else {
      name = value;
    }
  }

  async function handleUpdate(e: SubmitEvent) {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    try {
      const response = await fetch('?/update', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        goto('/calendar');
      }
    } catch (error) {
      console.error('Error updating appointment:', error);
    }
  }

  async function handleDelete() {
    if (!confirm('Tem certeza que deseja excluir este agendamento?')) {
      return;
    }

    try {
      const formData = new FormData();
      formData.append('id', String(data.appointment.id));

      const response = await fetch('?/delete', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        goto('/calendar');
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  }
</script>

<div class="container mx-auto p-6 max-w-5xl">
  <!-- Header -->
  <div class="mb-6">
    <a href="/calendar" class="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4">
      <ArrowLeft class="w-4 h-4 mr-1" />
      Voltar para Agendamentos
    </a>
    <h1 class="text-3xl font-bold">Editar Agendamento</h1>
    <p class="text-muted-foreground mt-1">Atualize as informações do agendamento</p>
  </div>

  <!-- Formulário -->
  <Card>
    <CardContent class="pt-6">
      <form
        method="POST"
        onsubmit={handleUpdate}
        class="space-y-6"
      >
        <div class="grid md:grid-cols-2 gap-6">
          <!-- Data da Visita -->
          <div>
            <label for="dateInput" class="text-sm font-medium mb-2 block">Data da Visita *</label>
            <Input
              id="dateInput"
              type="date"
              bind:value={selectedDateString}
              name="date"
              required
            />
          </div>

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
          <div class="md:col-span-2">
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
          <div class="md:col-span-2">
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
        </div>

        <!-- Botões de Ação -->
        <div class="flex gap-2 pt-4">
          <Button type="submit" class="flex-1">
            <Save class="w-4 h-4 mr-2" />
            Salvar Alterações
          </Button>
          <a href="/calendar" class="flex-1">
            <Button type="button" variant="outline" class="w-full">
              Cancelar
            </Button>
          </a>
        </div>
      </form>
    </CardContent>
  </Card>

  <!-- Botão Excluir -->
  <Card class="mt-4 border-destructive">
    <CardContent class="pt-6">
      <h3 class="text-lg font-semibold mb-2 text-destructive">Zona de Perigo</h3>
      <p class="text-sm text-muted-foreground mb-4">
        Esta ação é irreversível. O agendamento será permanentemente excluído.
      </p>
      <Button
        type="button"
        variant="destructive"
        onclick={handleDelete}
      >
        <Trash2 class="w-4 h-4 mr-2" />
        Excluir Agendamento
      </Button>
    </CardContent>
  </Card>
</div>

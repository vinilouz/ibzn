<script lang="ts">
  import { enhance } from '$app/forms';
  export let data;
  let teachers = data.teachers ?? [];
  let form = { name: '', email: '', phone: '' };
</script>

<h1 class="text-2xl font-bold mb-4">Teachers</h1>

<ul class="space-y-6 mb-8">
  {#each teachers as t}
    <li class="border rounded-lg p-4 shadow-sm bg-white">
      <div class="mb-2 font-semibold">{t.id} — {t.name} — {t.email} — {t.phone}</div>
      <form method="POST" use:enhance class="inline-block mr-2">
        <input type="hidden" name="id" value={t.id} />
        <button name="delete" class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">Apagar</button>
      </form>

      <!-- pequeno formulário de edição inline -->
      <form method="POST" use:enhance class="inline-block space-x-2">
        <input type="hidden" name="id" value={t.id} />
        <input name="name" placeholder="name" value={t.name} class="border rounded px-2 py-1" />
        <input name="email" placeholder="email" value={t.email} class="border rounded px-2 py-1" />
        <input name="phone" placeholder="phone" value={t.phone} class="border rounded px-2 py-1" />
        <button type ="submit" name="update" class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Atualizar</button>
      </form>
    </li>
  {/each}
</ul>

<h2 class="text-xl font-semibold mb-2">Criar novo</h2>
<form method="POST" use:enhance class="space-y-2 flex flex-col max-w-md">
  <input name="name" bind:value={form.name} placeholder="name" required class="border rounded px-2 py-1" />
  <input name="email" bind:value={form.email} placeholder="email" required class="border rounded px-2 py-1" />
  <input name="phone" bind:value={form.phone} placeholder="phone" required class="border rounded px-2 py-1" />
    <input name="role" placeholder="role" class="border rounded px-2 py-1" />
    <input name="birthdate" placeholder="birthdate" type="date" class="border rounded px-2 py-1" />
  <button type="submit" name="create" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Criar</button>
</form>
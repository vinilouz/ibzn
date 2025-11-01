<script lang="ts">
  import { enhance } from '$app/forms';
  export let data;
  let customers = data.customers ?? [];
  let form = { name: '', phone: '', address: '', birthdate: '', role: '' };

</script>

<h1 class="text-2xl font-bold mb-4">Customers</h1>

<ul class="space-y-6 mb-8">
  {#each customers as c}
    <li class="border rounded-lg p-4 shadow-sm bg-white">
      <div class="mb-2 font-semibold">{c.id} — {c.name} — {c.phone}</div>
      <form method="POST" use:enhance class="inline-block mr-2">
        <input type="hidden" name="id" value={c.id} />
        <button name="delete" class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600">Apagar</button>
      </form>

      <!-- pequeno formulário de edição inline -->
      <form method="POST" use:enhance class="inline-block space-x-2">
        <input type="hidden" name="id" value={c.id} />
        <input name="name" placeholder="name" value={c.name} class="border rounded px-2 py-1" />
        <input name="phone" placeholder="phone" value={c.phone} class="border rounded px-2 py-1" />
        <button name="update" class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600">Atualizar</button>
      </form>
    </li>
  {/each}
</ul>

<h2 class="text-xl font-semibold mb-2">Criar novo</h2>
<form method="POST" use:enhance class="space-y-2 flex flex-col max-w-md">
  <input name="name" bind:value={form.name} placeholder="name" required class="border rounded px-2 py-1" />
  <input name="phone" bind:value={form.phone} placeholder="phone" required class="border rounded px-2 py-1" />
  <input name="address" bind:value={form.address} placeholder="address" class="border rounded px-2 py-1" />
  <input name="birthdate" type="date" bind:value={form.birthdate} class="border rounded px-2 py-1" />
  <input name="role" bind:value={form.role} placeholder="role" class="border rounded px-2 py-1" />
  <button name="create" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Criar</button>
</form>
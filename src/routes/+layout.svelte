<script lang="ts">
  import '../app.css';
  
  import { Button } from '$lib/components/ui/button';
</script>

<header class="bg-gray-100 p-4 flex gap-4 justify-center">
  
  <Button href="/facilitators" variant="outline">Facilitadores</Button>
  <Button href="/" variant="outline">Home</Button>
  <Button href="/customers" variant="outline">Clientes</Button>
</header>

<main class="p-8">
  <slot />
</main>
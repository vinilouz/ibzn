<script lang="ts">
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { FieldGroup, Field, FieldLabel, FieldDescription } from "$lib/components/ui/field/index.js";
  import { authClient } from "$lib/auth-client";
  import { goto } from "$app/navigation";

  let email = $state("");
  let password = $state("");
  let error = $state("");
  let loading = $state(false);

  const handleSignIn = async (e: Event) => {
    e.preventDefault();
    loading = true;
    error = "";

    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });

      if (result.error) {
        error = result.error.message || "Dados inválidos";
      } else {

        await goto("/dashboard");
      }
    } catch (err: any) {
      error = err.message || "Algo deu errado";
    } finally {
      loading = false;
    }
  };
</script>

<Card.Root class="mx-auto w-full max-w-sm">
  <Card.Header>
    <Card.Title class="text-2xl">Login</Card.Title>
    <Card.Description>Digite seu email e sua senha para logar</Card.Description>
  </Card.Header>
  <Card.Content>
    <form onsubmit={handleSignIn}>
      <FieldGroup>
        {#if error}
          <div class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        {/if}

        <Field>
          <FieldLabel for="email">Email</FieldLabel>
          <Input 
            id="email" 
            type="email" 
            placeholder="m@example.com" 
            required 
            bind:value={email}
            disabled={loading}
          />
        </Field>

        <Field>
          <div class="flex items-center">
            <FieldLabel for="password">Password</FieldLabel>
          </div>
          <Input 
            id="password" 
            type="password" 
            required 
            bind:value={password}
            disabled={loading}
          />
        </Field>

        <Field>
          <Button type="submit" class="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>

          

          <FieldDescription class="text-center">
            IBZN - Instituto Brasa Zona Norte
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  </Card.Content>
</Card.Root>
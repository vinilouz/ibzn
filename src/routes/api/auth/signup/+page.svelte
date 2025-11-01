<script lang="ts">
	import type { HTMLAttributes } from "svelte/elements";
	import {
		FieldGroup,
		Field,
		FieldLabel,
		FieldDescription,
	} from "$lib/components/ui/field/index.js";
	import { Input } from "$lib/components/ui/input/index.js";
	import { Button } from "$lib/components/ui/button/index.js";
	import { cn, type WithElementRef } from "$lib/utils.js";

	let {
		ref = $bindable(null),
		class: className,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> = $props();

	const id = $props.id();
</script>

<div class="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
	<div class="w-full max-w-sm">
        <div class={cn("flex flex-col gap-6", className)} bind:this={ref} {...restProps}>
            <form>
                <FieldGroup>
                    <div class="flex flex-col items-center gap-2 text-center">
                        <h1 class="text-xl font-bold">Novo usuário</h1>
                    </div>
                    <Field>
                        <FieldLabel for="username-{id}">Criar usuário</FieldLabel>
                        <Input id="username-{id}" type="text" placeholder="Digite seu nome de usuário" required />
                    </Field>
                    <Field>
                        <FieldLabel for="password-{id}">Criar senha</FieldLabel>
                        <Input id="password-{id}" type="password" placeholder="Digite sua senha" required />
                    </Field>
                    <Field>
                        <FieldLabel for="confirm-password-{id}">Confirmar senha</FieldLabel>
                        <Input id="confirm-password-{id}" type="password" placeholder="Confirme sua senha" required />
                    </Field>
                    <Field>
                        <Button type="submit">Cadastrar</Button>
                    </Field>
                </FieldGroup>
            </form>
        </div>
    </div>
</div>
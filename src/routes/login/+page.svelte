<script lang="ts">
	import LoginForm from '$lib/components/login-form.svelte';
</script>
	<div class="grid min-h-screen lg:grid-cols-2">
		<div class="flex flex-col gap-4 p-6 md:p-10">
			<div class="flex justify-center gap-2">
				<a href="/" class="flex items-center gap-2 text-lg font-medium">
					<!-- <div
						class="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md"
					>
        </div>
        IBZN -->
					<img src="/images/logo.svg" width="200" alt="Logo Instituto Brasa Zona Norte" />
				</a>
			</div>
			<div class="flex flex-1 items-center justify-center">
				<div class="w-full max-w-xs">
					<LoginForm />
				</div>
			</div>
		</div>
		<div class="relative hidden bg-muted lg:block">
			<img
				src="/images/login-bg.png"
				alt="Login background"
				class="absolute inset-0 h-full w-full object-cover"
			/>
			<div class="absolute inset-0 bg-black/20"></div>
		</div>
	</div>

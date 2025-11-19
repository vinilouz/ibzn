<script lang="ts">
	import { navigating } from '$app/stores';
	import { fade } from 'svelte/transition';
	import { onDestroy } from 'svelte';

	let showOverlay = $state(false);
	let minDisplayTimeout: ReturnType<typeof setTimeout> | null = null;

	// Ensure overlay shows for at least a minimum duration
	$effect(() => {
		if ($navigating) {
			showOverlay = true;
			// Clear any existing timeout
			if (minDisplayTimeout) {
				clearTimeout(minDisplayTimeout);
				minDisplayTimeout = null;
			}
		} else if (showOverlay) {
			// When navigation ends, keep showing for minimum 300ms
			minDisplayTimeout = setTimeout(() => {
				showOverlay = false;
				minDisplayTimeout = null;
			}, 300);
		}
	});

	// Cleanup on component destroy
	onDestroy(() => {
		if (minDisplayTimeout) {
			clearTimeout(minDisplayTimeout);
		}
	});
</script>

{#if showOverlay}
	<div 
		class="fixed inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center"
		style="z-index: 99999;"
		in:fade={{ duration: 100 }}
		out:fade={{ duration: 200 }}
	>
		<div class="relative bg-background/90 p-8 rounded-lg shadow-2xl">
			<!-- Spinner Circle -->
			<div class="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
			
			<!-- Optional: Loading text -->
			<p class="mt-4 text-sm font-medium text-foreground text-center">
				Carregando...
			</p>
		</div>
	</div>
{/if}

<style>
	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}
	
	.animate-spin {
		animation: spin 1s linear infinite;
	}
</style>

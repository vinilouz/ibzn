<script lang="ts">
	import { navigating } from '$app/stores';
	import { isLoading } from '$lib/stores/loading';
	import { fade } from 'svelte/transition';
	import { onDestroy } from 'svelte';

	let showOverlay = $state(false);
	let minDisplayTimeout: ReturnType<typeof setTimeout> | null = null;

	// Show overlay when navigating OR when manually triggered
	$effect(() => {
		const shouldShow = $navigating !== null || $isLoading;
		
		if (shouldShow) {
			showOverlay = true;
			// Clear any existing timeout
			if (minDisplayTimeout) {
				clearTimeout(minDisplayTimeout);
				minDisplayTimeout = null;
			}
		} else if (showOverlay) {
			// When navigation/loading ends, keep showing for minimum 300ms
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
		class="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center"
		style="z-index: 99999;"
		in:fade={{ duration: 150 }}
		out:fade={{ duration: 150 }}
	>
		<div class="relative bg-card p-8 rounded-xl shadow-2xl border border-border">
			<!-- Spinner Circle -->
			<div class="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto"></div>
			
			<!-- Optional: Loading text -->
			<p class="mt-4 text-sm font-medium text-muted-foreground text-center">
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

<script lang="ts">
	import { navigating } from '$app/stores';
	import { loadingStore } from '$lib/stores/loading';
	import { fade, scale } from 'svelte/transition';
	import { onDestroy } from 'svelte';

	let showOverlay = $state(false);
	let loadingMessage = $state('Carregando...');
	let minDisplayTimeout: ReturnType<typeof setTimeout> | null = null;

	// Show overlay when navigating OR when manually triggered
	$effect(() => {
		const isNavigating = $navigating !== null;
		const isManualLoading = $loadingStore.isLoading;
		const shouldShow = isNavigating || isManualLoading;
		
		if (shouldShow) {
			showOverlay = true;
			loadingMessage = isManualLoading ? $loadingStore.message : 'Carregando...';
			
			// Clear any existing timeout
			if (minDisplayTimeout) {
				clearTimeout(minDisplayTimeout);
				minDisplayTimeout = null;
			}
		} else if (showOverlay) {
			// When navigation/loading ends, keep showing for minimum 200ms for smooth transition
			minDisplayTimeout = setTimeout(() => {
				showOverlay = false;
				minDisplayTimeout = null;
			}, 200);
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
		transition:fade={{ duration: 150 }}
	>
		<div 
			class="relative bg-card p-8 rounded-xl shadow-2xl border border-border"
			transition:scale={{ duration: 200, start: 0.95 }}
		>
			<!-- Spinner Circle -->
			<div class="w-16 h-16 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto"></div>
			
			<!-- Loading text with message -->
			<p class="mt-4 text-base font-medium text-foreground text-center min-w-[200px]">
				{loadingMessage}
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

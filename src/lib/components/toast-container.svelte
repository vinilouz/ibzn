<script lang="ts">
	import { toasts } from '$lib/stores/toast';
	import Toast from './toast.svelte';
</script>

<div class="fixed top-4 right-4 z-50 flex flex-col gap-2">
	{#each $toasts as toast (toast.id)}
		<Toast 
			message={toast.message} 
			type={toast.type} 
			duration={toast.duration || 3000}
			onClose={() => toasts.remove(toast.id)}
		/>
	{/each}
</div>

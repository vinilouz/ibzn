<script lang="ts">
	import { fly } from 'svelte/transition';
	import { CheckCircle, XCircle, AlertCircle, Info } from 'lucide-svelte';
	
	let { 
		message = '',
		type = 'success',
		duration = 3000,
		onClose = () => {}
	}: {
		message: string;
		type?: 'success' | 'error' | 'warning' | 'info';
		duration?: number;
		onClose?: () => void;
	} = $props();

	const icons = {
		success: CheckCircle,
		error: XCircle,
		warning: AlertCircle,
		info: Info
	};

	const colors = {
		success: 'bg-green-50 border-green-200 text-green-800',
		error: 'bg-red-50 border-red-200 text-red-800',
		warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
		info: 'bg-blue-50 border-blue-200 text-blue-800'
	};

	const iconColors = {
		success: 'text-green-600',
		error: 'text-red-600',
		warning: 'text-yellow-600',
		info: 'text-blue-600'
	};

	let show = $state(true);
	const Icon = icons[type];

	$effect(() => {
		if (duration > 0) {
			const timer = setTimeout(() => {
				show = false;
				setTimeout(onClose, 300);
			}, duration);

			return () => clearTimeout(timer);
		}
	});
</script>

{#if show}
	<div 
		class="min-w-[300px] max-w-md"
		transition:fly={{ y: -20, duration: 300 }}
	>
		<div class="rounded-lg border-2 p-4 shadow-lg {colors[type]} flex items-start gap-3">
			<Icon class="h-5 w-5 {iconColors[type]} flex-shrink-0 mt-0.5" />
			<p class="text-sm font-medium flex-1">{message}</p>
			<button 
				onclick={() => {
					show = false;
					setTimeout(onClose, 300);
				}}
				class="text-current hover:opacity-70 transition-opacity"
				aria-label="Fechar notificação"
			>
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<line x1="18" y1="6" x2="6" y2="18"></line>
					<line x1="6" y1="6" x2="18" y2="18"></line>
				</svg>
			</button>
		</div>
	</div>
{/if}

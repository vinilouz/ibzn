<script lang="ts">
	let { children } = $props();
	import "../app.css"
	import { ModeWatcher } from "mode-watcher";
	import SunIcon from 'lucide-svelte/icons/sun'
	import MoonIcon from 'lucide-svelte/icons/moon';
	import { toggleMode } from 'mode-watcher';
	import { Button } from '$lib/components/ui/button/index.js';
</script>

<ModeWatcher />

<div class="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
    
	{@render children()}
</div>
<script lang="ts">
    import '../app.css';
    import favicon from '$lib/assets/favicon.svg';
    import LoadingOverlay from '$lib/components/loading-overlay.svelte';
    let { children } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<LoadingOverlay />
{@render children?.()}

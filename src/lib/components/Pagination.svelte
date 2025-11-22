<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { ChevronLeft, ChevronRight } from 'lucide-svelte';

	interface Props {
		currentPage: number;
		totalItems: number;
		itemsPerPage: number;
		onPageChange: (page: number) => void;
	}

	let { currentPage = $bindable(1), totalItems, itemsPerPage, onPageChange }: Props = $props();

	const totalPages = $derived(Math.ceil(totalItems / itemsPerPage));
	const startItem = $derived((currentPage - 1) * itemsPerPage + 1);
	const endItem = $derived(Math.min(currentPage * itemsPerPage, totalItems));

	function goToPage(page: number) {
		if (page >= 1 && page <= totalPages) {
			currentPage = page;
			onPageChange(page);
		}
	}

	function previousPage() {
		if (currentPage > 1) {
			goToPage(currentPage - 1);
		}
	}

	function nextPage() {
		if (currentPage < totalPages) {
			goToPage(currentPage + 1);
		}
	}

	const pageNumbers = $derived.by(() => {
		const pages: number[] = [];
		const maxVisible = 5;

		if (totalPages <= maxVisible) {
			for (let i = 1; i <= totalPages; i++) {
				pages.push(i);
			}
		} else {
			if (currentPage <= 3) {
				pages.push(1, 2, 3, 4, -1, totalPages);
			} else if (currentPage >= totalPages - 2) {
				pages.push(1, -1, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
			} else {
				pages.push(1, -1, currentPage - 1, currentPage, currentPage + 1, -1, totalPages);
			}
		}

		return pages;
	});
</script>

{#if totalPages > 1}
	<div class="flex items-center justify-between px-2 py-4">
		<div class="text-sm text-muted-foreground">
			Mostrando {startItem} a {endItem} de {totalItems} resultados
		</div>

		<div class="flex items-center gap-2">
			<Button
				variant="outline"
				size="sm"
				onclick={previousPage}
				disabled={currentPage === 1}
			>
				<ChevronLeft class="h-4 w-4" />
			</Button>

			{#each pageNumbers as pageNum}
				{#if pageNum === -1}
					<span class="px-2 text-muted-foreground">...</span>
				{:else}
					<Button
						variant={currentPage === pageNum ? 'default' : 'outline'}
						size="sm"
						onclick={() => goToPage(pageNum)}
					>
						{pageNum}
					</Button>
				{/if}
			{/each}

			<Button
				variant="outline"
				size="sm"
				onclick={nextPage}
				disabled={currentPage === totalPages}
			>
				<ChevronRight class="h-4 w-4" />
			</Button>
		</div>
	</div>
{/if}

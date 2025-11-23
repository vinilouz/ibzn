import type { SubmitFunction } from '@sveltejs/kit';
import { showLoading, hideLoading } from '$lib/stores/loading';
import { goto, invalidateAll } from '$app/navigation';

interface EnhanceOptions {
	loadingMessage?: string;
	onSuccess?: () => void | Promise<void>;
	redirectTo?: string;
	invalidate?: boolean;
	showSuccess?: boolean;
	successMessage?: string;
}

/**
 * Enhanced form submission with automatic loading overlay
 * Use this as a callback with the enhance action
 */
export const enhanceWithLoading: SubmitFunction = () => {
	showLoading('Processando...');

	return async ({ update }) => {
		try {
			await update({ reset: false });
		} finally {
			hideLoading();
		}
	};
};

/**
 * Enhanced form submission with loading and custom options
 * @param options - Configuration options
 * @param options.loadingMessage - Custom loading message (default: "Processando...")
 * @param options.onSuccess - Callback to run on success
 * @param options.redirectTo - URL to redirect to on success
 * @param options.invalidate - Whether to invalidate all data (default: false)
 * @param options.showSuccess - Whether to show success toast (future)
 * @param options.successMessage - Success message to show (future)
 */
export function enhanceWithLoadingAndCallback(options: EnhanceOptions = {}): SubmitFunction {
	const {
		loadingMessage = 'Processando...',
		onSuccess,
		redirectTo,
		invalidate = false,
		showSuccess = false,
		successMessage = 'Operação realizada com sucesso!'
	} = options;

	return () => {
		showLoading(loadingMessage);

		return async ({ result, update }) => {
			try {
				await update({ reset: false });
				
				if (result.type === 'success') {
					// Invalidate data if requested
					if (invalidate) {
						await invalidateAll();
					}

					// Call success callback
					if (onSuccess) {
						await onSuccess();
					}

					// Show success message (future: integrate with toast)
					if (showSuccess) {
						console.log(successMessage);
					}

					// Redirect if specified
					if (redirectTo) {
						goto(redirectTo);
					}
				}
			} finally {
				hideLoading();
			}
		};
	};
}

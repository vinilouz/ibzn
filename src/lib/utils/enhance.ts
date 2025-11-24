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
					if (invalidate) {
						await invalidateAll();
					}

					if (onSuccess) {
						await onSuccess();
					}

					if (showSuccess) {
						console.log(successMessage);
					}

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

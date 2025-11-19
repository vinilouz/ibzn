import type { SubmitFunction } from '@sveltejs/kit';
import { showLoading, hideLoading } from '$lib/stores/loading';

/**
 * Enhanced form submission with automatic loading overlay
 * Use this as a callback with the enhance action
 */
export const enhanceWithLoading: SubmitFunction = () => {
	// Show loading when form starts submitting
	showLoading();

	return async ({ update }) => {
		try {
			// Update the form
			await update();
		} finally {
			// Always hide loading after operation completes
			hideLoading();
		}
	};
};

/**
 * Enhanced form submission with loading and custom callback on success
 */
export function enhanceWithLoadingAndCallback(onSuccess?: () => void): SubmitFunction {
	return () => {
		showLoading();

		return async ({ result, update }) => {
			try {
				await update();
				
				// Call the success callback if result is successful
				if (result.type === 'success' && onSuccess) {
					onSuccess();
				}
			} finally {
				hideLoading();
			}
		};
	};
}

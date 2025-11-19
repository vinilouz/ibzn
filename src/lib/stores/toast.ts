import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
	id: number;
	message: string;
	type: ToastType;
	duration?: number;
}

function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([]);
	let idCounter = 0;

	const show = (message: string, type: ToastType = 'success', duration = 3000) => {
		const id = ++idCounter;
		const toast: Toast = { id, message, type, duration };
		
		update(toasts => [...toasts, toast]);

		if (duration > 0) {
			setTimeout(() => {
				update(toasts => toasts.filter(t => t.id !== id));
			}, duration);
		}
	};

	return {
		subscribe,
		show,
		remove: (id: number) => {
			update(toasts => toasts.filter(t => t.id !== id));
		},
		success: (message: string, duration = 3000) => {
			show(message, 'success', duration);
		},
		error: (message: string, duration = 3000) => {
			show(message, 'error', duration);
		},
		warning: (message: string, duration = 3000) => {
			show(message, 'warning', duration);
		},
		info: (message: string, duration = 3000) => {
			show(message, 'info', duration);
		}
	};
}

export const toasts = createToastStore();

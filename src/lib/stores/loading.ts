import { writable } from 'svelte/store';

interface LoadingState {
	isLoading: boolean;
	message: string;
}

const initialState: LoadingState = {
	isLoading: false,
	message: 'Processando...'
};

export const loadingStore = writable<LoadingState>(initialState);

export function showLoading(message: string = 'Processando...') {
	loadingStore.set({ isLoading: true, message });
}

export function hideLoading() {
	loadingStore.set({ isLoading: false, message: '' });
}

// Backward compatibility
export const isLoading = writable(false);

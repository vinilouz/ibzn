// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

// Extend better-auth user type
declare module 'better-auth' {
	interface User {
		role: 'admin' | 'manager' | 'user' | 'guest';
	}
}

export {};
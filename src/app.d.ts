// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		namespace App {
			interface Locals {
				user: import("better-auth").User | null;
				session: import("better-auth").Session | null;
			}
		}
	}
}

export {};

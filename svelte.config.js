import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: { 
		adapter: adapter(),
		prerender: {
			handleHttpError: 'warn',
			entries: []
		},
		alias: {
			$lib: './src/lib',
			$components: './src/lib/components',
			$utils: './src/lib/utils'
		},
		inlineStyleThreshold: 4096
	},
	compilerOptions: {
		css: 'injected'
	}
};

export default config;

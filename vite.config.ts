import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	build: {
		target: 'esnext',
		minify: 'esbuild',
		cssCodeSplit: true,
		cssMinify: true,
		reportCompressedSize: false,
		chunkSizeWarningLimit: 1000,
		rollupOptions: {
			output: {
				manualChunks: (id) => {
					if (id.includes('node_modules')) {
						if (id.includes('svelte')) return 'svelte';
						if (id.includes('lucide-svelte') || id.includes('@lucide')) return 'icons';
						if (id.includes('better-auth')) return 'auth';
						if (id.includes('drizzle')) return 'db';
						return 'vendor';
					}
				}
			}
		}
	},
	optimizeDeps: {
		include: ['lucide-svelte', 'mode-watcher'],
		exclude: ['@sveltejs/kit']
	},
	server: {
		fs: {
			allow: ['..']
		}
	}
});

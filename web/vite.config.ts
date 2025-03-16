import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const isDev = process.env.NODE_ENV === 'development';

export default defineConfig({
	plugins: [
		tsconfigPaths(),
		remix({
			buildDirectory: 'build',
			serverBuildFile: 'index.js',
		}),
	],
	define: isDev ? { 'process.env': process.env } : {},
	server: isDev
		? {
				watch: {
					usePolling: true,
					interval: 100, // optional tweak
				},
		  }
		: undefined,
});

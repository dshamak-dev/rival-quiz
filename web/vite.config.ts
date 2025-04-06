import { vitePlugin as remix } from '@remix-run/dev';
import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

const isDev = process.env.NODE_ENV === 'development';
const WEB_HOST = process.env.WEB_APP_URL || 'localhost';

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
				host: true, // optional but useful when running in Docker
				allowedHosts: ['web', 'web-local', WEB_HOST],
				watch: {
					usePolling: true,
					interval: 100, // optional tweak
				},
		  }
		: undefined,
});

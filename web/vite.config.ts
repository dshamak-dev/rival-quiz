import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  server: {
    proxy: {
      '/quizloapi': 'http://localhost:3004',
    }
  },
  plugins: [tsconfigPaths(), remix({
    buildDirectory: "build",
    serverBuildFile: "index.js",
  })]
});

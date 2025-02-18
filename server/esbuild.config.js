const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["index.ts", "src/services/index.ts"],
    outdir: "dist",
    bundle: true, // Bundle everything together
    minify: true, // Set to true for production
    sourcemap: true, // Enable source maps
    platform: "node",
    format: "esm",
    splitting: true, // Enable code splitting (creates chunks)
    outExtension: { ".js": ".mjs" }, // Output as .mjs for ESM compatibility
    tsconfig: "tsconfig.json",
    metafile: true, // Useful for analyzing output
  })
  .then(() => {
    console.log("✅ Build complete!");
  })
  .catch(() => process.exit(1));

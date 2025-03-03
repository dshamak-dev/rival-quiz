const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["index.ts"],
    outdir: "dist",
    bundle: true, // Bundle everything together
    minify: false, // Set to true for production
    sourcemap: true, // Enable source maps
    platform: "node",
    format: "cjs",
    // splitting: true, // Enable code splitting (creates chunks)
    outExtension: { ".js": ".cjs" }, // Output as .mjs for ESM compatibility
    tsconfig: "tsconfig.json",
    metafile: true, // Useful for analyzing output
  })
  .then(() => {
    console.log("✅ Build complete!");
  })
  .catch(() => process.exit(1));

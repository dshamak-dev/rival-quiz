const esbuild = require("esbuild");
const path = require("path");
// const { copy } = require("esbuild-plugin-copy");
// const CssModulesPlugin = require("esbuild-css-modules-plugin");
// const postcss = require('esbuild-postcss');

// const isProd = process.argv.includes("--production");
const watch = process.argv.includes("--watch");
const minify = process.argv.includes("--minify");

const rootFolder = process.cwd();

const config = {
  entryPoints: ["./server/index.ts"],
  bundle: true,
  outfile: "./private/server.js",
  minify: minify,
  plugins: [
    // postcss(),
    // CssModulesPlugin({
    //   // @see https://github.com/indooorsman/esbuild-css-modules-plugin/blob/main/index.d.ts for more details
    //   force: true,
    //   emitDeclarationFile: true,
    //   localsConvention: 'camelCaseOnly',
    //   namedExports: true,
    //   inject: false
    // }),
    // copy({
    //   // this is equal to process.cwd(), which means we use cwd path as base path to resolve `to` path
    //   // if not specified, this plugin uses ESBuild.build outdir/outfile options as base path.
    //   resolveFrom: "cwd",
    //   assets: {
    //     from: ["./se/**/*.html"],
    //     to: ["./public/"],
    //   },
    //   watch: watch,
    // }),
    // copy({
    //   // this is equal to process.cwd(), which means we use cwd path as base path to resolve `to` path
    //   // if not specified, this plugin uses ESBuild.build outdir/outfile options as base path.
    //   resolveFrom: "cwd",
    //   assets: {
    //     from: ["./client/assets/*"],
    //     to: ["./public/assets"],
    //   },
    //   watch: watch,
    // }),
  ],
};

if (watch) {
  config.plugins.push({
    name: "watch-plugin",
    setup(build) {
      build.onStart(() => {
        console.clear();
      });
      build.onEnd((result) => {
        if (result?.errors?.length) {
          // console.log('build errors', result.errors);
        } else {
          console.log('watching...');
        }
      });
    },
  });
}

async function run() {
  if (watch) {
    // args.minify = false;
    try {
      ctx = await esbuild.context(config);
      await ctx.watch();
      // console.log("watching...");
    } catch (error) {
      console.log("error", error);
    }
  } else {
    // args.minify = true;
    ctx = await esbuild.build(config);
    console.log("build successful");
  }
}

run();

const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const DotenvWebpack = require('dotenv-webpack');
// const dotenv = require('dotenv');
// const webpack = require('webpack');

module.exports = (env) => {
  const rootFolder = "./client";
  const buildFolder = "./public";

  const isProd = env.production;

  return {
    entry: path.resolve(__dirname, "./client/index.ts"),
    output: {
      chunkFilename: "[name].[contenthash].js",
      filename: "[name].[contenthash].js",
      assetModuleFilename: "[name].[contenthash][ext][query]",
      asyncChunks: true,
      path: path.resolve(__dirname, buildFolder),
      clean: true,
      publicPath: '/',
    },
    watchOptions: {
      ignored: /server/,
    },
    devtool: "source-map",
    // devServer: {
    //   static: {
    //     directory: path.join(__dirname, rootFolder),
    //   },
    //   historyApiFallback: {
    //     index: '/'
    //   },
    //   port: 3000,
    // },
    plugins: [
      new HtmlWebpackPlugin({
        favicon: path.join(__dirname, rootFolder, "./assets/favicon.ico"),
        template: path.join(__dirname, rootFolder, "index.html"),
      }),
    ],
    module: {
      // exclude node_modules
      rules: [
        {
          test: /\.tsx?$/,
          use: "ts-loader",
          exclude: /node_modules/,
        },
        {
          test: /\.css$/i,
          use: ["style-loader", "css-loader", "postcss-loader"],
        },
        {
          test: /\.(js)$/,
          exclude: /node_modules/,
          enforce: "pre",
          use: ["babel-loader", "source-map-loader"],
        },
      ],
    },
    resolve: {
      alias: {
        "src/*": path.resolve(__dirname, "./client/src/*"),
      },
      modules: [
        path.resolve("./node_modules"),
        path.resolve(__dirname, "./client"),
      ],
      extensions: [".*", ".js", ".ts", ".tsx"],
    },
    stats: {
      children: true,
      errorDetails: true,
    },
    optimization: {
      usedExports: isProd ? "global" : false,
      minimize: isProd,
      splitChunks: isProd
        ? {
            chunks: "async",
          }
        : undefined,
    },
  };
};

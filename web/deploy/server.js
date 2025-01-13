import { createRequestHandler } from "@remix-run/express";
import express from "express";
// notice that the result of `remix vite:build` is "just a module"
import * as build from "./build/server/index.js";

const app = express();
app.use(express.static("build/client"));

// and your app is "just a request handler"
app.all("*", createRequestHandler({ build }));

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`App listening on ${PORT} port`);
});
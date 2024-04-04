import express from "express";
import { config } from "dotenv";
import path from "path";

const processPath = process.cwd();
const configPath = path.join(processPath, ".env");

config({ path: configPath });

import routes from './routes';

const app = express();

const PORT = process.env.PORT;

const publicFolderPath = path.join(processPath, "/public");

app.use(express.static(publicFolderPath));

for (const route of routes) {
  app.use(route);
}

const indexFilePath = path.join(publicFolderPath, "/index.html");

app.get('*', (req, res) => {
  res.sendFile(indexFilePath);
});

app.listen(PORT, () => {
  console.log(`server listening on port: ${PORT}`);
});

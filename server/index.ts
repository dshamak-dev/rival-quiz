import express from "express";
import dotenv from "dotenv";
import cors, { CorsOptions } from "cors";
import cookieParser from "cookie-parser";
import { getAction } from "./src/utils";

dotenv.config();

const app = express();

const corsOptions: CorsOptions = {
	origin: process.env.ALLOW_API_ACCESS?.split(',') || [],
	credentials: true,
};

app.use(cors(corsOptions));

app.use(cookieParser());

const allowlist = process.env.ALLOW_API_ACCESS?.split(",") || [];
const corsOptionsDelegate = function (req: any, callback: any) {
  let corsOptions;
  const origin = req.headers.origin;
  const allowAccess = allowlist.some((it) => it === origin);

  if (allowAccess) {
    corsOptions = { origin: true };
  } else {
    corsOptions = { origin: false };
  }

  callback(null, corsOptions);
};

app.get("/health", function (req, res, next) {
  res.json({ msg: "This is CORS-enabled for an allowed domain." });
});

// app.get('/health', (req: Request, res: any) => {
// 	res.status(200).send('API is up and running');
// });

const port = process.env.PORT || 3000;

getAction().then((data) => {
  console.log(data);
});

app.listen(port, function () {
  console.log(`Server is running on port: ${port}`);
});

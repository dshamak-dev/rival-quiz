import express, { NextFunction, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import https from "https";
import cookieParser from "cookie-parser";

// microservices initialization
import userService from "./src/user/user.service";
import sessionService from "./src/session/session.service";
import sessionUserActionService from "./src/user-action/user-action.service";
import transactionService from "./src/services/transaction";
import walletService from "./src/services/wallet";
import questionDataService from "./src/services/question-data";
import broadcastService from "./src/services/broadcast";
import telegramBotService from "./src/services/telegram-bot";

import { services } from "./src/services";

import { connect } from "./src/database";
import { addLog } from "@/services/logger/api";

dotenv.config();

// Connect to MongoDB
connect();

const app = express();

const allowlist = process.env.ALLOW_API_ACCESS?.split(",") || [];
const corsOptions = {
  origin: allowlist,
  credentials: true,
};

app.use(cookieParser());

app.use(cors(corsOptions));

const HTTPS_ONLY = process.env.HTTPS_ONLY === "true";

app.use((req, res, next) => {
  if (HTTPS_ONLY && req.headers["x-forwarded-proto"] !== "https") {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }

  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Expose-Headers", "Set-Cookie");

  next();
});

services.forEach((init) => {
  const service = init();

  if (service.name) {
    console.log(`Service ${service.name} available at /${service.route} route`);
  }

  app.use(`/${service.route}`, service.router);
});

// User routes initialization
app.use("/users", userService);

// Session service initialization
app.use("/sessions", sessionService);

// Session User Action service initialization
app.use("/user-actions", sessionUserActionService);

// Transaction service initialization
app.use("/transactions", transactionService().router);

// Wallet service initialization
app.use("/wallets", walletService().router);

// Question Data service initialization
app.use("/question-datas", questionDataService().router);

// Broadcast service initialization
app.use("/broadcasts", broadcastService().router);

// Telegram Bot service initialization
app.use("/telegram", telegramBotService().router);

app.get("/health", (req, res) => {
  res
    .status(200)
    .json({
      ok: true,
    })
    .end();
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  addLog({
    source: req.url || "express",
    message: err.message,
    data: req.body,
  });

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

app.listen(80, () => {
  console.log(`Server listening on express ${80} port`);
});

const httpsOptions = {};

const httpsServer = https.createServer(httpsOptions, app);

httpsServer.listen(443, () => {
  console.log(`Server listening on ${443} port`);
});

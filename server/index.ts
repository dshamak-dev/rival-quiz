import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

// microservices initialization
import userService from "./src/user/user.service";
import sessionService from "./src/session/session.service";
import sessionUserActionService from "./src/user-action/user-action.service";
import transactionService from "./src/services/transaction";
import walletService from "./src/services/wallet";
import questionDataService from "./src/services/question-data";
import broadcastService from "./src/services/broadcast";
import { connect } from "./src/database";

dotenv.config();

// Connect to MongoDB
connect();

const app = express();

const allowlist = process.env.ALLOW_API_ACCESS?.split(",") || [];
const corsOptions = {
  origin: allowlist,
  credentials: true,
};
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

app.use(cors(corsOptions));

app.use(cookieParser());

// TODO: apply microservices to application

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

app.get("/health", (req, res) => {
  const cookies = req.cookies || req.headers.cookie;

  res.cookie("toggler", !cookies.toggler, {
    httpOnly: false,
    maxAge: 1000000,
  });

  res
    .status(200)
    .json({
      cookies,
    })
    .end();
});

// default route path
app.use((req, res) => {
  res.cookie("timelog", Date.now(), {
    // path: "./",
    httpOnly: false,
    maxAge: 1000000,
  });

  res.status(404).send("Hello, World!");
});

const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`Server is running on port ${port}`);
});

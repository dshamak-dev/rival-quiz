import express from "express";
import dotenv from "dotenv";
import path from "path";
import { TelegramBot } from "./model";

dotenv.config();

const router = express.Router();

const PUBLIC_PATH = path.join(__dirname, "public");

router.use(express.static(PUBLIC_PATH));

router.use(express.json());

router.get("/health", (req, res) => {
  const ok = TelegramBot.health;

  res.status(ok ? 200 : 400).end();
});

router.put("/state", (req, res) => {
  const { status, token, wepApp } = req.body;

  if (!status) {
    TelegramBot.stop();
    res.status(200).end();
    return;
  }

  if (!token || !wepApp) {
    res.statusMessage = "Invalid token or web app url";
    res.status(400).end();
    return;
  }

  const bot = TelegramBot.health ? TelegramBot.instance : new TelegramBot();

  bot
    .init(token, wepApp)
    .then(() => {
      res.status(200).json({ message: "Bot initialized successfully" });
    })
    .catch((err) => {
      console.error(err);
      res.statusMessage = err.message || "Failed to initialize bot";
      res.status(500).end();
    });
});

router.post("/message", (req, res) => {
  const { id, message } = req.body;

  const bot = TelegramBot.instance;

  if (!bot) {
    res.statusMessage = "Telegram bot instance not found";
    res.status(500).end();

    return;
  }

  if (!id) {
    bot
      .broadcastMessage(message)
      .then((payload) => {
        res.status(200).json({ data: payload });
      })
      .catch((err) => {
        console.error(err);

        res.statusMessage =
          err.message || "Failed to broadcast Telegram message";
        res.status(500).end();
      });
    return;
  }

  bot
    .sendChatMessage(id, message)
    .then((payload) => {
      res.status(200).json({ data: payload });
    })
    .catch((err) => {
      console.error("Error sending Telegram message:", err);

      res.statusMessage = err.message || "Failed to send Telegram message";
      res.status(500).end();
    });
});

export default router;

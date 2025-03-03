import express from "express";
import dotenv from "dotenv";
import path from "path";
import { TelegramBotManager } from "./model";

dotenv.config();

const router = express.Router();

const PUBLIC_PATH = path.join(process.cwd(), "public/telegram");

router.use(express.static(PUBLIC_PATH));

router.use(express.json());

router.get("/health", (req, res) => {
  const bots = TelegramBotManager.getBots();

  res
    .status(200)
    .json(bots || [])
    .end();
});

router.put("/power", async (req, res) => {
  const on = !!req.body.on;

  if (on) {
    return TelegramBotManager.init()
      .then((data) => {
        res.statusMessage = "Bots started successfully.";
        res.status(200).json(data).end();
      })
      .catch((err) => {
        res.statusMessage = err.message || "Failed to start bots.";
        res.status(400).end();
      });
  }

  await TelegramBotManager.stop();

  const bots = TelegramBotManager.getBots();

  res
    .status(200)
    .json(bots || [])
    .end();
});

router.post("/message", (req, res) => {
  const { token, chat_id, message, markup } = req.body;

  if (!message?.trim()) {
    res.statusMessage = "Imvalid message.";
    res.status(404).end();
  }

  TelegramBotManager.broadcastMessage(
    message,
    {
      token,
      chatId: chat_id,
    },
    {
      parse_mode: markup,
    }
  )
    .then(() => {
      res.statusMessage = "Message sent successfully.";
      res.status(200).end();
    })
    .catch((error) => {
      res.statusMessage = error.message || "Failed to send message.";
      res.status(500).end();
    });
});

export default router;

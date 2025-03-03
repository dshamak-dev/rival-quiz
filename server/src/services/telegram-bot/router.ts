import express from "express";
import dotenv from "dotenv";
import path from "path";
import { MessageExtraProps, TelegramBot, TelegramBotManager } from "./model";
import { addLog } from "../logger/api";

dotenv.config();

const router = express.Router();

const PUBLIC_PATH = path.join(process.cwd(), "public/telegram");

router.use(express.static(PUBLIC_PATH));

router.use(express.json());

router.get("/health", (req, res) => {
  const bots = TelegramBotManager.getBots();

  if (!bots?.length) {
    res.statusMessage = "No bots are available";
    res.status(400).end();
    return;
  }

  res.status(200).json(bots).end();
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

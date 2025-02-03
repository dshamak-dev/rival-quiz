import express from "express";
import dotenv from "dotenv";

dotenv.config();

import * as telegram from "./src/telegram";

const app = express();

app.use(express.static("public"));

app.use(express.json());

app.post("/api/telegram/message", (req, res) => {
  const { id, message } = req.body;

  telegram
    .sendBotMessage(id, message)
    .then((payload) => {
      res.status(200).json({ data: payload });
    })
    .catch((err) => {
      console.error("Error sending Telegram message:", err);

      res.statusMessage = err.message || "Failed to send Telegram message";
      res.status(500).end();
    });
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

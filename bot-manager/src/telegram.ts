import axios from "axios";
import { Telegraf } from "telegraf";
import fs from "fs";
import { delay } from "./helpers";

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
const WEB_APP_URL = process.env.WEB_APP_URL as string;
const bot = new Telegraf(TELEGRAM_BOT_TOKEN);

bot.telegram.setChatMenuButton({
  menuButton: {
	type: 'web_app',
    text: "Play 🎲",
    web_app: {
      url: WEB_APP_URL,
    },
  },
});

const CHAT_IDS_FILE = "chats.json";

bot.start((ctx) => {
  const chatId = ctx.chat?.id;

  rememberChatId(chatId);

  ctx.reply("Welcome! Click the button below to open the app", {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Open App 🚀",
            web_app: { url: WEB_APP_URL },
          },
        ],
      ],
    },
  });
});
bot.help((ctx) => ctx.reply("Send /start to get started."));

let chatIds: number[] = [];
if (fs.existsSync(CHAT_IDS_FILE)) {
  chatIds = JSON.parse(fs.readFileSync(CHAT_IDS_FILE, "utf8"));
}

bot.on("message", (ctx) => {
  const chatId = ctx.chat.id;

  rememberChatId(chatId);
  //   ctx.reply("You have been added to the bot’s chat list!");
});

bot.on("text", (ctx) => {
  console.log("On Text", ctx);
  //  ctx.reply(`You said: ${ctx.message.text}`)
});

bot.launch();

export async function broadcastMessage(message, params, limit = 20) {
  let counter = 0;

  for (const chatId of chatIds) {
    await sendChatMessage(chatId, message, params);

    if (counter > limit) {
      await delay(1000);
      counter = 0;
    }
  }
}

export async function rememberChatId(id) {
  if (id && !chatIds.includes(id)) {
    chatIds.push(id);

    fs.writeFileSync(CHAT_IDS_FILE, JSON.stringify(chatIds, null, 2));
  }
}

export async function sendBotMessage(id, message) {
  if (!TELEGRAM_BOT_TOKEN) {
    return Promise.reject("Invalid Telegram bot token");
  }

  if (!message) {
    return Promise.reject("Invalid message or chat ID");
  }

  if (id) {
    return sendChatMessage(id, message, {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Open App 🚀",
              web_app: { url: WEB_APP_URL },
            },
          ],
        ],
      },
    });
  }

  return broadcastMessage(message, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Open App 🚀",
            web_app: { url: WEB_APP_URL },
          },
        ],
      ],
    },
  });
}

export async function sendChatMessage(id, message, params) {
  return bot.telegram.sendMessage(id, message, params);
}

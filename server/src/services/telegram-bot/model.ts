import { Telegraf } from "telegraf";
import { getChatIds, rememberTelegramChatId } from "./actions";
import { delay } from "../../tools/async.utils";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";

export type MessageExtraProps = ExtraReplyMessage;

export class TelegramBot {
  static instance: TelegramBot;
  bot?: Telegraf;
  token?: string;
  webAppUrl?: string;
  chats: string[] = [];

  static get health() {
    const health = !!TelegramBot.instance?.bot;

    return health;
  }

  constructor() {
    TelegramBot.instance = this;

    return this;
  }

  static getInstance(): TelegramBot {
    if (!TelegramBot.instance) {
      throw new Error("TelegramBot instance is not initialized");
    }

    return TelegramBot.instance;
  }

  async sendChatMessage(id: string, message, params: MessageExtraProps = {}) {
    const messageParams: ExtraReplyMessage = {
      ...this.getInitialMessageProps(),
      ...params,
    };

    return this.bot?.telegram?.sendMessage(id, message, messageParams);
  }

  async broadcastMessage(message, params: MessageExtraProps) {
    let counter = 0;

    for (const chatId of this.chats) {
      await this.sendChatMessage(String(chatId), message, params);

      if (counter > 20) {
        await delay(1000);
        counter = 0;
      }
    }

    return { ok: true };
  }

  static stop() {
    if (!this.instance?.bot) {
      return;
    }

    this.instance.bot.stop();
    this.instance.bot = undefined;
  }

  async init(token, webAppUrl) {
    if (!token) {
      return Promise.reject("Invalid Telegram bot token");
    }

    this.token = token;
    this.webAppUrl = webAppUrl;
    this.chats = await getChatIds().catch(err => []);

    const bot = (this.bot = new Telegraf(token));

    await bot.telegram.setChatMenuButton({
      menuButton: {
        type: "web_app",
        text: "Play 🎲",
        web_app: {
          url: webAppUrl,
        },
      },
    }).catch(err => null);

    bot.start((ctx) => {
      this.registerChat(ctx);

      ctx.reply("Welcome! Click the button below to open the app", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Open App 🚀",
                web_app: { url: webAppUrl },
              },
            ],
          ],
        },
      });
    });

    bot.help((ctx) => ctx.reply("Send /start to get started."));

    bot.on("message", (ctx) => {
      this.registerChat(ctx);
    });

    return bot.launch();
  }

  registerChat(ctx) {
    const chatId = ctx.chat?.id;
    const self = this;

    if (chatId && this.chats.includes(chatId) === false) {
      rememberTelegramChatId(chatId).then((updated) => {
        self.chats = updated;
      });
    }
  }

  getInitialMessageProps(): {
    reply_markup?: ExtraReplyMessage["reply_markup"];
  } {
    if (!this.webAppUrl) {
      return {};
    }

    return {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Open App 🚀",
              web_app: { url: this.webAppUrl },
            },
          ],
        ],
      },
    };
  }
}

import { Telegraf } from "telegraf";
import { rememberTelegramChatId } from "./actions";
import { delay } from "../../tools/async.utils";
import { ExtraReplyMessage } from "telegraf/typings/telegram-types";
import { fetchTelegramBots } from "./api";
import { addLog } from "../logger/api";
import { escapeMarkdownV2, urlJoin } from "@shared/common/url.helpers";

export type MessageExtraProps = ExtraReplyMessage & {
  link?: string;
};

export class TelegramBotManager {
  static bots: TelegramBot[] = [];

  static getBots() {
    return TelegramBotManager.bots.map((model) => {
      const { token, webAppURL, chats, bot } = model;

      return {
        token,
        webAppURL,
        chats,
        active: model.health,
      };
    });
  }

  static findBotById(id: string) {
    return TelegramBotManager.bots.find((bot) => bot.token === id);
  }

  static async broadcastMessage(
    message: string,
    params: { token?: string; chatId?: string },
    extra: MessageExtraProps
  ) {
    const bots = TelegramBotManager.bots?.filter((bot) => {
      return !params.token || bot.token === params.token;
    });

    return Promise.all(
      bots.map((bot) => {
        if (params.chatId) {
          return bot.sendChatMessage(params.chatId, message, extra);
        }

        return bot.broadcastMessage(message, extra);
      })
    );
  }

  static async stop() {
    for (const model of this.bots) {
      model.stop();
    }

    return true;
  }

  static async init() {
    TelegramBotManager.bots = [];

    const bots = await fetchTelegramBots().catch((err) => {
      addLog({
        source: "telegram-bot-manager-init",
        message:
          typeof err === "string"
            ? err
            : err?.message ?? "Failed to initialize Telegram bots",
        data: {},
      });
      return null;
    });

    if (bots?.length) {
      for (const data of bots) {
        if ((data.token, data.webAppURL)) {
          const bot = new TelegramBot();

          bot.init(data.token, data.webAppURL, data.chats);

          TelegramBotManager.bots.push(bot);
        }
      }
    }

    return this.getBots();
  }
}

export class TelegramBot {
  instance?: TelegramBot;
  bot?: Telegraf;
  token?: string;
  webAppURL?: string;
  chats: string[] = [];

  get health() {
    const health = this.bot != null;

    return health;
  }

  constructor() {
    // TelegramBot.instance = this;

    return this;
  }

  getInstance(): TelegramBot {
    if (!this.instance) {
      throw new Error("TelegramBot instance is not initialized");
    }

    return this.instance;
  }

  async sendChatMessage(id: string, message, params: MessageExtraProps = {}) {
    const { link, ...extras } = params;

    const messageParams: ExtraReplyMessage = {
      ...this.getInitialMessageProps(),
      ...extras,
    };

    let chatMessage = message;

    if (
      link &&
      this.webAppURL &&
      params.parse_mode &&
      ["markdownv2", "markdown"].includes(params.parse_mode.toLocaleLowerCase())
    ) {
      let targetLink = link;

      try {
        targetLink = urlJoin(this.webAppURL, link);
      } catch (err) {
        console.log(err, this.webAppURL, link);
      }

      targetLink = escapeMarkdownV2(targetLink);

      chatMessage += `\n[Visit direct](${targetLink})`;
    }

    return this.bot?.telegram?.sendMessage(id, chatMessage, messageParams);
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

  stop() {
    if (!this.bot) {
      return;
    }

    this.bot.stop();
    this.bot = undefined;
  }

  async init(token, webAppURL, chats: string[] = []) {
    if (!token) {
      return Promise.reject("Invalid Telegram bot token");
    }

    this.token = token;
    this.webAppURL = webAppURL;
    this.chats = chats || [];

    const bot = (this.bot = new Telegraf(token));

    const ok = await bot.telegram
      .setChatMenuButton({
        menuButton: {
          type: "web_app",
          text: "Play 🎲",
          web_app: {
            url: webAppURL,
          },
        },
      })
      .catch((err) => null);

    bot.start((ctx) => {
      this.registerChat(ctx);

      ctx.reply("Welcome! Click the button below to open the app", {
        reply_markup: {
          inline_keyboard: [
            [
              {
                text: "Open App 🚀",
                web_app: { url: webAppURL },
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
      rememberTelegramChatId(chatId)
        .then((nextChats) => {
          self.chats = nextChats || [];
        })
        .catch((err) => {
          return null;
        });
    }
  }

  getInitialMessageProps(): {
    reply_markup?: ExtraReplyMessage["reply_markup"];
  } {
    if (!this.webAppURL) {
      return {};
    }

    return {
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: "Open App 🚀",
              web_app: { url: this.webAppURL },
            },
          ],
        ],
      },
    };
  }
}

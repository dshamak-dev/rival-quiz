const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN as string;
const WEB_APP_URL = process.env.WEB_APP_URL as string;

import { create, getChats } from "./api";
import router from "./router";

export default function init() {
  getChats().then((chats) => {
    if (!chats) {
      return create({});
    }
  });

  return {
    router,
    model: null,
    actions: null,
    middlewares: null,
    name: "Telegram Bot Manager",
  };
}

import { TelegramBotManager } from "./model";
import router from "./router";

export default function init() {
  TelegramBotManager.init();

  return {
    router,
    model: null,
    actions: null,
    middlewares: null,
    name: "Telegram Bot Manager",
  };
}

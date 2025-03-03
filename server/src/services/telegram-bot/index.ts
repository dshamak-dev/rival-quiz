import { TelegramBotManager } from "./model";
import router from "./router";

const START_ON_LAUNCH = process.env.NODE_ENV != "development";

export default function init() {
  TelegramBotManager.init(START_ON_LAUNCH);

  return {
    router,
    model: null,
    actions: null,
    middlewares: null,
    name: "Telegram Bot Manager",
  };
}

import { escapeMarkdownV2 } from "@shared/common/url.helpers";
import { TelegramBotManager } from "../telegram-bot/model";
import { NotificationCreatePayload } from "./type";

export async function createNotification(payload: NotificationCreatePayload) {
  if (
    payload.target?.type === "system" &&
    payload.type &&
    ["info", "success"].includes(payload.type)
  ) {
    const message = `
		    *${payload.title}*
			\n${escapeMarkdownV2(payload.content || '')}
		`.trim();

    await TelegramBotManager.broadcastMessage(
      message,
      {},
      {
        parse_mode: "MarkdownV2",
        preview: payload.preview,
        link: payload.url,
      }
    );
  }

  // TODO: Implement app notifications

  return Promise.resolve(true);
}

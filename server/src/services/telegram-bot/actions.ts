import { addChat, getChats } from "./api";
import { TelegramBotDTO } from "./type";

export async function getChatIds() {
  const chats = await getChats().catch(() => []);

  return chats || [];
}

export async function rememberTelegramChatId(chatId): Promise<TelegramBotDTO['chats']> {
  return addChat(chatId);
}

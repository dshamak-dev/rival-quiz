import { addChat, getChats } from "./api";

export async function getChatIds() {
  const chats = await getChats().catch(() => []);

  return chats || [];
}

export async function rememberTelegramChatId(chatId): Promise<string[]> {
  return addChat(chatId);
}

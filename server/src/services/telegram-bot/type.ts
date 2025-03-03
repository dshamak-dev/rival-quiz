export type TelegramBotDTO = {
  name: string;
  token: string;
  webAppURL: string;
  enabled: boolean;
  chats?: string[];
};

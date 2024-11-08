import TelegramBot from "node-telegram-bot-api";

export interface BotFunction {
  bot: TelegramBot;
  chatId: number;
  event?: string;
}

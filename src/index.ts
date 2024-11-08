import dotenv from "dotenv";
import TelegramBot from "node-telegram-bot-api";
import slugify from "slugify";
import { startCommand } from "./events/start";
import { balanceCommand } from "./events/balance";
import { airdropHandle } from "./events/airdrop";
import { buyUSDTCommand } from "./events/buyUSDT";
dotenv.config();
const token = process.env.BOT_SECRET as string;
const bot = new TelegramBot(token, { polling: true });

const commands = [
  { command: "/start", description: "Create your account" },
  { command: "/balance", description: "Can check your wallet balance" },
  { command: "/airdrop", description: "Get Some sol" },
  { command: "/buyusdt_1", description: "Get Some USDT" },
];
bot.setMyCommands(commands);
const inlineKeyboard = {
  reply_markup: {
    inline_keyboard: [
      commands.map((command) => ({
        text: command.command,
        callback_data: command.command,
      })),
    ],
  },
};

const switchCases = async (event: string, bot: TelegramBot, chatId: number) => {
  try {
    switch (event) {
      case "start":
        "";
        await startCommand({ bot, chatId });
        break;
      case "balance":
        await balanceCommand({ bot, chatId });
        break;
      case "airdrop":
        await airdropHandle({ bot, chatId });
        break;
      case "buyusdt_1":
        await buyUSDTCommand({ bot, chatId, event });
        break;
      default:
        await bot.sendMessage(
          chatId,
          "Here are commands for you",
          inlineKeyboard
        );
        break;
    }
  } catch (e) {
    console.log(e);
  }
};

bot.on("message", async (msg) => {
  const event = slugify(msg.text?.trim() ?? "");
  const chatId = msg.chat.id;
  if (!event) {
    await bot.sendMessage(chatId, "Please send valid message");
    return;
  }
  await switchCases(event, bot, chatId);
});

bot.on("callback_query", async (callback_query) => {
  const aciton = slugify(callback_query.data?.trim() ?? "");
  const chatId = callback_query.from.id;

  if (!aciton) return;
  await switchCases(aciton, bot, chatId);
});

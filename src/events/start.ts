import TelegramBot from "node-telegram-bot-api";
import { db } from "../lib/db";
import { getKeyPair } from "../lib/utils";
export const startCommand = async ({
  bot,
  chatId,
}: {
  bot: TelegramBot;
  chatId: number;
}) => {
  await bot.sendMessage(
    chatId,
    "Welcome sir, \nPlease wait while we are loading your data"
  );
  const isUser = await db.user.findUnique({
    where: {
      uuid: String(chatId),
    },
  });
  if (isUser) {
    await bot.sendMessage(
      chatId,
      `Welcome user, \nYour public key is \`${isUser.pubKey}\``,
      { parse_mode: "MarkdownV2" }
    );
    return;
  }

  //creating a new user and his wallet as per the user id
  await db.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        uuid: String(chatId),
      },
    });

    const keypair = getKeyPair(user.id);
    const updatedUser = await tx.user.update({
      where: {
        id: user.id,
      },
      data: {
        pubKey: keypair.publicKey.toBase58(),
      },
    });
    await bot.sendMessage(
      chatId,
      `Welcome user, \nYour public key is \`${updatedUser.pubKey}\``,
      { parse_mode: "MarkdownV2" }
    );
  });
};

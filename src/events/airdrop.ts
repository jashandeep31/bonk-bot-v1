import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { CONNECTION } from "../lib/constants";
import { db } from "../lib/db";
import { BotFunction } from "../types";
import { balanceCommand } from "./balance";

export const airdropHandle = async ({ chatId, bot }: BotFunction) => {
  const user = await db.user.findUnique({
    where: {
      uuid: String(chatId),
    },
  });
  if (!user || !user.pubKey) return;

  await CONNECTION.requestAirdrop(
    new PublicKey(user.pubKey),
    0.05 * LAMPORTS_PER_SOL
  );

  await bot.sendMessage(chatId, "We will soon airdrop you");
  await balanceCommand({ bot, chatId });
};

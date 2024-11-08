import { LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { db } from "../lib/db";
import { BotFunction } from "../types";
import { CONNECTION, MINT_ADDRESS } from "../lib/constants";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";
import { getKeyPair } from "../lib/utils";

export const balanceCommand = async ({ bot, chatId }: BotFunction) => {
  const user = await db.user.findUnique({ where: { uuid: String(chatId) } });
  if (!user || !user.pubKey) {
    await bot.sendMessage(chatId, "Command is not valid for you");
    return;
  }

  const publicKey = new PublicKey(user.pubKey);
  let tokenAccount = await getOrCreateAssociatedTokenAccount(
    CONNECTION,
    getKeyPair(0),
    new PublicKey(MINT_ADDRESS),
    getKeyPair(user.id).publicKey
  );
  const tokenBalance = await CONNECTION.getTokenAccountBalance(
    tokenAccount.address
  );

  const balance = await CONNECTION.getBalance(publicKey);
  await bot.sendMessage(
    chatId,
    `Your current balance is\nSOL: ${balance / LAMPORTS_PER_SOL} \nUSDT: ${
      tokenBalance.value.amount &&
      parseInt(tokenBalance.value.amount) /
        Math.pow(10, tokenBalance.value.decimals)
    }`
  );
  return;
};

import {
  LAMPORTS_PER_SOL,
  PublicKey,
  sendAndConfirmTransaction,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { CONNECTION, MINT_ADDRESS } from "../lib/constants";
import { db } from "../lib/db";
import { BotFunction } from "../types";
import { getKeyPair } from "../lib/utils";
import { balanceCommand } from "./balance";
import {
  createTransferInstruction,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";

export const buyUSDTCommand = async ({ bot, chatId, event }: BotFunction) => {
  if (!event) return;
  //   expected resposne is USDT 1
  const quantity = parseInt(event.split("_")[1]);
  if (isNaN(quantity)) return;

  const currentSOLInUSD = 200;
  const userCharged = quantity * 1;
  const user = await db.user.findUnique({ where: { uuid: String(chatId) } });
  if (!user || !user.pubKey) return;
  const balance =
    ((await CONNECTION.getBalance(new PublicKey(user.pubKey))) /
      LAMPORTS_PER_SOL) *
    currentSOLInUSD;
  console.log(userCharged, balance);

  if (userCharged > balance) {
    await bot.sendMessage(chatId, "you dont' have sufficient balances");
    return;
  }

  await bot.sendMessage(
    chatId,
    `We are buying USDT for you.\nyou will charged ${userCharged}USD and get ${quantity} of USDT \n `
  );

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: new PublicKey(user.pubKey),
      toPubkey: getKeyPair(0).publicKey,
      lamports: LAMPORTS_PER_SOL * (userCharged / currentSOLInUSD),
    })
  );

  await sendAndConfirmTransaction(CONNECTION, transaction, [
    getKeyPair(user.id),
  ]);

  const userPair = getKeyPair(user.id);
  const mainPair = getKeyPair(0);
  const mintPub = new PublicKey(MINT_ADDRESS);
  let sourceAccount = await getOrCreateAssociatedTokenAccount(
    CONNECTION,
    mainPair,
    mintPub,
    mainPair.publicKey
  );
  let destinationAccount = await getOrCreateAssociatedTokenAccount(
    CONNECTION,
    mainPair,
    mintPub,
    userPair.publicKey
  );
  const tx = new Transaction();
  tx.add(
    createTransferInstruction(
      sourceAccount.address,
      destinationAccount.address,
      mainPair.publicKey,
      quantity * Math.pow(10, 6)
    )
  );
  const latestBlockHash = await CONNECTION.getLatestBlockhash("confirmed");
  tx.recentBlockhash = latestBlockHash.blockhash;
  const signature = await sendAndConfirmTransaction(CONNECTION, tx, [mainPair]);

  await balanceCommand({ bot, chatId });
};

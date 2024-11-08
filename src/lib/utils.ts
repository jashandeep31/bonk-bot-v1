import { Keypair } from "@solana/web3.js";
import { MNEMONIC } from "./constants";
import * as bip39 from "bip39";
import { derivePath } from "ed25519-hd-key";

export const getKeyPair = (index: number): Keypair => {
  const seed = bip39.mnemonicToSeedSync(MNEMONIC, "");
  // const hd = HDKey.fromMasterSeed(seed.toString("hex"));
  const path = `m/44'/501'/${index}'/0'`;
  derivePath(path, seed.toString("hex"));

  const keypair = Keypair.fromSeed(derivePath(path, seed.toString("hex")).key);
  return keypair;
};

import { clusterApiUrl, Connection } from "@solana/web3.js";

export const MNEMONIC = process.env.MNEMONIC as string;
export const CONNECTION = new Connection(clusterApiUrl("devnet"), "confirmed");
export const MINT_ADDRESS = process.env.MINT_ADDRESS as string;

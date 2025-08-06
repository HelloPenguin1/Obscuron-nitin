// solanaClient.ts: Setup Anchor Client
import * as anchor from "@project-serum/anchor";
import idl from "./computebounty.json"; 
import { Connection, clusterApiUrl } from "@solana/web3.js";

// Ensure this Program ID matches your deployed program
const programId = new anchor.web3.PublicKey("FzcGDfci4AketBSehtWsvZAoE9k4Kd3ZZNar9nKn3gj3");
const connection = new Connection(clusterApiUrl("devnet")); // Using devnet as per your deployment
// Make sure window.solana (Phantom wallet) is available
const wallet = window.solana;

/**
 * Returns an Anchor Program client instance for your computebounty program.
 * @returns An Anchor Program instance.
 */
export const getProgram = () => {
  if (!wallet || !wallet.isPhantom) {
    throw new Error("Phantom wallet not found or not connected.");
  }
  const provider = new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
  });
  anchor.setProvider(provider);
  return new anchor.Program(idl as anchor.Idl, programId, provider);
};

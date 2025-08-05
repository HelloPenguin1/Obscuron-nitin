
import * as anchor from "@project-serum/anchor";
import idl from "../../public/computebounty.json"; 
import { Connection, clusterApiUrl } from "@solana/web3.js";

const programId = new anchor.web3.PublicKey("FzcGDfci4AketBSehtWsvZAoE9k4Kd3ZZNar9nKn3gj3");
const connection = new Connection(clusterApiUrl("devnet"));
const wallet = window.solana;

export const getProgram = () => {
  const provider = new anchor.AnchorProvider(connection, wallet, {
    preflightCommitment: "confirmed",
  });
  anchor.setProvider(provider);
  return new anchor.Program(idl as anchor.Idl, programId, provider);
};


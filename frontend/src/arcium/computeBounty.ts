// /services/arcium-bounty.ts
import * as anchor from "@coral-xyz/anchor";
import { Program, Idl } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
import {
  getMXEPublicKey,
  getComputationAccAddress,
  getMXEAccAddress,
  getMempoolAccAddress,
  getExecutingPoolAccAddress,
  getCompDefAccAddress,
  getCompDefAccOffset,
  getArciumEnv,
  x25519,
  RescueCipher,
  deserializeLE,
  awaitComputationFinalization,
} from "@arcium-hq/client";
import { randomBytes } from 'tweetnacl-util'; // Use a browser-compatible crypto library

// You will need to import your program's IDL
import { Computebounty } from "./compute_bounty"

const arciumEnv = getArciumEnv();

export async function computeBounty(
  provider: anchor.AnchorProvider,
  programId: PublicKey,
  quality: number,
  effort: number
) {
  const program = new Program<Computebounty>(idl as Computebounty, programId, provider);
  
  // These functions are already from @arcium-hq/client, which should be browser compatible
  const mxePublicKey = await getMXEPublicKey(provider, programId);
  console.log("MXE x25519 pubkey is", mxePublicKey);

  const privateKey = x25519.utils.randomPrivateKey();
  const publicKey = x25519.getPublicKey(privateKey);
  const sharedSecret = x25519.getSharedSecret(privateKey, mxePublicKey);
  const cipher = new RescueCipher(sharedSecret);

  const plaintext = [BigInt(quality), BigInt(effort)];

  const nonce = randomBytes(16);
  const ciphertext = cipher.encrypt(plaintext, nonce);

  const computationOffset = new anchor.BN(randomBytes(8), "hex");

  console.log("Sending bounty transaction...");
  const queueSig = await program.methods
    .bounty(
      computationOffset,
      Array.from(ciphertext[0]),
      Array.from(ciphertext[1]),
      Array.from(publicKey),
      new anchor.BN(deserializeLE(nonce).toString())
    )
    .accountsPartial({
      computationAccount: getComputationAccAddress(program.programId, computationOffset),
      clusterAccount: arciumEnv.arciumClusterPubkey,
      mxeAccount: getMXEAccAddress(program.programId),
      mempoolAccount: getMempoolAccAddress(program.programId),
      executingPool: getExecutingPoolAccAddress(program.programId),
      compDefAccount: getCompDefAccAddress(
        program.programId,
        Buffer.from(getCompDefAccOffset("bounty")).readUInt32LE()
      ),
    })
    .rpc({ commitment: "confirmed" });

  console.log("Transaction sent with signature:", queueSig);

  // Note: Await finalization might be a long-running process.
  // In a real app, you might show a "Loading..." state here.
  console.log("Awaiting computation finalization...");
  const finalizeSig = await awaitComputationFinalization(
    provider,
    computationOffset,
    program.programId,
    "confirmed"
  );
  console.log("Computation finalized with signature:", finalizeSig);
  
  // Awaiting events is also a backend-only feature in this context. 
  // You would need to check for the finalization on-chain or get the result from another method.
  // The provided example does not show how to retrieve the result from the finalized account.
  
  // The decryption logic would happen after you retrieve the result from a state account,
  // not from an event listener in the frontend. You would need to re-fetch the account data.
}
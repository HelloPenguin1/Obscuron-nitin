import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey } from "@solana/web3.js";
// Ensure this path is correct based on your project structure
import { Computebounty } from "../target/types/computebounty"; 
import { randomBytes } from "crypto"; // This is fine for Node.js test environment
import {
  awaitComputationFinalization,
  getArciumEnv,
  getCompDefAccOffset,
  getArciumAccountBaseSeed,
  getArciumProgAddress,
  uploadCircuit,
  buildFinalizeCompDefTx,
  RescueCipher,
  deserializeLE,
  getMXEPublicKey,
  getMXEAccAddress,
  getMempoolAccAddress,
  getCompDefAccAddress,
  getExecutingPoolAccAddress,
  getComputationAccAddress,
  x25519,
} from "@arcium-hq/client";
import * as fs from "fs";
import * as os from "os";
import { expect } from "chai";

// Helper to read keypair JSON (already present, just ensuring it's here)
function readKpJson(path: string): anchor.web3.Keypair {
  const file = fs.readFileSync(path);
  return anchor.web3.Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(file.toString()))
  );
}

// Helper to fetch MXE Public Key with retries (already present)
async function getMXEPublicKeyWithRetry(
  provider: anchor.AnchorProvider,
  programId: PublicKey,
  maxRetries: number = 10,
  retryDelayMs: number = 500
): Promise<Uint8Array> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const mxePublicKey = await getMXEPublicKey(provider, programId);
      if (mxePublicKey) {
        return mxePublicKey;
      }
    } catch (error) {
      console.log(`Attempt ${attempt} failed to fetch MXE public key:`, error);
    }

    if (attempt < maxRetries) {
      console.log(
        `Retrying in ${retryDelayMs}ms... (attempt ${attempt}/${maxRetries})`
      );
      await new Promise((resolve) => setTimeout(resolve, retryDelayMs));
    }
  }

  throw new Error(
    `Failed to fetch MXE public key after ${maxRetries} attempts`
  );
}

// Helper function for initializing computation definition
// Renamed from initAddTogetherCompDef to initBountyCompDef
async function initBountyCompDef(
  program: Program<Computebounty>, // Updated type
  owner: anchor.web3.Keypair,
  provider: anchor.AnchorProvider, // ADDED: Pass provider as an argument
  uploadRawCircuit: boolean,
  offchainSource: boolean
): Promise<string> {
  const baseSeedCompDefAcc = getArciumAccountBaseSeed(
    "ComputationDefinitionAccount"
  );
  // Changed "add_together" to "bounty"
  const offset = getCompDefAccOffset("bounty"); 

  const compDefPDA = PublicKey.findProgramAddressSync(
    [baseSeedCompDefAcc, program.programId.toBuffer(), offset],
    getArciumProgAddress()
  )[0];

  console.log("Comp def pda is ", compDefPDA.toBase58()); // Added toBase58 for readability

  const sig = await program.methods
    // Changed initAddTogetherCompDef to initBountyCompDef
    .initBountyCompDef() 
    .accounts({
      compDefAccount: compDefPDA,
      payer: owner.publicKey,
      mxeAccount: getMXEAccAddress(program.programId),
    })
    .signers([owner])
    .rpc({
      commitment: "confirmed",
      skipPreflight: true, // ADDED: Skip preflight for localnet stability
    });
  console.log("Init bounty computation definition transaction", sig);

  if (uploadRawCircuit) {
    // Ensure "build/bounty.arcis" exists if this path is taken
    const rawCircuit = fs.readFileSync("build/bounty.arcis"); 

    await uploadCircuit(
      provider as anchor.AnchorProvider,
      "bounty", // Changed "add_together" to "bounty"
      program.programId,
      rawCircuit,
      true
    );
  } else if (!offchainSource) {
    const finalizeTx = await buildFinalizeCompDefTx(
      provider as anchor.AnchorProvider,
      Buffer.from(offset).readUInt32LE(), // offset is already u32, ensure correct conversion if needed
      program.programId
    );

    const latestBlockhash = await provider.connection.getLatestBlockhash();
    finalizeTx.recentBlockhash = latestBlockhash.blockhash;
    finalizeTx.lastValidBlockHeight = latestBlockhash.lastValidBlockHeight;

    finalizeTx.sign(owner);

    await provider.sendAndConfirm(finalizeTx);
  }
  return sig;
}


describe("Computebounty Program Tests", () => { // Changed describe name for clarity
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());
  // Changed .Mxe to .computebounty and Program<Mxe> to Program<Computebounty>
  const program = anchor.workspace.computebounty as Program<Computebounty>; 
  const provider = anchor.getProvider();

  type Event = anchor.IdlEvents<(typeof program)["idl"]>;
  const awaitEvent = async <E extends keyof Event>(
    eventName: E
  ): Promise<Event[E]> => {
    let listenerId: number;
    const event = await new Promise<Event[E]>((res) => {
      listenerId = program.addEventListener(eventName, (event) => {
        res(event);
      });
    });
    await program.removeEventListener(listenerId);

    return event;
  };

  const arciumEnv = getArciumEnv();

  it("Should compute and return bounty correctly!", async () => { // Updated test description
    const owner = readKpJson(`${os.homedir()}/.config/solana/id.json`);

    console.log("Initializing bounty computation definition");
    // Changed initAddTogetherCompDef to initBountyCompDef
    const initBountySig = await initBountyCompDef( 
      program,
      owner,
      provider, // ADDED: Pass provider here
      false,
      false
    );
    console.log(
      "Bounty computation definition initialized with signature",
      initBountySig
    );

    const mxePublicKey = await getMXEPublicKeyWithRetry(
      provider as anchor.AnchorProvider,
      program.programId
    );

    console.log("MXE x25519 pubkey is", Buffer.from(mxePublicKey).toString('hex')); // Convert to hex for readability

    const privateKey = x25519.utils.randomPrivateKey();
    const publicKey = x25519.getPublicKey(privateKey);

    const sharedSecret = x25519.getSharedSecret(privateKey, mxePublicKey);
    const cipher = new RescueCipher(sharedSecret);

    const effortScore = BigInt(8); // Example effort score
    const qualityScore = BigInt(9); // Example quality score
    // Ensure plaintext matches BountyInput struct (effort: u8, quality: u8)
    const plaintext: [bigint, bigint] = [effortScore, qualityScore]; 

    const nonce = randomBytes(16);
    // ciphertext will be an array of Uint8Arrays, one for each input
    const ciphertext = cipher.encrypt(plaintext, nonce); 

    // Changed sumEvent to BountyEvent
    const bountyEventPromise = awaitEvent("BountyEvent"); 
    const computationOffset = new anchor.BN(randomBytes(8), "hex");

    const queueSig = await program.methods
      // Changed addTogether to bounty
      .bounty( 
        computationOffset,
        Array.from(ciphertext[0]), // Encrypted effort
        Array.from(ciphertext[1]), // Encrypted quality
        Array.from(publicKey),      // Client's public key
        new anchor.BN(deserializeLE(nonce).toString()) // Nonce
      )
      .accountsPartial({
        computationAccount: getComputationAccAddress(
          program.programId,
          computationOffset
        ),
        clusterAccount: arciumEnv.arciumClusterPubkey,
        mxeAccount: getMXEAccAddress(program.programId),
        mempoolAccount: getMempoolAccAddress(program.programId),
        executingPool: getExecutingPoolAccAddress(program.programId),
        compDefAccount: getCompDefAccAddress(
          program.programId,
          Buffer.from(getCompDefAccOffset("bounty")).readUInt32LE() // Changed "add_together" to "bounty"
        ),
      })
      .rpc({ skipPreflight: true, commitment: "confirmed" });
    console.log("Queue sig is ", queueSig);

    const finalizeSig = await awaitComputationFinalization(
      provider as anchor.AnchorProvider,
      computationOffset,
      program.programId,
      "confirmed"
    );
    console.log("Finalize sig is ", finalizeSig);

    // Changed sumEvent to bountyEvent
    const bountyEvent = await bountyEventPromise; 
    
    // Decrypt the result from the event
    // The event.result is the ciphertext, event.nonce is the nonce
    // cipher.decrypt expects an array of ciphertexts, so wrap bountyEvent.result in an array
    const decryptedValues = cipher.decrypt([new Uint8Array(bountyEvent.result)], new Uint8Array(bountyEvent.nonce));
    const decryptedBounty = decryptedValues[0]; // Assuming the first (and only) decrypted value is the bounty

    // Calculate expected bounty based on your Rust circuit's logic
    // (effort as u64 * 1_000_000) + (quality as u64 * 500_000)
    const expectedBounty = (effortScore * BigInt(1_000_000)) + (qualityScore * BigInt(500_000));

    expect(decryptedBounty).to.equal(expectedBounty);
    console.log(`Decrypted Bounty: ${decryptedBounty.toString()} (Expected: ${expectedBounty.toString()})`);
  });
});

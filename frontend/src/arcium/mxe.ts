
import { x25519, RescueCipher } from "@arcium-hq/client";
import { randomBytes } from "crypto";

export const generateEncryptionArtifacts = (mxePublicKey: Uint8Array, values: [bigint, bigint, bigint]) => {
  const privateKey = x25519.utils.randomPrivateKey();
  const publicKey = x25519.getPublicKey(privateKey);
  const sharedSecret = x25519.getSharedSecret(privateKey, mxePublicKey);
  const cipher = new RescueCipher(sharedSecret);
  const nonce = randomBytes(16);
  const ciphertext = cipher.encrypt(values, nonce);

  return {
    ciphertext,
    publicKey,
    nonce,
  };
};


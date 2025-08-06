// mxe.ts: Encrypt PR Scores
import { x25519, RescueCipher } from "@arcium-hq/client";

/**
 * Generates encryption artifacts (ciphertext, public key, nonce) for the given values.
 * @param mxePublicKey The public key of the MXE cluster.
 * @param values An array of BigInts representing the plaintext inputs (e.g., [effort, quality]).
 * @returns An object containing the ciphertext, client's public key, and nonce.
 */
export const generateEncryptionArtifacts = (mxePublicKey: Uint8Array, values: [bigint, bigint]) => {
  const privateKey = x25519.utils.randomPrivateKey();
  const publicKey = x25519.getPublicKey(privateKey);
  const sharedSecret = x25519.getSharedSecret(privateKey, mxePublicKey);
  const cipher = new RescueCipher(sharedSecret);
  
  // FIX: Replaced crypto.randomBytes with browser-compatible window.crypto.getRandomValues
  const nonce = new Uint8Array(16);
  window.crypto.getRandomValues(nonce); // Generate 16 random bytes for the nonce

  const ciphertext = cipher.encrypt(values, nonce); // Encrypts the array of BigInts

  return {
    ciphertext, // This will be an array of Uint8Array, one for each input value
    publicKey,
    nonce,
    cipher, // Return the cipher instance for decryption later
  };
};

/**
 * Decrypts the given ciphertext using the provided cipher and nonce.
 * @param cipher The RescueCipher instance used for encryption.
 * @param ciphertext An array of Uint8Arrays representing the encrypted output.
 * @param nonce The nonce used for encryption.
 * @returns An array of BigInts representing the decrypted plaintext values.
 */
export const decryptBounty = (cipher: RescueCipher, ciphertext: Uint8Array[], nonce: Uint8Array): bigint[] => {
  return cipher.decrypt(ciphertext, nonce);
};

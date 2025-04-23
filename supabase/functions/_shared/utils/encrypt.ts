import {
  decodeHex,
  encodeHex,
} from "https://deno.land/std@0.208.0/encoding/hex.ts";
import {
  FEEDDECK_ENCRYPTION_IV,
  FEEDDECK_ENCRYPTION_KEY,
} from "./constants.ts";

/**
 * The `generateKey` function is used to generate the values for the
 * `FEEDDECK_ENCRYPTION_KEY` and `FEEDDECK_ENCRYPTION_IV` environment variables,
 * which are used to encryt / decrypt the users account data, before it is
 * stored in the database.
 */
export const generateKey = async (): Promise<{
  rawKey: string;
  iv: string;
}> => {
  const key = await crypto.subtle.generateKey(
    { name: "AES-CBC", length: 128 },
    true,
    ["encrypt", "decrypt"],
  );
  const rawKey = new Uint8Array(await crypto.subtle.exportKey("raw", key));
  return {
    rawKey: encodeHex(rawKey),
    iv: encodeHex(crypto.getRandomValues(new Uint8Array(16))),
  };
};

/**
 * `encrypt` encrypts the provided `plainText` so it can be stored in the
 * database. The values for the required environment variables can be generated
 * using the `generateKey` function.
 */
export const encrypt = async (plainText: string): Promise<string> => {
  const rawKey = decodeHex(FEEDDECK_ENCRYPTION_KEY);
  const key = await crypto.subtle.importKey(
    "raw",
    rawKey.buffer,
    "AES-CBC",
    true,
    ["encrypt", "decrypt"],
  );
  const iv = decodeHex(FEEDDECK_ENCRYPTION_IV);

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    key,
    new TextEncoder().encode(plainText),
  );
  const encryptedBytes = new Uint8Array(encrypted);
  return encodeHex(encryptedBytes);
};

/**
 * `decrypt` decrypts the provided `encryptedText` so it can be used in the
 * application. The values for the required environment variables can be
 * generated using the `generateKey` function.
 */
export const decrypt = async (encryptedText: string): Promise<string> => {
  const rawKey = decodeHex(FEEDDECK_ENCRYPTION_KEY);
  const key = await crypto.subtle.importKey(
    "raw",
    rawKey.buffer,
    "AES-CBC",
    true,
    ["encrypt", "decrypt"],
  );
  const iv = decodeHex(FEEDDECK_ENCRYPTION_IV);

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv },
    key,
    decodeHex(encryptedText),
  );
  const decryptedBytes = new Uint8Array(decrypted);
  return new TextDecoder().decode(decryptedBytes);
};

import { decode, encode } from "std/hex";
import {
  FEEDDECK_ENCRYPTION_IV,
  FEEDDECK_ENCRYPTION_KEY,
} from "./constants.ts";

/**
 * The `generateKey` function is used to generate the values for the `FEEDDECK_ENCRYPTION_KEY` and
 * `FEEDDECK_ENCRYPTION_IV` environment variables, which are used to encryt / decrypt the users account data, before it
 * is stored in the database.
 */
export const generateKey = async (): Promise<
  { rawKey: string; iv: string }
> => {
  const key = await crypto.subtle.generateKey(
    { name: "AES-CBC", length: 128 },
    true,
    ["encrypt", "decrypt"],
  );
  const rawKey = new Uint8Array(await crypto.subtle.exportKey("raw", key));
  return {
    rawKey: new TextDecoder().decode(encode(rawKey)),
    iv: new TextDecoder().decode(
      encode(crypto.getRandomValues(new Uint8Array(16))),
    ),
  };
};

/**
 * `encrypt` encrypts the provided `plainText` so it can be stored in the database. The values for the required
 * environment variables can be generated using the `generateKey` function.
 */
export const encrypt = async (plainText: string): Promise<string> => {
  const rawKey = decode(
    new TextEncoder().encode(FEEDDECK_ENCRYPTION_KEY),
  );
  const key = await crypto.subtle.importKey(
    "raw",
    rawKey.buffer,
    "AES-CBC",
    true,
    ["encrypt", "decrypt"],
  );
  const iv = decode(
    new TextEncoder().encode(FEEDDECK_ENCRYPTION_IV),
  );

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-CBC", iv },
    key,
    new TextEncoder().encode(plainText),
  );
  const encryptedBytes = new Uint8Array(encrypted);
  return new TextDecoder().decode(encode(encryptedBytes));
};

/**
 * `decrypt` decrypts the provided `encryptedText` so it can be used in the application. The values for the required
 * environment variables can be generated using the `generateKey` function.
 */
export const decrypt = async (encryptedText: string): Promise<string> => {
  const rawKey = decode(
    new TextEncoder().encode(FEEDDECK_ENCRYPTION_KEY),
  );
  const key = await crypto.subtle.importKey(
    "raw",
    rawKey.buffer,
    "AES-CBC",
    true,
    ["encrypt", "decrypt"],
  );
  const iv = decode(
    new TextEncoder().encode(FEEDDECK_ENCRYPTION_IV),
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-CBC", iv },
    key,
    decode(new TextEncoder().encode(encryptedText)),
  );
  const decryptedBytes = new Uint8Array(decrypted);
  return new TextDecoder().decode(decryptedBytes);
};

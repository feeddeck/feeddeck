import { crypto } from "https://deno.land/std@0.208.0/crypto/mod.ts";
import { encode } from "https://deno.land/std@0.208.0/encoding/hex.ts";

export const md5 = async (str: string): Promise<string> => {
  return new TextDecoder().decode(
    encode(
      new Uint8Array(
        await crypto.subtle.digest("MD5", new TextEncoder().encode(str)),
      ),
    ),
  );
};

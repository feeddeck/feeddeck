import { crypto } from 'std/crypto';
import { encode } from 'std/hex';

export const md5 = async (str: string): Promise<string> => {
  return new TextDecoder().decode(
    encode(
      new Uint8Array(
        await crypto.subtle.digest('MD5', new TextEncoder().encode(str)),
      ),
    ),
  );
};

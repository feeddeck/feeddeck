const base64URL = (value: string) => {
  return globalThis.btoa(value).replace(/[=]/g, '').replace(/[+]/g, '-')
    .replace(/[\/]/g, '_');
};

const stringToArrayBuffer = (value: string): ArrayBuffer => {
  const buf = new ArrayBuffer(value.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0; i < value.length; i++) {
    bufView[i] = value.charCodeAt(i);
  }
  return buf;
};

const arrayBufferToString = (buf: ArrayBuffer): string => {
  return String.fromCharCode(...new Uint8Array(buf));
};

export const generateAppleSecretKey = async (
  kid: string,
  iss: string,
  sub: string,
  file: string,
): Promise<{ kid: string; jwt: string; exp: number }> => {
  const contents = await Deno.readTextFile(file);

  if (
    !contents.match(/^\s*-+BEGIN PRIVATE KEY-+[^-]+-+END PRIVATE KEY-+\s*$/i)
  ) {
    throw new Error(
      `Chosen file does not appear to be a PEM encoded PKCS8 private key file.`,
    );
  }

  // remove PEM headers and spaces
  const pkcs8 = stringToArrayBuffer(
    globalThis.atob(contents.replace(/-+[^-]+-+/g, '').replace(/\s+/g, '')),
  );

  const privateKey = await globalThis.crypto.subtle.importKey(
    'pkcs8',
    pkcs8,
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true,
    ['sign'],
  );

  const iat = Math.floor(Date.now() / 1000);
  const exp = iat + 180 * 24 * 60 * 60;

  const jwt = [
    base64URL(JSON.stringify({ typ: 'JWT', kid, alg: 'ES256' })),
    base64URL(
      JSON.stringify({
        iss,
        sub,
        iat,
        exp,
        aud: 'https://appleid.apple.com',
      }),
    ),
  ];

  const signature = await globalThis.crypto.subtle.sign(
    {
      name: 'ECDSA',
      hash: 'SHA-256',
    },
    privateKey,
    stringToArrayBuffer(jwt.join('.')),
  );

  jwt.push(base64URL(arrayBufferToString(signature)));

  return { kid, jwt: jwt.join('.'), exp };
};

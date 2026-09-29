import 'server-only';
import { createPrivateKey, createPublicKey, KeyObject } from 'crypto';
import { calculateJwkThumbprint, JWK } from 'jose';

export interface OidcSigningKey {
  privateKey: KeyObject;
  publicKey: KeyObject;
  publicJwk: JWK;
  kid: string;
  alg: string;
}

let cachedSigningKey: Promise<OidcSigningKey> | null = null;

function getAlgorithm(jwk: JWK): string {
  if (jwk.kty === 'RSA') {
    return 'RS256';
  }
  if (jwk.kty === 'EC') {
    if (jwk.crv === 'P-256') {
      return 'ES256';
    }
    if (jwk.crv === 'P-384') {
      return 'ES384';
    }
    if (jwk.crv === 'P-521') {
      return 'ES512';
    }
  }
  throw new Error(`Unsupported OIDC key type ${jwk.kty}.`);
}

async function loadSigningKey(): Promise<OidcSigningKey> {
  const pem = process.env.OIDC_PRIVATE_KEY;
  if (!pem) {
    throw new Error('OIDC_PRIVATE_KEY is not defined.');
  }

  const privateKey = createPrivateKey(pem.replace(/\\n/g, '\n').trim());
  const publicKey = createPublicKey(privateKey);
  const publicJwk = publicKey.export({ format: 'jwk' }) as JWK;
  const alg = getAlgorithm(publicJwk);
  const kid = process.env.OIDC_KEY_ID ?? (await calculateJwkThumbprint(publicJwk, 'sha256'));

  return { privateKey, publicKey, publicJwk: { ...publicJwk, alg, use: 'sig', kid }, kid, alg };
}

export function getOidcSigningKey(): Promise<OidcSigningKey> {
  if (cachedSigningKey == null) {
    cachedSigningKey = loadSigningKey().catch((error) => {
      cachedSigningKey = null;
      throw error;
    });
  }
  return cachedSigningKey;
}

export async function getOidcJwks(): Promise<{ keys: JWK[] }> {
  const { publicJwk } = await getOidcSigningKey();
  return { keys: [publicJwk] };
}

import 'server-only';
import { createHash, timingSafeEqual } from 'crypto';

// Codes, refresh tokens and client secrets are long random values, so a plain SHA-256 is sufficient.
export function hashOidcSecret(value: string): string {
  return createHash('sha256').update(value).digest('base64url');
}

export function getS256CodeChallenge(codeVerifier: string): string {
  return createHash('sha256').update(codeVerifier).digest('base64url');
}

export function isEqualSecret(expected: string, actual: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }
  return timingSafeEqual(expectedBuffer, actualBuffer);
}

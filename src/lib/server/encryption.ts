import 'server-only';
import { JWTPayload, jwtVerify, SignJWT } from 'jose';
import { getServerState } from '@/lib/server/serverState';

export async function encrypt<T extends JWTPayload>(payload: T, expiresAt: number | string | Date) {
  const encodedKey = getServerState().sessionSecret;
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(encodedKey);
}

export async function decrypt<T extends JWTPayload>(session: string | undefined = '') {
  const encodedKey = getServerState().sessionSecret;
  try {
    const { payload } = await jwtVerify<T>(session, encodedKey, {
      algorithms: ['HS256'],
    });
    return payload;
  } catch {
    return null;
  }
}

import 'server-only';
import { cookies } from 'next/headers';
import { JWTPayload } from 'jose';
import { addMonths } from 'date-fns';
import { nanoid } from 'nanoid';
import { decrypt, encrypt } from '@/lib/server/encryption';

const sessionKey = 'session';
export interface SessionPayload extends JWTPayload {
  sessionId: string;
  expiresAt: string;
}

export async function generateSession() {
  const sessionId = nanoid();
  const expiresAt = addMonths(new Date(), 1);
  const session = await encrypt<SessionPayload>({ sessionId, expiresAt: expiresAt.toISOString() }, expiresAt);

  return { sessionId, expiresAt, session };
}

export async function createSession() {
  const { sessionId, expiresAt, session } = await generateSession();
  const cookieStore = await cookies();

  cookieStore.set(sessionKey, session, {
    httpOnly: true,
    secure: true,
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  });
  return { sessionId, expiresAt };
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete(sessionKey);
}

export async function getRawSession() {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(sessionKey)?.value;
  return await decrypt<SessionPayload>(cookie);
}

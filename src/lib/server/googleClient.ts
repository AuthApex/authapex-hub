import 'server-only';
import { getServerState } from '@/lib/server/serverState';

export async function getGoogleSessionFromToken({ token }: { token: string }) {
  const client = getServerState().googleClient;
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: client._clientId,
  });
  const googleId = ticket.getUserId();
  const payload = ticket.getPayload();
  if (!payload || !googleId) {
    return;
  }
  const { email, name, email_verified, picture } = payload;
  if (!email || !name) {
    return;
  }
  return { googleId, email, name, emailVerified: email_verified, profileImageUrl: picture };
}

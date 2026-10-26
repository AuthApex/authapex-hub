import 'server-only';
import { OAuth2Client } from 'google-auth-library';

export function getGoogleClient(): OAuth2Client | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return null;
  }
  return new OAuth2Client(clientId, clientSecret);
}

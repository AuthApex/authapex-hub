import 'server-only';
import { OAuth2Client } from 'google-auth-library';

/**
 * Creates the Google OAuth client, or returns `null` when Google sign-in is not configured.
 *
 * Google sign-in is optional, so a missing client id/secret must not prevent the rest of the hub from working.
 */
export function getGoogleClient(): OAuth2Client | null {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return null;
  }
  return new OAuth2Client(clientId, clientSecret);
}

import 'server-only';
import { OAuth2Client } from 'google-auth-library';

export function getGoogleClient(): OAuth2Client {
  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    throw new Error('Env properties are not defined.');
  }
  return new OAuth2Client(process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
}

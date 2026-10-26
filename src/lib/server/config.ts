import 'server-only';

const DEFAULT_APP_URL = 'https://id.authapex.net';

export function getAppUrl(): string {
  return (process.env.APP_URL?.trim() || DEFAULT_APP_URL).replace(/\/+$/, '');
}

export function getGoogleClientId(): string | null {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return null;
  }
  return clientId;
}

import 'server-only';

const DEFAULT_APP_URL = 'https://id.authapex.net';

/**
 * Public base URL of the hub.
 *
 * Read at runtime so the same image can be deployed to different environments. It is only used on the server; values
 * needed by the browser are passed down by server components or exposed through a runtime config endpoint.
 */
export function getAppUrl(): string {
  return (process.env.APP_URL?.trim() || DEFAULT_APP_URL).replace(/\/+$/, '');
}

/**
 * Google OAuth client id, or `null` when Google sign-in is not configured.
 *
 * This is passed from the server to the sign-in page so the browser does not need a build-time variable. The button is
 * hidden unless both the id and the secret are present, because the secret is required by the server-side token check.
 */
export function getGoogleClientId(): string | null {
  const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return null;
  }
  return clientId;
}

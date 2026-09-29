import 'server-only';
import { timingSafeEqual } from 'crypto';
import { getOidcClient, OidcClient } from '@/lib/server/oidcMongodb';

function isEqual(expected: string, actual: string): boolean {
  const expectedBuffer = Buffer.from(expected);
  const actualBuffer = Buffer.from(actual);
  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }
  return timingSafeEqual(expectedBuffer, actualBuffer);
}

function decodeBasicCredentials(authorizationHeader: string): { clientId: string; clientSecret: string } | null {
  try {
    const decoded = Buffer.from(authorizationHeader.slice(6).trim(), 'base64').toString('utf8');
    const separator = decoded.indexOf(':');
    if (separator < 0) {
      return null;
    }
    return {
      clientId: decodeURIComponent(decoded.slice(0, separator)),
      clientSecret: decodeURIComponent(decoded.slice(separator + 1)),
    };
  } catch {
    return null;
  }
}

export async function authenticateOidcClient(
  authorizationHeader: string | null,
  body: URLSearchParams
): Promise<OidcClient | null> {
  let clientId = body.get('client_id');
  let clientSecret = body.get('client_secret');

  if (authorizationHeader != null && authorizationHeader.toLowerCase().startsWith('basic ')) {
    const credentials = decodeBasicCredentials(authorizationHeader);
    if (credentials == null) {
      return null;
    }
    clientId = credentials.clientId;
    clientSecret = credentials.clientSecret;
  }

  if (!clientId || !clientSecret) {
    return null;
  }

  const client = await getOidcClient(clientId);
  if (client == null || !isEqual(client.clientSecret, clientSecret)) {
    return null;
  }

  return client;
}

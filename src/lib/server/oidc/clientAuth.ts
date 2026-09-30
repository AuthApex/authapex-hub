import 'server-only';
import { getOidcClientWithSecretHash, OidcClient } from '@/lib/server/oidcMongodb';
import { hashOidcSecret, isEqualSecret } from '@/lib/server/oidc/hash';

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

  const client = await getOidcClientWithSecretHash(clientId);
  if (client == null || !isEqualSecret(client.clientSecretHash, hashOidcSecret(clientSecret))) {
    return null;
  }

  return {
    clientId: client.clientId,
    displayName: client.displayName,
    redirectUris: client.redirectUris,
    postLogoutRedirectUris: client.postLogoutRedirectUris,
    scopes: client.scopes,
  };
}

import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { getUserByUserId } from '@/lib/server/mongodb';
import {
  consumeOidcAuthCode,
  consumeOidcRefreshToken,
  getOidcGrant,
  insertOidcRefreshToken,
  OidcClient,
} from '@/lib/server/oidcMongodb';
import { authenticateOidcClient } from '@/lib/server/oidc/clientAuth';
import { signOidcAccessToken, signOidcIdToken } from '@/lib/server/oidc/tokens';
import { OIDC_ACCESS_TOKEN_LIFETIME_SECONDS, OIDC_REFRESH_TOKEN_LIFETIME_SECONDS } from '@/lib/server/oidc/config';

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store', Pragma: 'no-cache' };

function tokenError(error: string, description: string, status = 400) {
  return NextResponse.json({ error, error_description: description }, { status, headers: NO_STORE_HEADERS });
}

async function buildTokenResponse({
  client,
  userId,
  scope,
  nonce,
  authTime,
}: {
  client: OidcClient;
  userId: string;
  scope: string;
  nonce?: string | null;
  authTime: number;
}) {
  const user = await getUserByUserId(userId);
  if (user == null) {
    return tokenError('invalid_grant', 'The user no longer exists.');
  }

  const accessToken = await signOidcAccessToken({ userId, clientId: client.clientId, scope });
  const idToken = await signOidcIdToken({ user, clientId: client.clientId, scope, nonce, authTime, accessToken });

  let refreshToken: string | undefined;
  if (scope.split(' ').includes('offline_access')) {
    refreshToken = nanoid(64);
    await insertOidcRefreshToken({
      token: refreshToken,
      clientId: client.clientId,
      userId,
      scope,
      authTime,
      expiresAt: new Date(Date.now() + OIDC_REFRESH_TOKEN_LIFETIME_SECONDS * 1000),
    });
  }

  return NextResponse.json(
    {
      access_token: accessToken,
      token_type: 'Bearer',
      expires_in: OIDC_ACCESS_TOKEN_LIFETIME_SECONDS,
      id_token: idToken,
      refresh_token: refreshToken,
      scope,
    },
    { headers: NO_STORE_HEADERS }
  );
}

async function handleAuthorizationCodeGrant(client: OidcClient, body: URLSearchParams) {
  const code = body.get('code');
  if (!code) {
    return tokenError('invalid_request', 'The code parameter is missing.');
  }

  const authCode = await consumeOidcAuthCode(code);
  if (authCode == null || authCode.clientId !== client.clientId) {
    return tokenError('invalid_grant', 'The authorization code is not valid.');
  }

  if (new Date(authCode.expiresAt).getTime() < Date.now()) {
    return tokenError('invalid_grant', 'The authorization code has expired.');
  }

  const redirectUri = body.get('redirect_uri');
  if (redirectUri != null && redirectUri !== authCode.redirectUri) {
    return tokenError('invalid_grant', 'The redirect_uri does not match the authorization request.');
  }

  return buildTokenResponse({
    client,
    userId: authCode.userId,
    scope: authCode.scope,
    nonce: authCode.nonce,
    authTime: authCode.authTime,
  });
}

async function handleRefreshTokenGrant(client: OidcClient, body: URLSearchParams) {
  const token = body.get('refresh_token');
  if (!token) {
    return tokenError('invalid_request', 'The refresh_token parameter is missing.');
  }

  const refreshToken = await consumeOidcRefreshToken(token);
  if (refreshToken == null || refreshToken.clientId !== client.clientId) {
    return tokenError('invalid_grant', 'The refresh token is not valid.');
  }

  if (new Date(refreshToken.expiresAt).getTime() < Date.now()) {
    return tokenError('invalid_grant', 'The refresh token has expired.');
  }

  const grant = await getOidcGrant(client.clientId, refreshToken.userId);
  if (grant == null) {
    return tokenError('invalid_grant', 'The user has revoked access for this application.');
  }

  const grantedScopes = refreshToken.scope.split(' ').filter(Boolean);
  const requestedScopes = (body.get('scope') ?? '').split(/\s+/).filter(Boolean);
  const scopes =
    requestedScopes.length > 0 ? requestedScopes.filter((scope) => grantedScopes.includes(scope)) : grantedScopes;

  if (!scopes.includes('openid')) {
    return tokenError('invalid_scope', 'The openid scope is required.');
  }

  return buildTokenResponse({
    client,
    userId: refreshToken.userId,
    scope: scopes.join(' '),
    authTime: refreshToken.authTime,
  });
}

export async function POST(request: NextRequest) {
  const body = new URLSearchParams(await request.text());

  const client = await authenticateOidcClient(request.headers.get('authorization'), body);
  if (client == null) {
    return NextResponse.json(
      { error: 'invalid_client', error_description: 'Client authentication failed.' },
      { status: 401, headers: { ...NO_STORE_HEADERS, 'WWW-Authenticate': 'Basic realm="oidc"' } }
    );
  }

  try {
    const grantType = body.get('grant_type');
    if (grantType === 'authorization_code') {
      return await handleAuthorizationCodeGrant(client, body);
    }
    if (grantType === 'refresh_token') {
      return await handleRefreshTokenGrant(client, body);
    }
    return tokenError('unsupported_grant_type', 'The requested grant type is not supported.');
  } catch (error) {
    console.error('[OIDC Token Endpoint Error]:', error);
    return tokenError('server_error', 'The token could not be issued.', 500);
  }
}

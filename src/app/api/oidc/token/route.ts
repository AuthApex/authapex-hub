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
import { getS256CodeChallenge, isEqualSecret } from '@/lib/server/oidc/hash';

const NO_STORE_HEADERS = { 'Cache-Control': 'no-store', Pragma: 'no-cache' };
const CODE_VERIFIER_PATTERN = /^[A-Za-z0-9\-._~]{43,128}$/;

function tokenError(error: string, description: string, status = 400) {
  return NextResponse.json({ error, error_description: description }, { status, headers: NO_STORE_HEADERS });
}

function parseScope(scope: string | null | undefined): string[] {
  return [...new Set((scope ?? '').split(/\s+/).filter(Boolean))];
}

async function buildTokenResponse({
  client,
  userId,
  familyId,
  scopes,
  refreshTokenScopes,
  nonce,
  authTime,
}: {
  client: OidcClient;
  userId: string;
  familyId: string;
  // Scopes of the issued access and ID token.
  scopes: string[];
  // Scopes kept by the new refresh token. They can be wider than `scopes`, when the client asked for a narrower
  // access token during a refresh.
  refreshTokenScopes: string[];
  nonce?: string | null;
  authTime: number;
}) {
  const user = await getUserByUserId(userId);
  if (user == null) {
    return tokenError('invalid_grant', 'The user no longer exists.');
  }

  const scope = scopes.join(' ');
  const accessToken = await signOidcAccessToken({ userId, clientId: client.clientId, scope });
  const idToken = await signOidcIdToken({ user, clientId: client.clientId, scope, nonce, authTime, accessToken });

  let refreshToken: string | undefined;
  if (refreshTokenScopes.includes('offline_access')) {
    refreshToken = nanoid(64);
    const result = await insertOidcRefreshToken(refreshToken, {
      familyId,
      clientId: client.clientId,
      userId,
      scope: refreshTokenScopes.join(' '),
      authTime,
      expiresAt: new Date(Date.now() + OIDC_REFRESH_TOKEN_LIFETIME_SECONDS * 1000),
    });
    if (!result.success) {
      return tokenError('server_error', 'The refresh token could not be issued.', 500);
    }
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

  const result = await consumeOidcAuthCode(code);
  if (result.type === 'reused') {
    console.warn(`[OIDC Token Endpoint]: Authorization code replay, revoked its tokens (client ${client.clientId}).`);
    return tokenError('invalid_grant', 'The authorization code has already been used.');
  }
  if (result.type === 'invalid' || result.value.clientId !== client.clientId) {
    return tokenError('invalid_grant', 'The authorization code is not valid.');
  }
  const authCode = result.value;

  if (new Date(authCode.expiresAt).getTime() < Date.now()) {
    return tokenError('invalid_grant', 'The authorization code has expired.');
  }

  // The authorize endpoint always requires redirect_uri, so it is required here as well (RFC 6749, section 4.1.3).
  if (body.get('redirect_uri') !== authCode.redirectUri) {
    return tokenError('invalid_grant', 'The redirect_uri is missing or does not match the authorization request.');
  }

  const codeVerifier = body.get('code_verifier');
  if (authCode.codeChallenge) {
    if (
      codeVerifier == null ||
      !CODE_VERIFIER_PATTERN.test(codeVerifier) ||
      !isEqualSecret(authCode.codeChallenge, getS256CodeChallenge(codeVerifier))
    ) {
      return tokenError('invalid_grant', 'The code_verifier is missing or does not match the code_challenge.');
    }
  } else if (codeVerifier != null) {
    return tokenError(
      'invalid_grant',
      'A code_verifier was sent, but the authorization request had no code_challenge.'
    );
  }

  const scopes = parseScope(authCode.scope);
  return buildTokenResponse({
    client,
    userId: authCode.userId,
    familyId: authCode.familyId,
    scopes,
    refreshTokenScopes: scopes,
    nonce: authCode.nonce,
    authTime: authCode.authTime,
  });
}

async function handleRefreshTokenGrant(client: OidcClient, body: URLSearchParams) {
  const token = body.get('refresh_token');
  if (!token) {
    return tokenError('invalid_request', 'The refresh_token parameter is missing.');
  }

  const result = await consumeOidcRefreshToken(token);
  if (result.type === 'reused') {
    // Either the client or an attacker holds a copy of a rotated token, so the whole token family is revoked.
    console.warn(`[OIDC Token Endpoint]: Refresh token reuse, revoked its token family (client ${client.clientId}).`);
    return tokenError('invalid_grant', 'The refresh token has already been used.');
  }
  if (result.type === 'invalid' || result.value.clientId !== client.clientId) {
    return tokenError('invalid_grant', 'The refresh token is not valid.');
  }
  const refreshToken = result.value;

  if (new Date(refreshToken.expiresAt).getTime() < Date.now()) {
    return tokenError('invalid_grant', 'The refresh token has expired.');
  }

  const grant = await getOidcGrant(client.clientId, refreshToken.userId);
  if (grant == null) {
    return tokenError('invalid_grant', 'The user has revoked access for this application.');
  }

  const grantScopes = parseScope(grant.scope);
  const refreshTokenScopes = parseScope(refreshToken.scope).filter((scope) => grantScopes.includes(scope));
  const requestedScopes = parseScope(body.get('scope'));

  // A refresh request may narrow the scope, but never widen it (RFC 6749, section 6).
  if (requestedScopes.some((scope) => !refreshTokenScopes.includes(scope))) {
    return tokenError('invalid_scope', 'The requested scope exceeds the scope granted by the user.');
  }

  const scopes = requestedScopes.length > 0 ? requestedScopes : refreshTokenScopes;
  if (!scopes.includes('openid')) {
    return tokenError('invalid_scope', 'The openid scope is required.');
  }

  return buildTokenResponse({
    client,
    userId: refreshToken.userId,
    familyId: refreshToken.familyId,
    scopes,
    refreshTokenScopes,
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

import 'server-only';
import { cookies } from 'next/headers';
import { JWTPayload } from 'jose';
import { decrypt, encrypt } from '@/lib/server/encryption';
import { getOidcClient, OidcClient } from '@/lib/server/oidcMongodb';
import { isAllowedOidcRedirectUri } from '@/lib/server/oidc/redirectUri';
import {
  OIDC_DEFAULT_SCOPES,
  OIDC_REQUEST_COOKIE,
  OIDC_REQUEST_LIFETIME_SECONDS,
  OIDC_SUPPORTED_SCOPES,
} from '@/lib/server/oidc/config';

export interface OidcRequestPayload extends JWTPayload {
  params: string;
}

export interface OidcAuthorizationRequest {
  client: OidcClient;
  redirectUri: string;
  scopes: string[];
  state: string | null;
  nonce: string | null;
  prompt: string[];
  codeChallenge: string | null;
  codeChallengeMethod: 'S256' | null;
  params: string;
}

// A S256 challenge is a base64url encoded SHA-256 digest, which is always 43 characters long.
const S256_CODE_CHALLENGE_PATTERN = /^[A-Za-z0-9_-]{43}$/;
const MAX_AGE_PATTERN = /^\d{1,10}$/;
const SUPPORTED_PROMPTS = ['none', 'login', 'consent', 'select_account'];

export type OidcAuthorizationRequestResult =
  | { type: 'valid'; request: OidcAuthorizationRequest }
  | { type: 'invalid' }
  | { type: 'error'; redirectUri: string; state: string | null; error: string; description: string };

function getAllowedScopes(client: OidcClient): string[] {
  const allowed = client.scopes.length > 0 ? client.scopes : OIDC_DEFAULT_SCOPES;
  return allowed.filter((scope) => OIDC_SUPPORTED_SCOPES.includes(scope));
}

export async function resolveOidcAuthorizationRequest(
  params: URLSearchParams
): Promise<OidcAuthorizationRequestResult> {
  const clientId = params.get('client_id');
  const redirectUri = params.get('redirect_uri');
  const state = params.get('state');

  if (!clientId || !redirectUri) {
    return { type: 'invalid' };
  }

  const client = await getOidcClient(clientId);
  if (client == null || !client.redirectUris.includes(redirectUri) || !isAllowedOidcRedirectUri(redirectUri)) {
    return { type: 'invalid' };
  }

  if (params.get('response_type') !== 'code') {
    return {
      type: 'error',
      redirectUri,
      state,
      error: 'unsupported_response_type',
      description: 'Only the authorization code flow is supported.',
    };
  }

  const responseMode = params.get('response_mode');
  if (responseMode != null && responseMode !== 'query') {
    return {
      type: 'error',
      redirectUri,
      state,
      error: 'unsupported_response_type',
      description: 'Only the query response mode is supported.',
    };
  }

  const requestedScopes = (params.get('scope') ?? '').split(/\s+/).filter(Boolean);
  if (!requestedScopes.includes('openid')) {
    return {
      type: 'error',
      redirectUri,
      state,
      error: 'invalid_scope',
      description: 'The openid scope is required.',
    };
  }

  const codeChallenge = params.get('code_challenge');
  const codeChallengeMethod = params.get('code_challenge_method');
  if (codeChallenge == null && codeChallengeMethod != null) {
    return {
      type: 'error',
      redirectUri,
      state,
      error: 'invalid_request',
      description: 'The code_challenge parameter is missing.',
    };
  }
  if (codeChallenge != null) {
    if (codeChallengeMethod !== 'S256') {
      return {
        type: 'error',
        redirectUri,
        state,
        error: 'invalid_request',
        description: 'Only the S256 code_challenge_method is supported.',
      };
    }
    if (!S256_CODE_CHALLENGE_PATTERN.test(codeChallenge)) {
      return {
        type: 'error',
        redirectUri,
        state,
        error: 'invalid_request',
        description: 'The code_challenge parameter is not valid.',
      };
    }
  }

  const prompt = parsePrompt(params.get('prompt'));
  if (prompt.includes('none') && prompt.length > 1) {
    return {
      type: 'error',
      redirectUri,
      state,
      error: 'invalid_request',
      description: 'The prompt value none cannot be combined with other values.',
    };
  }

  const allowedScopes = getAllowedScopes(client);
  const scopes = [
    'openid',
    ...new Set(requestedScopes.filter((scope) => scope !== 'openid' && allowedScopes.includes(scope))),
  ];

  return {
    type: 'valid',
    request: {
      client,
      redirectUri,
      scopes,
      state,
      nonce: params.get('nonce'),
      prompt,
      codeChallenge,
      codeChallengeMethod: codeChallenge != null ? 'S256' : null,
      params: params.toString(),
    },
  };
}

function parsePrompt(prompt: string | null): string[] {
  return [...new Set((prompt ?? '').split(/\s+/).filter((value) => SUPPORTED_PROMPTS.includes(value)))];
}

// Once the user signed in again, prompt=login / select_account and max_age are fulfilled. They are removed from the
// resumed request, otherwise the authorize endpoint would ask for another sign in forever.
export function getParamsAfterSignin(params: string): string {
  const searchParams = new URLSearchParams(params);
  const prompt = parsePrompt(searchParams.get('prompt')).filter(
    (value) => value !== 'login' && value !== 'select_account'
  );
  if (prompt.length > 0) {
    searchParams.set('prompt', prompt.join(' '));
  } else {
    searchParams.delete('prompt');
  }
  searchParams.delete('max_age');
  return searchParams.toString();
}

export function buildOidcErrorRedirect(
  redirectUri: string,
  state: string | null,
  error: string,
  description: string
): URL {
  const url = new URL(redirectUri);
  url.searchParams.set('error', error);
  url.searchParams.set('error_description', description);
  if (state) {
    url.searchParams.set('state', state);
  }
  return url;
}

export async function createOidcRequestToken(params: string): Promise<string> {
  return encrypt<OidcRequestPayload>({ params }, `${OIDC_REQUEST_LIFETIME_SECONDS}s`);
}

export function getOidcRequestCookieOptions() {
  return {
    httpOnly: true,
    secure: !process.env.DEVELOPMENT,
    maxAge: OIDC_REQUEST_LIFETIME_SECONDS,
    sameSite: 'lax' as const,
    path: '/',
  };
}

export async function getOidcRequestParams(): Promise<string | null> {
  const cookieStore = await cookies();
  const payload = await decrypt<OidcRequestPayload>(cookieStore.get(OIDC_REQUEST_COOKIE)?.value);
  return payload?.params ?? null;
}

export async function clearOidcRequestCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(OIDC_REQUEST_COOKIE);
}

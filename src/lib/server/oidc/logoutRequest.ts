import 'server-only';
import { cookies } from 'next/headers';
import { JWTPayload } from 'jose';
import { decrypt, encrypt } from '@/lib/server/encryption';
import { getOidcClient, OidcClient } from '@/lib/server/oidcMongodb';
import { isAllowedOidcRedirectUri } from '@/lib/server/oidc/redirectUri';
import { verifyOidcIdTokenHint } from '@/lib/server/oidc/tokens';
import { OIDC_LOGOUT_REQUEST_COOKIE, OIDC_LOGOUT_REQUEST_LIFETIME_SECONDS } from '@/lib/server/oidc/config';
import { getOidcRequestCookieOptions } from '@/lib/server/oidc/authorizationRequest';

export interface OidcLogoutRequestPayload extends JWTPayload {
  logoutParams: string;
}

export interface OidcLogoutRequest {
  client: OidcClient | null;
  postLogoutRedirectUri: string | null;
  state: string | null;
  hintSubject: string | null;
  params: string;
}

export type OidcLogoutRequestResult = { type: 'valid'; request: OidcLogoutRequest } | { type: 'invalid' };

export async function resolveOidcLogoutRequest(params: URLSearchParams): Promise<OidcLogoutRequestResult> {
  const idTokenHint = params.get('id_token_hint');
  const clientIdParam = params.get('client_id');
  const postLogoutRedirectUri = params.get('post_logout_redirect_uri');
  const state = params.get('state');

  const hint = idTokenHint ? await verifyOidcIdTokenHint(idTokenHint) : null;
  if (idTokenHint && hint == null) {
    return { type: 'invalid' };
  }
  if (hint != null && clientIdParam != null && hint.clientId !== clientIdParam) {
    return { type: 'invalid' };
  }

  const clientId = clientIdParam ?? hint?.clientId ?? null;
  const client = clientId != null ? await getOidcClient(clientId) : null;
  if (clientIdParam != null && client == null) {
    return { type: 'invalid' };
  }

  if (
    postLogoutRedirectUri != null &&
    (client == null ||
      !client.postLogoutRedirectUris.includes(postLogoutRedirectUri) ||
      !isAllowedOidcRedirectUri(postLogoutRedirectUri))
  ) {
    return { type: 'invalid' };
  }

  return {
    type: 'valid',
    request: {
      client,
      postLogoutRedirectUri,
      state,
      hintSubject: hint?.sub ?? null,
      params: params.toString(),
    },
  };
}

export function getPostLogoutRedirect(request: OidcLogoutRequest): URL | null {
  if (request.postLogoutRedirectUri == null) {
    return null;
  }
  const url = new URL(request.postLogoutRedirectUri);
  if (request.state) {
    url.searchParams.set('state', request.state);
  }
  return url;
}

export async function createOidcLogoutRequestToken(params: string): Promise<string> {
  return encrypt<OidcLogoutRequestPayload>({ logoutParams: params }, `${OIDC_LOGOUT_REQUEST_LIFETIME_SECONDS}s`);
}

export function getOidcLogoutRequestCookieOptions() {
  return { ...getOidcRequestCookieOptions(), maxAge: OIDC_LOGOUT_REQUEST_LIFETIME_SECONDS };
}

export async function getOidcLogoutRequestParams(): Promise<string | null> {
  const cookieStore = await cookies();
  const payload = await decrypt<OidcLogoutRequestPayload>(cookieStore.get(OIDC_LOGOUT_REQUEST_COOKIE)?.value);
  return typeof payload?.logoutParams === 'string' ? payload.logoutParams : null;
}

export async function clearOidcLogoutRequestCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(OIDC_LOGOUT_REQUEST_COOKIE);
}

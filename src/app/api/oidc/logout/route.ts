import { NextRequest, NextResponse } from 'next/server';
import { decodeJwt } from 'jose';
import { getAuth } from '@/lib/actions/auth';
import { invalidateSession } from '@/lib/server/mongodb';
import { getOidcClient, removeOidcUserTokens } from '@/lib/server/oidcMongodb';
import { getOidcIssuer, OIDC_REQUEST_COOKIE } from '@/lib/server/oidc/config';
import { sessionKey } from '@/lib/server/session';

function getClientIdFromParams(params: URLSearchParams): string | null {
  const clientId = params.get('client_id');
  if (clientId) {
    return clientId;
  }

  const idTokenHint = params.get('id_token_hint');
  if (!idTokenHint) {
    return null;
  }

  try {
    const audience = decodeJwt(idTokenHint).aud;
    if (typeof audience === 'string') {
      return audience;
    }
    return Array.isArray(audience) ? (audience[0] ?? null) : null;
  } catch {
    return null;
  }
}

async function getPostLogoutRedirect(params: URLSearchParams): Promise<URL> {
  const issuerHome = new URL('/', getOidcIssuer());
  const postLogoutRedirectUri = params.get('post_logout_redirect_uri');
  if (!postLogoutRedirectUri) {
    return issuerHome;
  }

  const clientId = getClientIdFromParams(params);
  if (clientId == null) {
    return issuerHome;
  }

  const client = await getOidcClient(clientId);
  if (client == null) {
    return issuerHome;
  }

  try {
    const target = new URL(postLogoutRedirectUri);
    const allowedOrigins = client.redirectUris.map((redirectUri) => new URL(redirectUri).origin);
    if (!allowedOrigins.includes(target.origin)) {
      return issuerHome;
    }
    const state = params.get('state');
    if (state) {
      target.searchParams.set('state', state);
    }
    return target;
  } catch {
    return issuerHome;
  }
}

async function handleLogout(params: URLSearchParams) {
  const auth = await getAuth();
  if (auth.isAuth) {
    await invalidateSession({ sessionId: auth.sessionId });
    await removeOidcUserTokens(auth.user.userId);
  }

  const response = NextResponse.redirect(await getPostLogoutRedirect(params));
  response.cookies.delete(sessionKey);
  response.cookies.delete(OIDC_REQUEST_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  return handleLogout(request.nextUrl.searchParams);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const params = new URLSearchParams();
  formData.forEach((value, key) => {
    if (typeof value === 'string') {
      params.append(key, value);
    }
  });
  return handleLogout(params);
}

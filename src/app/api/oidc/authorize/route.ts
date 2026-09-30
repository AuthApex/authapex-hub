import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { getAuth } from '@/lib/actions/auth';
import { getSessionAuthTime, invalidateSession } from '@/lib/server/mongodb';
import { getOidcGrant, insertOidcAuthCode } from '@/lib/server/oidcMongodb';
import {
  buildOidcErrorRedirect,
  createOidcRequestToken,
  getOidcRequestCookieOptions,
  getParamsAfterSignin,
  resolveOidcAuthorizationRequest,
} from '@/lib/server/oidc/authorizationRequest';
import { getOidcIssuer, OIDC_AUTH_CODE_LIFETIME_SECONDS, OIDC_REQUEST_COOKIE } from '@/lib/server/oidc/config';
import { sessionKey } from '@/lib/server/session';
import { OIDC_SIGNIN_FLOW } from '@/lib/consts';

async function redirectToInteraction(path: string, params: string) {
  const response = NextResponse.redirect(new URL(path, getOidcIssuer()));
  response.cookies.set(OIDC_REQUEST_COOKIE, await createOidcRequestToken(params), getOidcRequestCookieOptions());
  return response;
}

async function handleAuthorize(params: URLSearchParams) {
  const resolved = await resolveOidcAuthorizationRequest(params);

  if (resolved.type === 'invalid') {
    return NextResponse.redirect(new URL('/oidc/error', getOidcIssuer()));
  }

  if (resolved.type === 'error') {
    return NextResponse.redirect(
      buildOidcErrorRedirect(resolved.redirectUri, resolved.state, resolved.error, resolved.description)
    );
  }

  const { client, redirectUri, scopes, state, nonce, prompt, maxAge, codeChallenge, codeChallengeMethod } =
    resolved.request;

  const auth = await getAuth();
  const authTime = auth.isAuth ? await getSessionAuthTime(auth.sessionId) : null;
  const isAuthTooOld = authTime != null && maxAge != null && Date.now() - authTime.getTime() > maxAge * 1000;
  // Sessions created before authTime was stored have an unknown sign in time, so they have to sign in again.
  const requiresSignin =
    !auth.isAuth || authTime == null || isAuthTooOld || prompt.includes('login') || prompt.includes('select_account');

  if (requiresSignin) {
    if (prompt.includes('none')) {
      return NextResponse.redirect(
        buildOidcErrorRedirect(redirectUri, state, 'login_required', 'The user has to sign in.')
      );
    }
    const response = await redirectToInteraction(
      `/signin?flow=${OIDC_SIGNIN_FLOW}`,
      getParamsAfterSignin(resolved.request.params)
    );
    if (auth.isAuth) {
      await invalidateSession({ sessionId: auth.sessionId });
      response.cookies.delete(sessionKey);
    }
    return response;
  }

  const grant = await getOidcGrant(client.clientId, auth.user.userId);
  const grantedScopes = grant?.scope.split(' ') ?? [];
  const hasConsent = grant != null && scopes.every((scope) => grantedScopes.includes(scope));

  if (!hasConsent || prompt.includes('consent')) {
    if (prompt.includes('none')) {
      return NextResponse.redirect(
        buildOidcErrorRedirect(redirectUri, state, 'consent_required', 'The user has not granted access yet.')
      );
    }
    return redirectToInteraction('/oidc/consent', resolved.request.params);
  }

  const code = nanoid(48);
  const result = await insertOidcAuthCode(code, {
    familyId: nanoid(),
    clientId: client.clientId,
    userId: auth.user.userId,
    redirectUri,
    scope: scopes.join(' '),
    nonce,
    codeChallenge,
    codeChallengeMethod,
    authTime: Math.floor(authTime.getTime() / 1000),
    expiresAt: new Date(Date.now() + OIDC_AUTH_CODE_LIFETIME_SECONDS * 1000),
  });

  if (!result.success) {
    return NextResponse.redirect(
      buildOidcErrorRedirect(redirectUri, state, 'server_error', 'The authorization code could not be created.')
    );
  }

  const url = new URL(redirectUri);
  url.searchParams.set('code', code);
  if (state) {
    url.searchParams.set('state', state);
  }

  const response = NextResponse.redirect(url);
  response.cookies.delete(OIDC_REQUEST_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  return handleAuthorize(request.nextUrl.searchParams);
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const params = new URLSearchParams();
  formData.forEach((value, key) => {
    if (typeof value === 'string') {
      params.append(key, value);
    }
  });
  return handleAuthorize(params);
}

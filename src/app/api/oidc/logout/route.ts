import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@/lib/actions/auth';
import { invalidateSession } from '@/lib/server/mongodb';
import { sessionKey } from '@/lib/server/session';
import { getOidcIssuer, OIDC_LOGOUT_REQUEST_COOKIE, OIDC_REQUEST_COOKIE } from '@/lib/server/oidc/config';
import {
  createOidcLogoutRequestToken,
  getOidcLogoutRequestCookieOptions,
  getPostLogoutRedirect,
  resolveOidcLogoutRequest,
} from '@/lib/server/oidc/logoutRequest';

async function handleLogout(params: URLSearchParams) {
  const resolved = await resolveOidcLogoutRequest(params);
  if (resolved.type === 'invalid') {
    return NextResponse.redirect(new URL('/oidc/error', getOidcIssuer()));
  }

  const { request } = resolved;
  const target = getPostLogoutRedirect(request) ?? new URL('/signin', getOidcIssuer());

  const auth = await getAuth();
  if (!auth.isAuth) {
    const response = NextResponse.redirect(target);
    response.cookies.delete(OIDC_REQUEST_COOKIE);
    return response;
  }

  if (request.hintSubject !== auth.user.userId) {
    const response = NextResponse.redirect(new URL('/oidc/logout', getOidcIssuer()));
    response.cookies.set(
      OIDC_LOGOUT_REQUEST_COOKIE,
      await createOidcLogoutRequestToken(request.params),
      getOidcLogoutRequestCookieOptions()
    );
    return response;
  }

  await invalidateSession({ sessionId: auth.sessionId });
  const response = NextResponse.redirect(target);
  response.cookies.delete(sessionKey);
  response.cookies.delete(OIDC_REQUEST_COOKIE);
  response.cookies.delete(OIDC_LOGOUT_REQUEST_COOKIE);
  return response;
}

export async function GET(request: NextRequest) {
  return handleLogout(request.nextUrl.searchParams);
}

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.redirect(new URL('/oidc/error', getOidcIssuer()));
  }
  const params = new URLSearchParams();
  formData.forEach((value, key) => {
    if (typeof value === 'string') {
      params.append(key, value);
    }
  });
  return handleLogout(params);
}

'use server';

import { getAuth } from '@/lib/actions/auth';
import { getRoute } from '@/lib/getRoute';
import { addOidcGrantScopes } from '@/lib/server/oidcMongodb';
import { OIDC_SIGNIN_FLOW } from '@/lib/consts';
import {
  buildOidcErrorRedirect,
  clearOidcRequestCookie,
  getOidcRequestParams,
  resolveOidcAuthorizationRequest,
} from '@/lib/server/oidc/authorizationRequest';

export interface OidcRedirectResult {
  redirectUrl: string;
}

export async function approveOidcAuthorization(lang: string): Promise<OidcRedirectResult> {
  const auth = await getAuth();
  if (!auth.isAuth) {
    return { redirectUrl: getRoute(lang, `/signin?flow=${OIDC_SIGNIN_FLOW}`) };
  }

  const params = await getOidcRequestParams();
  if (params == null) {
    return { redirectUrl: getRoute(lang, '/oidc/error') };
  }

  const resolved = await resolveOidcAuthorizationRequest(new URLSearchParams(params));
  if (resolved.type !== 'valid') {
    return { redirectUrl: getRoute(lang, '/oidc/error') };
  }

  const result = await addOidcGrantScopes(resolved.request.client.clientId, auth.user.userId, resolved.request.scopes);
  if (!result.success) {
    return { redirectUrl: getRoute(lang, '/oidc/error') };
  }

  const authorizeParams = new URLSearchParams(params);
  authorizeParams.delete('prompt');

  return { redirectUrl: `/api/oidc/authorize?${authorizeParams.toString()}` };
}

export async function denyOidcAuthorization(lang: string): Promise<OidcRedirectResult> {
  const params = await getOidcRequestParams();
  await clearOidcRequestCookie();

  if (params == null) {
    return { redirectUrl: getRoute(lang, '/') };
  }

  const resolved = await resolveOidcAuthorizationRequest(new URLSearchParams(params));
  if (resolved.type !== 'valid') {
    return { redirectUrl: getRoute(lang, '/') };
  }

  const redirectUrl = buildOidcErrorRedirect(
    resolved.request.redirectUri,
    resolved.request.state,
    'access_denied',
    'The user denied the request.'
  );

  return { redirectUrl: redirectUrl.toString() };
}

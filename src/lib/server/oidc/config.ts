import 'server-only';
import { AUTH_URL } from '@/lib/consts';

export const OIDC_SUPPORTED_SCOPES = ['openid', 'profile', 'email', 'groups', 'offline_access'];
export const OIDC_DEFAULT_SCOPES = ['openid', 'profile', 'email'];

export const OIDC_AUTH_CODE_LIFETIME_SECONDS = 5 * 60;
export const OIDC_ACCESS_TOKEN_LIFETIME_SECONDS = 60 * 60;
export const OIDC_REFRESH_TOKEN_LIFETIME_SECONDS = 30 * 24 * 60 * 60;
export const OIDC_REQUEST_LIFETIME_SECONDS = 15 * 60;

export const OIDC_REQUEST_COOKIE = 'oidc-request';

export function getOidcIssuer(): string {
  return AUTH_URL.replace(/\/+$/, '');
}

export function getOidcEndpoints() {
  const issuer = getOidcIssuer();
  return {
    issuer,
    authorizationEndpoint: `${issuer}/api/oidc/authorize`,
    tokenEndpoint: `${issuer}/api/oidc/token`,
    userinfoEndpoint: `${issuer}/api/oidc/userinfo`,
    jwksUri: `${issuer}/.well-known/jwks.json`,
  };
}

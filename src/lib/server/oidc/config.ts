import 'server-only';

export const OIDC_SUPPORTED_SCOPES = ['openid', 'profile', 'email', 'groups', 'offline_access'];
export const OIDC_DEFAULT_SCOPES = ['openid', 'profile', 'email'];

export const OIDC_AUTH_CODE_LIFETIME_SECONDS = 5 * 60;
export const OIDC_ACCESS_TOKEN_LIFETIME_SECONDS = 60 * 60;
export const OIDC_REFRESH_TOKEN_LIFETIME_SECONDS = 30 * 24 * 60 * 60;
export const OIDC_REQUEST_LIFETIME_SECONDS = 15 * 60;

export const OIDC_REQUEST_COOKIE = 'oidc-request';

export function getOidcIssuer(): string {
  const issuer = process.env.OIDC_ISSUER?.trim().replace(/\/+$/, '');
  if (!issuer) {
    throw new Error('OIDC_ISSUER is not defined.');
  }

  const url = new URL(issuer);
  if (url.protocol !== 'https:' && !process.env.DEVELOPMENT) {
    throw new Error('OIDC_ISSUER must use https.');
  }
  if (url.search || url.hash) {
    throw new Error('OIDC_ISSUER must not contain a query or fragment.');
  }

  return issuer;
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

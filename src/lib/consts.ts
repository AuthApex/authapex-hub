import { AuthorizationService, PermissionService } from '@authapex/core';

export const APP_NAME = 'authapex';

// Marks sign in / sign up pages reached from the OIDC authorize endpoint (`?flow=oidc`).
export const OIDC_SIGNIN_FLOW = 'oidc';

export const AUTHORIZATION_SERVICE = new AuthorizationService({
  authApi: process.env.NEXT_PUBLIC_APP_URL || 'https://id.authapex.net',
  app: APP_NAME,
  redirectUrl: '',
});
export const PERMISSION_SERVICE = new PermissionService({ app: APP_NAME });

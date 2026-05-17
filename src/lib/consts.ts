import { AuthorizationService, PermissionService } from '@authapex/core';

// TODO: Move configs to env
export const AUTH_URL = 'https://id.authapex.net';
export const APP_NAME = 'authapex';
export const REDIRECT_URL = ''; // Not needed

export const AUTHORIZATION_SERVICE = new AuthorizationService({
  authApi: AUTH_URL,
  app: APP_NAME,
  redirectUrl: REDIRECT_URL,
});
export const PERMISSION_SERVICE = new PermissionService({ app: APP_NAME });

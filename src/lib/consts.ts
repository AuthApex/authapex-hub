import { AuthorizationService, PermissionService } from '@authapex/core';

// TODO: Move configs to env
export const AUTH_URL = 'https://id.authapex.net';
export const APP_NAME = 'authapex';
export const REDIRECT_URL = ''; // Not needed

export const AUTHORIZATION_SERVICE = new AuthorizationService(AUTH_URL, APP_NAME, REDIRECT_URL);
export const PERMISSION_SERVICE = new PermissionService(APP_NAME);

export enum VerifiedStatus {
  NO_DATA,
  VERIFIED,
  NOT_VERIFIED,
}

export interface VerifiedStatusResponse {
  status: VerifiedStatus;
  displayName?: string;
}

export interface VerifiedApp {
  name: string;
  displayName: string;
  url: string;
}

export const VERIFIED_APPS: VerifiedApp[] = [
  {
    name: APP_NAME,
    displayName: 'AuthApex',
    url: AUTH_URL,
  },
  {
    name: 'mythranel',
    displayName: 'Mythranel',
    url: 'https://mythranel.net',
  },
  {
    name: 'prvni-sobota',
    displayName: 'První sobota',
    url: 'https://prvni-sobota.cz',
  },
  {
    name: 'galleryeet',
    displayName: 'GallerYeet',
    url: 'https://galleryeet.net',
  },
];

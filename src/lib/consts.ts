import { AuthorizationService } from '@authapex/core';

// TODO: Move configs to env
export const AUTH_URL = 'https://id.authapex.net';
export const APP_NAME = 'authapex';
export const REDIRECT_URL = ''; // Not needed

export const AUTHORIZATION_SERVICE = new AuthorizationService(AUTH_URL, APP_NAME, REDIRECT_URL);

export enum VerifiedStatus {
  NO_DATA,
  VERIFIED,
  NOT_VERIFIED,
}

export interface VerifiedApp {
  name: string;
  url: string;
}

export const VERIFIED_APPS: VerifiedApp[] = [
  {
    name: APP_NAME,
    url: AUTH_URL,
  },
  {
    name: 'gtomy',
    url: 'https://gtomy.net',
  },
  {
    name: 'mythranel',
    url: 'https://mythranel.net',
  },
  {
    name: 'prvni-sobota',
    url: 'https://prvni-sobota.cz',
  },
  {
    name: 'galleryeet',
    url: 'https://galleryeet.net',
  },
];

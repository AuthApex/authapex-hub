import { afterEach, describe, expect, it, vi } from 'vitest';
import { getOidcEndpoints, getOidcIssuer } from './config';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('getOidcIssuer', () => {
  it('returns the configured issuer without trailing slashes', () => {
    vi.stubEnv('OIDC_ISSUER', 'https://id.example.com///');

    expect(getOidcIssuer()).toBe('https://id.example.com');
  });

  it('trims surrounding whitespace', () => {
    vi.stubEnv('OIDC_ISSUER', '  https://id.example.com  ');

    expect(getOidcIssuer()).toBe('https://id.example.com');
  });

  it('rejects a non-https issuer outside development', () => {
    vi.stubEnv('OIDC_ISSUER', 'http://id.example.com');
    vi.stubEnv('DEVELOPMENT', '');

    expect(() => getOidcIssuer()).toThrow('OIDC_ISSUER must use https.');
  });

  it('allows a non-https issuer in development', () => {
    vi.stubEnv('OIDC_ISSUER', 'http://localhost:3000');
    vi.stubEnv('DEVELOPMENT', 'true');

    expect(getOidcIssuer()).toBe('http://localhost:3000');
  });

  it('rejects an issuer with a query or fragment', () => {
    vi.stubEnv('OIDC_ISSUER', 'https://id.example.com?foo=bar');
    expect(() => getOidcIssuer()).toThrow('OIDC_ISSUER must not contain a query or fragment.');

    vi.stubEnv('OIDC_ISSUER', 'https://id.example.com#section');
    expect(() => getOidcIssuer()).toThrow('OIDC_ISSUER must not contain a query or fragment.');
  });

  it('rejects an invalid URL', () => {
    vi.stubEnv('OIDC_ISSUER', 'not a url');

    expect(() => getOidcIssuer()).toThrow();
  });

  it('falls back to NEXT_PUBLIC_APP_URL', async () => {
    vi.resetModules();
    vi.stubEnv('OIDC_ISSUER', '');
    vi.stubEnv('NEXT_PUBLIC_APP_URL', 'https://fallback.example.com/');

    const { getOidcIssuer: getFreshOidcIssuer } = await import('./config');

    expect(getFreshOidcIssuer()).toBe('https://fallback.example.com');
  });

  it('falls back to the production URL when NEXT_PUBLIC_APP_URL is missing', async () => {
    vi.resetModules();
    vi.stubEnv('OIDC_ISSUER', '');
    vi.stubEnv('NEXT_PUBLIC_APP_URL', '');

    const { getOidcIssuer: getFreshOidcIssuer } = await import('./config');

    expect(getFreshOidcIssuer()).toBe('https://id.authapex.net');
  });
});

describe('getOidcEndpoints', () => {
  it('builds all endpoints from the issuer', () => {
    vi.stubEnv('OIDC_ISSUER', 'https://id.example.com/');

    expect(getOidcEndpoints()).toEqual({
      issuer: 'https://id.example.com',
      authorizationEndpoint: 'https://id.example.com/api/oidc/authorize',
      tokenEndpoint: 'https://id.example.com/api/oidc/token',
      userinfoEndpoint: 'https://id.example.com/api/oidc/userinfo',
      jwksUri: 'https://id.example.com/.well-known/jwks.json',
    });
  });
});

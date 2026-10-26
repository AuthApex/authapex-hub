import { describe, expect, it } from 'vitest';
import { isAllowedOidcRedirectUri } from './redirectUri';

describe('isAllowedOidcRedirectUri', () => {
  it.each([
    'https://app.example.com/callback',
    'https://app.example.com/callback?foo=bar',
    'https://app.example.com',
    'http://localhost:3000/callback',
    'http://localhost/callback',
    'http://127.0.0.1:8080/callback',
    'http://[::1]:8080/callback',
    'com.example.app:/oauth2redirect',
    'app.immich:///oauth-callback',
    'com.example.app://callback',
    'COM.Example.App:/callback',
  ])('allows %s', (redirectUri) => {
    expect(isAllowedOidcRedirectUri(redirectUri)).toBe(true);
  });

  it.each([
    ['an empty value', ''],
    ['a relative URI', '/callback'],
    ['a non-URL value', 'not a url'],
    ['a fragment', 'https://app.example.com/callback#token'],
    ['credentials', 'https://user:password@app.example.com/callback'],
    ['a username without password', 'https://user@app.example.com/callback'],
    ['plain http on a public host', 'http://app.example.com/callback'],
    ['plain http on a lookalike loopback host', 'http://localhost.evil.com/callback'],
    ['a private scheme without a dot', 'myapp://callback'],
    ['the javascript scheme', 'javascript:alert(1)'],
    ['the data scheme', 'data:text/plain,hello'],
    ['the file scheme', 'file:///etc/passwd'],
    ['the ftp scheme', 'ftp://app.example.com/callback'],
    ['an https URI without a host', 'https://'],
    ['an invalid port', 'https://app.example.com:not-a-port/callback'],
  ])('rejects %s', (_description, redirectUri) => {
    expect(isAllowedOidcRedirectUri(redirectUri)).toBe(false);
  });
});

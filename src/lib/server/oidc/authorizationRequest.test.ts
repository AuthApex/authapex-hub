import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { getOidcClient } = vi.hoisted(() => ({ getOidcClient: vi.fn() }));

vi.mock('@/lib/server/oidcMongodb', () => ({ getOidcClient }));

import {
  buildOidcErrorRedirect,
  getOidcRequestCookieOptions,
  getParamsAfterSignin,
  resolveOidcAuthorizationRequest,
} from './authorizationRequest';

const client = {
  clientId: 'client-1',
  displayName: 'Test Client',
  redirectUris: [
    'https://app.example.com/callback',
    'https://app.example.com/callback#fragment',
    'http://localhost:3000/callback',
  ],
  scopes: ['openid', 'profile', 'email', 'groups', 'offline_access'],
};

const baseParams = {
  client_id: 'client-1',
  redirect_uri: 'https://app.example.com/callback',
  response_type: 'code',
  scope: 'openid profile email',
  state: 'state-1',
};

function params(overrides: Record<string, string> = {}): URLSearchParams {
  return new URLSearchParams({ ...baseParams, ...overrides });
}

function without(key: string): URLSearchParams {
  const searchParams = params();
  searchParams.delete(key);
  return searchParams;
}

beforeEach(() => {
  getOidcClient.mockReset();
  getOidcClient.mockResolvedValue(client);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('resolveOidcAuthorizationRequest invalid requests', () => {
  it('returns invalid without a client id or redirect URI', async () => {
    expect(await resolveOidcAuthorizationRequest(without('client_id'))).toEqual({ type: 'invalid' });
    expect(await resolveOidcAuthorizationRequest(without('redirect_uri'))).toEqual({ type: 'invalid' });
    expect(getOidcClient).not.toHaveBeenCalled();
  });

  it('returns invalid for an unknown client', async () => {
    getOidcClient.mockResolvedValue(null);

    expect(await resolveOidcAuthorizationRequest(params())).toEqual({ type: 'invalid' });
  });

  it('returns invalid for an unregistered redirect URI', async () => {
    expect(
      await resolveOidcAuthorizationRequest(params({ redirect_uri: 'https://evil.example.com/callback' }))
    ).toEqual({ type: 'invalid' });
  });

  it('returns invalid for a registered but disallowed redirect URI', async () => {
    expect(
      await resolveOidcAuthorizationRequest(params({ redirect_uri: 'https://app.example.com/callback#fragment' }))
    ).toEqual({ type: 'invalid' });
  });
});

describe('resolveOidcAuthorizationRequest protocol validation', () => {
  it('rejects a missing response type', async () => {
    const searchParams = params();
    searchParams.delete('response_type');

    expect(await resolveOidcAuthorizationRequest(searchParams)).toEqual({
      type: 'error',
      redirectUri: 'https://app.example.com/callback',
      state: 'state-1',
      error: 'unsupported_response_type',
      description: 'Only the authorization code flow is supported.',
    });
  });

  it('rejects unsupported response types', async () => {
    for (const responseType of ['token', 'id_token']) {
      expect(await resolveOidcAuthorizationRequest(params({ response_type: responseType }))).toEqual({
        type: 'error',
        redirectUri: 'https://app.example.com/callback',
        state: 'state-1',
        error: 'unsupported_response_type',
        description: 'Only the authorization code flow is supported.',
      });
    }
  });

  it('rejects an unsupported response mode', async () => {
    expect(await resolveOidcAuthorizationRequest(params({ response_mode: 'fragment' }))).toEqual({
      type: 'error',
      redirectUri: 'https://app.example.com/callback',
      state: 'state-1',
      error: 'unsupported_response_type',
      description: 'Only the query response mode is supported.',
    });
  });

  it('accepts the query response mode', async () => {
    expect(await resolveOidcAuthorizationRequest(params({ response_mode: 'query' }))).toMatchObject({
      type: 'valid',
    });
  });

  it('requires the openid scope', async () => {
    expect(await resolveOidcAuthorizationRequest(params({ scope: 'profile email' }))).toEqual({
      type: 'error',
      redirectUri: 'https://app.example.com/callback',
      state: 'state-1',
      error: 'invalid_scope',
      description: 'The openid scope is required.',
    });
  });

  it('rejects a code_challenge without a method', async () => {
    expect(await resolveOidcAuthorizationRequest(params({ code_challenge: 'a'.repeat(43) }))).toEqual({
      type: 'error',
      redirectUri: 'https://app.example.com/callback',
      state: 'state-1',
      error: 'invalid_request',
      description: 'Only the S256 code_challenge_method is supported.',
    });
  });

  it('rejects a code_challenge_method without a code_challenge', async () => {
    expect(await resolveOidcAuthorizationRequest(params({ code_challenge_method: 'S256' }))).toEqual({
      type: 'error',
      redirectUri: 'https://app.example.com/callback',
      state: 'state-1',
      error: 'invalid_request',
      description: 'The code_challenge parameter is missing.',
    });
  });

  it('rejects a non-S256 code_challenge_method', async () => {
    expect(
      await resolveOidcAuthorizationRequest(params({ code_challenge: 'a'.repeat(43), code_challenge_method: 'plain' }))
    ).toMatchObject({
      type: 'error',
      error: 'invalid_request',
      description: 'Only the S256 code_challenge_method is supported.',
    });
  });

  it.each([
    ['too short', 'a'.repeat(42)],
    ['invalid characters', `${'a'.repeat(42)}!`],
    ['too long', 'a'.repeat(44)],
  ])('rejects an invalid code_challenge (%s)', async (_description, challenge) => {
    expect(
      await resolveOidcAuthorizationRequest(params({ code_challenge: challenge, code_challenge_method: 'S256' }))
    ).toMatchObject({
      type: 'error',
      error: 'invalid_request',
      description: 'The code_challenge parameter is not valid.',
    });
  });

  it('rejects prompt none combined with other values', async () => {
    expect(await resolveOidcAuthorizationRequest(params({ prompt: 'none login' }))).toMatchObject({
      type: 'error',
      error: 'invalid_request',
      description: 'The prompt value none cannot be combined with other values.',
    });
  });
});

describe('resolveOidcAuthorizationRequest valid requests', () => {
  it('resolves a minimal request', async () => {
    const searchParams = params();

    expect(await resolveOidcAuthorizationRequest(searchParams)).toEqual({
      type: 'valid',
      request: {
        client,
        redirectUri: 'https://app.example.com/callback',
        scopes: ['openid', 'profile', 'email'],
        state: 'state-1',
        nonce: null,
        prompt: [],
        codeChallenge: null,
        codeChallengeMethod: null,
        params: searchParams.toString(),
      },
    });
  });

  it('keeps the nonce and supported prompt values', async () => {
    const result = await resolveOidcAuthorizationRequest(
      params({ nonce: 'nonce-1', prompt: 'login consent login unknown' })
    );

    expect(result).toMatchObject({
      type: 'valid',
      request: { nonce: 'nonce-1', prompt: ['login', 'consent'] },
    });
  });

  it('accepts prompt none on its own', async () => {
    expect(await resolveOidcAuthorizationRequest(params({ prompt: 'none' }))).toMatchObject({
      type: 'valid',
      request: { prompt: ['none'] },
    });
  });

  it('accepts a valid S256 code challenge', async () => {
    const challenge = 'a'.repeat(43);

    expect(
      await resolveOidcAuthorizationRequest(params({ code_challenge: challenge, code_challenge_method: 'S256' }))
    ).toMatchObject({
      type: 'valid',
      request: { codeChallenge: challenge, codeChallengeMethod: 'S256' },
    });
  });

  it('filters unsupported and duplicate scopes', async () => {
    const result = await resolveOidcAuthorizationRequest(
      params({ scope: 'openid openid profile unknown groups profile' })
    );

    expect(result).toMatchObject({
      type: 'valid',
      request: { scopes: ['openid', 'profile', 'groups'] },
    });
  });

  it('falls back to the default scopes when the client allows none explicitly', async () => {
    getOidcClient.mockResolvedValue({ ...client, scopes: [] });

    expect(await resolveOidcAuthorizationRequest(params({ scope: 'openid groups' }))).toMatchObject({
      type: 'valid',
      request: { scopes: ['openid'] },
    });
  });

  it('only includes scopes the client is allowed to request', async () => {
    getOidcClient.mockResolvedValue({ ...client, scopes: ['openid', 'weird'] });

    expect(await resolveOidcAuthorizationRequest(params({ scope: 'openid weird profile' }))).toMatchObject({
      type: 'valid',
      request: { scopes: ['openid'] },
    });
  });

  it('returns a null state when none was sent', async () => {
    const searchParams = without('state');

    expect(await resolveOidcAuthorizationRequest(searchParams)).toMatchObject({
      type: 'valid',
      request: { state: null },
    });
  });
});

describe('getParamsAfterSignin', () => {
  it('removes login and select_account from the prompt', () => {
    const result = new URLSearchParams(getParamsAfterSignin('prompt=login+consent+select_account&client_id=client-1'));

    expect(result.get('prompt')).toBe('consent');
    expect(result.get('client_id')).toBe('client-1');
  });

  it('removes the prompt parameter when no values remain', () => {
    const result = new URLSearchParams(getParamsAfterSignin('prompt=login+select_account&client_id=client-1'));

    expect(result.has('prompt')).toBe(false);
    expect(result.get('client_id')).toBe('client-1');
  });

  it('deduplicates remaining prompt values', () => {
    const result = new URLSearchParams(getParamsAfterSignin('prompt=consent+consent+none'));

    expect(result.get('prompt')).toBe('consent none');
  });

  it('handles empty input', () => {
    expect(getParamsAfterSignin('')).toBe('');
  });
});

describe('buildOidcErrorRedirect', () => {
  it('adds the error, description and state to the redirect URI', () => {
    const url = buildOidcErrorRedirect(
      'https://app.example.com/callback?foo=bar',
      'state-1',
      'access_denied',
      'The user denied the request.'
    );

    expect(url.origin).toBe('https://app.example.com');
    expect(url.pathname).toBe('/callback');
    expect(Object.fromEntries(url.searchParams)).toEqual({
      foo: 'bar',
      error: 'access_denied',
      error_description: 'The user denied the request.',
      state: 'state-1',
    });
  });

  it('omits the state when none was sent', () => {
    const url = buildOidcErrorRedirect('https://app.example.com/callback', null, 'server_error', 'Oops');

    expect(url.searchParams.has('state')).toBe(false);
    expect(url.searchParams.get('error')).toBe('server_error');
    expect(url.searchParams.get('error_description')).toBe('Oops');
  });
});

describe('getOidcRequestCookieOptions', () => {
  it('uses secure cookies outside development', () => {
    vi.stubEnv('DEVELOPMENT', '');

    expect(getOidcRequestCookieOptions()).toEqual({
      httpOnly: true,
      secure: true,
      maxAge: 15 * 60,
      sameSite: 'lax',
      path: '/',
    });

    vi.unstubAllEnvs();
  });

  it('disables secure cookies in development', () => {
    vi.stubEnv('DEVELOPMENT', 'true');

    expect(getOidcRequestCookieOptions()).toMatchObject({ secure: false });

    vi.unstubAllEnvs();
  });
});

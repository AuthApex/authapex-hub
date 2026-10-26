import { afterEach, describe, expect, it, vi } from 'vitest';
import { getAppUrl, getGoogleClientId } from './config';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('getAppUrl', () => {
  it('reads APP_URL at runtime and removes trailing slashes', () => {
    vi.stubEnv('APP_URL', ' https://id.example.com/// ');

    expect(getAppUrl()).toBe('https://id.example.com');
  });

  it('falls back to the production URL', () => {
    vi.stubEnv('APP_URL', '');

    expect(getAppUrl()).toBe('https://id.authapex.net');
  });
});

describe('getGoogleClientId', () => {
  it('returns the runtime Google client id', () => {
    vi.stubEnv('GOOGLE_CLIENT_ID', ' google-client-id ');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'google-client-secret');

    expect(getGoogleClientId()).toBe('google-client-id');
  });

  it('returns null when Google sign-in is not configured', () => {
    vi.stubEnv('GOOGLE_CLIENT_ID', '');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', '');

    expect(getGoogleClientId()).toBeNull();
  });

  it('returns null when only the client id is configured', () => {
    vi.stubEnv('GOOGLE_CLIENT_ID', 'google-client-id');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', '');

    expect(getGoogleClientId()).toBeNull();
  });
});

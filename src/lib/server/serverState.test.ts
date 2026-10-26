import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getServerState } from './serverState';

function clearServerState(): void {
  delete (globalThis as { serverState?: unknown }).serverState;
}

beforeEach(() => {
  clearServerState();
  vi.stubEnv('SESSION_SECRET', 'test-session-secret');
  vi.stubEnv('MONGODB_DB_NAME', 'test-db');
  vi.stubEnv('MONGODB_URI', 'mongodb://127.0.0.1:27017');
  vi.stubEnv('GOOGLE_CLIENT_ID', '');
  vi.stubEnv('GOOGLE_CLIENT_SECRET', '');
  vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', '');
  vi.stubEnv('CLOUDFLARE_API_KEY', '');
});

afterEach(() => {
  clearServerState();
  vi.unstubAllEnvs();
});

describe('getServerState', () => {
  it('does not require the optional Google or Cloudflare variables', () => {
    const state = getServerState();

    expect(state.googleClient).toBeNull();
    expect(state.cloudflareImages).toBeNull();
  });

  it('creates the optional clients when they are configured', () => {
    vi.stubEnv('GOOGLE_CLIENT_ID', 'google-client-id');
    vi.stubEnv('GOOGLE_CLIENT_SECRET', 'google-client-secret');
    vi.stubEnv('CLOUDFLARE_ACCOUNT_ID', 'cloudflare-account-id');
    vi.stubEnv('CLOUDFLARE_API_KEY', 'cloudflare-api-key');

    const state = getServerState();

    expect(state.googleClient).not.toBeNull();
    expect(state.cloudflareImages).not.toBeNull();
  });

  it('still throws when a required variable is missing', () => {
    vi.stubEnv('SESSION_SECRET', '');

    expect(() => getServerState()).toThrow('Env properties are not defined.');
  });
});

import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ServerState } from './serverState';
import { decrypt, encrypt } from './encryption';

const sessionSecret = new TextEncoder().encode('test-session-secret');

function useSessionSecret(secret = sessionSecret): void {
  globalThis.serverState = { sessionSecret: secret } as unknown as ServerState;
}

beforeEach(() => {
  useSessionSecret();
});

afterEach(() => {
  delete (globalThis as { serverState?: ServerState }).serverState;
});

describe('encrypt / decrypt', () => {
  it('round-trips a JWT payload', async () => {
    const token = await encrypt({ sessionId: 'session-1' }, '1h');
    const payload = await decrypt<{ sessionId: string }>(token);

    expect(payload).toMatchObject({ sessionId: 'session-1' });
    expect(payload?.iat).toEqual(expect.any(Number));
    expect(payload?.exp).toEqual(expect.any(Number));
  });

  it('returns null for an expired token', async () => {
    const token = await encrypt({ sessionId: 'session-1' }, Math.floor(Date.now() / 1000) - 60);

    expect(await decrypt(token)).toBeNull();
  });

  it('returns null for a token signed with another secret', async () => {
    const token = await encrypt({ sessionId: 'session-1' }, '1h');
    useSessionSecret(new TextEncoder().encode('another-session-secret'));

    expect(await decrypt(token)).toBeNull();
  });

  it('returns null for a tampered token', async () => {
    const token = await encrypt({ sessionId: 'session-1' }, '1h');
    const tampered = token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a');

    expect(await decrypt(tampered)).toBeNull();
  });

  it('returns null for missing or invalid tokens', async () => {
    expect(await decrypt(undefined)).toBeNull();
    expect(await decrypt('')).toBeNull();
    expect(await decrypt('not-a-jwt')).toBeNull();
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { hashOidcSecret } from './hash';

const { getOidcClientWithSecretHash } = vi.hoisted(() => ({
  getOidcClientWithSecretHash: vi.fn(),
}));

vi.mock('@/lib/server/oidcMongodb', () => ({ getOidcClientWithSecretHash }));

import { authenticateOidcClient } from './clientAuth';

const clientSecret = 'super-secret';
const client = {
  clientId: 'client-1',
  displayName: 'Test Client',
  redirectUris: ['https://app.example.com/callback'],
  scopes: ['openid', 'profile'],
  clientSecretHash: hashOidcSecret(clientSecret),
};

function basicHeader(credentials: string): string {
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

beforeEach(() => {
  getOidcClientWithSecretHash.mockReset();
  getOidcClientWithSecretHash.mockResolvedValue(client);
});

describe('authenticateOidcClient with client_secret_post', () => {
  it('authenticates valid body credentials', async () => {
    const body = new URLSearchParams({ client_id: 'client-1', client_secret: clientSecret });

    expect(await authenticateOidcClient(null, body)).toEqual({
      clientId: 'client-1',
      displayName: 'Test Client',
      redirectUris: ['https://app.example.com/callback'],
      scopes: ['openid', 'profile'],
    });
    expect(getOidcClientWithSecretHash).toHaveBeenCalledWith('client-1');
  });

  it('rejects a wrong client secret', async () => {
    const body = new URLSearchParams({ client_id: 'client-1', client_secret: 'wrong' });

    expect(await authenticateOidcClient(null, body)).toBeNull();
  });

  it('rejects a missing client id or secret', async () => {
    expect(await authenticateOidcClient(null, new URLSearchParams())).toBeNull();
    expect(await authenticateOidcClient(null, new URLSearchParams({ client_id: 'client-1' }))).toBeNull();
    expect(await authenticateOidcClient(null, new URLSearchParams({ client_secret: clientSecret }))).toBeNull();
    expect(getOidcClientWithSecretHash).not.toHaveBeenCalled();
  });

  it('rejects an unknown client', async () => {
    getOidcClientWithSecretHash.mockResolvedValue(null);
    const body = new URLSearchParams({ client_id: 'unknown', client_secret: clientSecret });

    expect(await authenticateOidcClient(null, body)).toBeNull();
  });
});

describe('authenticateOidcClient with client_secret_basic', () => {
  it('authenticates valid basic credentials', async () => {
    expect(await authenticateOidcClient(basicHeader('client-1:super-secret'), new URLSearchParams())).toEqual({
      clientId: 'client-1',
      displayName: 'Test Client',
      redirectUris: ['https://app.example.com/callback'],
      scopes: ['openid', 'profile'],
    });
  });

  it('accepts a case-insensitive basic scheme', async () => {
    const header = `basic ${Buffer.from('client-1:super-secret').toString('base64')}`;

    expect(await authenticateOidcClient(header, new URLSearchParams())).not.toBeNull();
  });

  it('prefers basic credentials over body credentials', async () => {
    const body = new URLSearchParams({ client_id: 'client-1', client_secret: 'wrong' });

    expect(await authenticateOidcClient(basicHeader('client-1:super-secret'), body)).not.toBeNull();
  });

  it('falls back to body credentials for other authorization schemes', async () => {
    const body = new URLSearchParams({ client_id: 'client-1', client_secret: clientSecret });

    expect(await authenticateOidcClient('Bearer some-token', body)).not.toBeNull();
  });

  it('decodes URI encoded credentials', async () => {
    getOidcClientWithSecretHash.mockResolvedValue({
      ...client,
      clientId: 'client id',
      clientSecretHash: hashOidcSecret('secret with spaces'),
    });
    const header = basicHeader(`${encodeURIComponent('client id')}:${encodeURIComponent('secret with spaces')}`);

    expect(await authenticateOidcClient(header, new URLSearchParams())).toMatchObject({ clientId: 'client id' });
  });

  it.each([
    ['a header without a colon', basicHeader('client-1')],
    ['an empty header', 'Basic '],
    ['invalid percent encoding', basicHeader('%E0%A4%A:secret')],
  ])('rejects %s', async (_description, header) => {
    expect(await authenticateOidcClient(header, new URLSearchParams())).toBeNull();
    expect(getOidcClientWithSecretHash).not.toHaveBeenCalled();
  });
});

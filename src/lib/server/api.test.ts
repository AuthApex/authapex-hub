import { beforeEach, describe, expect, it, vi } from 'vitest';

const { logError } = vi.hoisted(() => ({ logError: vi.fn() }));

vi.mock('@/lib/server/logger', () => ({ logError }));

import { apiError, handleRouteError, jsonNoStore, NO_STORE_HEADERS } from './api';

beforeEach(() => {
  logError.mockReset();
});

describe('jsonNoStore', () => {
  it('returns the body with non-cacheable headers', async () => {
    const response = jsonNoStore({ ok: true }, 201);

    expect(response.status).toBe(201);
    expect(response.headers.get('Cache-Control')).toBe(NO_STORE_HEADERS['Cache-Control']);
    expect(response.headers.get('Pragma')).toBe(NO_STORE_HEADERS.Pragma);
    expect(await response.json()).toEqual({ ok: true });
  });

  it('merges additional headers without letting them replace the cache headers', async () => {
    const response = jsonNoStore({ ok: true }, 200, { 'X-Test': 'yes' });

    expect(response.headers.get('X-Test')).toBe('yes');
    expect(response.headers.get('Cache-Control')).toBe(NO_STORE_HEADERS['Cache-Control']);
  });
});

describe('apiError', () => {
  it('returns a non-cacheable error response', async () => {
    const response = apiError('Unauthorized', 401);

    expect(response.status).toBe(401);
    expect(response.headers.get('Cache-Control')).toBe(NO_STORE_HEADERS['Cache-Control']);
    expect(await response.json()).toEqual({ error: 'Unauthorized' });
  });
});

describe('handleRouteError', () => {
  it('logs the failure and returns a generic 500', async () => {
    const error = new Error('database unavailable');

    const response = handleRouteError(error, '/api/example');

    expect(logError).toHaveBeenCalledWith(error, 'Unhandled error in /api/example', {
      area: 'api-route',
      tags: { route: '/api/example' },
    });
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: 'Internal Server Error' });
  });
});

import { NextRequest } from 'next/server';
import { describe, expect, it } from 'vitest';
import { middleware } from './middleware';

function request(path: string): NextRequest {
  return new NextRequest(new URL(path, 'https://id.example.com'));
}

function rewrittenPath(response: Response | undefined): string | null {
  const rewrite = response?.headers.get('x-middleware-rewrite');
  return rewrite == null ? null : new URL(rewrite).pathname;
}

describe('middleware', () => {
  it('does not rewrite API routes', async () => {
    expect(await middleware(request('/api'))).toBeUndefined();
    expect(await middleware(request('/api/oidc/authorize'))).toBeUndefined();
  });

  it('does not rewrite paths that already have the en locale', async () => {
    expect(await middleware(request('/en'))).toBeUndefined();
    expect(await middleware(request('/en/signin'))).toBeUndefined();
  });

  it('rewrites the root path to the default cs locale', async () => {
    expect(rewrittenPath(await middleware(request('/')))).toBe('/cs');
  });

  it('rewrites a path to the default cs locale', async () => {
    expect(rewrittenPath(await middleware(request('/signin')))).toBe('/cs/signin');
    expect(rewrittenPath(await middleware(request('/admin/users')))).toBe('/cs/admin/users');
  });

  it('keeps the query string when rewriting', async () => {
    const response = await middleware(request('/signin?flow=oidc'));

    expect(response?.headers.get('x-middleware-rewrite')).toBe('https://id.example.com/cs/signin?flow=oidc');
  });
});

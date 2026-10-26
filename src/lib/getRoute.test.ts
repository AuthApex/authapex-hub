import { describe, expect, it } from 'vitest';
import { getRoute } from './getRoute';

describe('getRoute', () => {
  it('returns the path unchanged for the default cs locale', () => {
    expect(getRoute('cs', '/signin')).toBe('/signin');
  });

  it('prefixes the path for the en locale', () => {
    expect(getRoute('en', '/signin')).toBe('/en/signin');
  });

  it('prefixes the path for any other locale', () => {
    expect(getRoute('de', '/admin/users')).toBe('/de/admin/users');
  });

  it('keeps the root path working', () => {
    expect(getRoute('cs', '/')).toBe('/');
    expect(getRoute('en', '/')).toBe('/en/');
  });
});

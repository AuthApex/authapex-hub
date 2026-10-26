import { describe, expect, it } from 'vitest';
import { ensureOpenIdScope, mergeOidcScopes, parseOidcScopes } from './scope';

describe('parseOidcScopes', () => {
  it('splits whitespace separated scopes', () => {
    expect(parseOidcScopes('openid profile email')).toEqual(['openid', 'profile', 'email']);
  });

  it('removes duplicate scopes while preserving order', () => {
    expect(parseOidcScopes('openid profile openid email profile')).toEqual(['openid', 'profile', 'email']);
  });

  it('handles empty and missing values', () => {
    expect(parseOidcScopes('')).toEqual([]);
    expect(parseOidcScopes('   ')).toEqual([]);
    expect(parseOidcScopes(null)).toEqual([]);
    expect(parseOidcScopes(undefined)).toEqual([]);
  });
});

describe('mergeOidcScopes', () => {
  it('merges lists and removes duplicates', () => {
    expect(mergeOidcScopes(['openid', 'profile'], ['profile', 'email'])).toEqual(['openid', 'profile', 'email']);
  });

  it('filters empty values', () => {
    expect(mergeOidcScopes(['openid', ''], ['', 'email'])).toEqual(['openid', 'email']);
  });

  it('returns an empty list when there is nothing to merge', () => {
    expect(mergeOidcScopes()).toEqual([]);
    expect(mergeOidcScopes([], [])).toEqual([]);
  });
});

describe('ensureOpenIdScope', () => {
  it('adds openid when it is missing', () => {
    expect(ensureOpenIdScope(['profile', 'email'])).toEqual(['openid', 'profile', 'email']);
  });

  it('moves openid to the front', () => {
    expect(ensureOpenIdScope(['profile', 'openid', 'email'])).toEqual(['openid', 'profile', 'email']);
  });

  it('does not duplicate openid', () => {
    expect(ensureOpenIdScope(['openid', 'profile', 'openid'])).toEqual(['openid', 'profile']);
  });

  it('returns only openid for an empty list', () => {
    expect(ensureOpenIdScope([])).toEqual(['openid']);
  });
});

import { describe, expect, it } from 'vitest';
import { getS256CodeChallenge, hashOidcSecret, isEqualSecret } from './hash';

describe('hashOidcSecret', () => {
  it('hashes values with SHA-256 in base64url encoding', () => {
    expect(hashOidcSecret('abc')).toBe('ungWv48Bz-pBQUDeXa4iI7ADYaOWF3qctBD_YfIAFa0');
    expect(hashOidcSecret('secret')).toBe('K7gNU3sdo-OL0wNhqoVWhr3g6s1xYv72ol_pe_Unols');
  });

  it('returns a base64url value without padding', () => {
    const hash = hashOidcSecret('some-long-client-secret');

    expect(hash).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(hash).not.toContain('=');
  });

  it('produces different hashes for different values', () => {
    expect(hashOidcSecret('secret-1')).not.toBe(hashOidcSecret('secret-2'));
  });
});

describe('getS256CodeChallenge', () => {
  it('matches the RFC 7636 example', () => {
    expect(getS256CodeChallenge('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk')).toBe(
      'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM'
    );
  });

  it('hashes in the same way as hashOidcSecret', () => {
    expect(getS256CodeChallenge('verifier')).toBe(hashOidcSecret('verifier'));
  });
});

describe('isEqualSecret', () => {
  it('returns true for equal secrets', () => {
    expect(isEqualSecret('secret', 'secret')).toBe(true);
    expect(isEqualSecret('', '')).toBe(true);
  });

  it('returns false for different secrets of the same length', () => {
    expect(isEqualSecret('secret-a', 'secret-b')).toBe(false);
  });

  it('returns false for secrets of different lengths', () => {
    expect(isEqualSecret('secret', 'secret-with-a-suffix')).toBe(false);
    expect(isEqualSecret('', 'secret')).toBe(false);
  });
});

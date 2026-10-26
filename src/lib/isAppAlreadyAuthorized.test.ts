import { describe, expect, it } from 'vitest';
import { isAppAlreadyAuthorized } from './isAppAlreadyAuthorized';
import { VerifiedStatus } from './getVerifiedStatus';

const sessions = [
  { app: 'unverified-app', userId: 'user-1', verified: null },
  { app: 'verified-app', userId: 'user-1', verified: true },
  { app: 'rejected-app', userId: 'user-1', verified: false },
];

describe('isAppAlreadyAuthorized', () => {
  it('always returns false for a conflicting app', () => {
    expect(isAppAlreadyAuthorized(sessions, 'unverified-app', VerifiedStatus.CONFLICT)).toBe(false);
    expect(isAppAlreadyAuthorized(sessions, 'verified-app', VerifiedStatus.CONFLICT)).toBe(false);
  });

  it('matches an unverified session for NOT_VERIFIED', () => {
    expect(isAppAlreadyAuthorized(sessions, 'unverified-app', VerifiedStatus.NOT_VERIFIED)).toBe(true);
  });

  it('does not match verified or rejected sessions for NOT_VERIFIED', () => {
    expect(isAppAlreadyAuthorized(sessions, 'verified-app', VerifiedStatus.NOT_VERIFIED)).toBe(false);
    expect(isAppAlreadyAuthorized(sessions, 'rejected-app', VerifiedStatus.NOT_VERIFIED)).toBe(false);
  });

  it('matches a verified session for VERIFIED', () => {
    expect(isAppAlreadyAuthorized(sessions, 'verified-app', VerifiedStatus.VERIFIED)).toBe(true);
  });

  it('does not match unverified or rejected sessions for VERIFIED', () => {
    expect(isAppAlreadyAuthorized(sessions, 'unverified-app', VerifiedStatus.VERIFIED)).toBe(false);
    expect(isAppAlreadyAuthorized(sessions, 'rejected-app', VerifiedStatus.VERIFIED)).toBe(false);
  });

  it('returns false for an unknown app or an empty session list', () => {
    expect(isAppAlreadyAuthorized(sessions, 'unknown-app', VerifiedStatus.VERIFIED)).toBe(false);
    expect(isAppAlreadyAuthorized([], 'verified-app', VerifiedStatus.NOT_VERIFIED)).toBe(false);
  });
});

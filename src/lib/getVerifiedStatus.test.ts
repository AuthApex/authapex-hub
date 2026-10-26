import { describe, expect, it } from 'vitest';
import { getVerifiedStatus, VerifiedStatus } from './getVerifiedStatus';

const authorizedApps = [
  { name: 'gitea', displayName: 'Gitea', url: 'https://git.example.com' },
  { name: 'immich', displayName: 'Immich', url: 'https://photos.example.com' },
];

describe('getVerifiedStatus', () => {
  it('returns VERIFIED with the display name when the name and URL match', () => {
    expect(getVerifiedStatus(authorizedApps, 'gitea', 'https://git.example.com')).toEqual({
      status: VerifiedStatus.VERIFIED,
      displayName: 'Gitea',
    });
  });

  it('returns CONFLICT when the name matches but the URL does not', () => {
    expect(getVerifiedStatus(authorizedApps, 'gitea', 'https://evil.example.com')).toEqual({
      status: VerifiedStatus.CONFLICT,
    });
  });

  it('returns CONFLICT when the name is a close match of an authorized app', () => {
    expect(getVerifiedStatus(authorizedApps, 'giteaa', 'https://git.example.com')).toEqual({
      status: VerifiedStatus.CONFLICT,
    });
  });

  it('ignores diacritics when looking for a close match', () => {
    const apps = [{ name: 'cafe', displayName: 'Café', url: 'https://cafe.example.com' }];

    expect(getVerifiedStatus(apps, 'café', 'https://cafe.example.com').status).toBe(VerifiedStatus.CONFLICT);
  });

  it('returns NOT_VERIFIED when no app matches', () => {
    expect(getVerifiedStatus(authorizedApps, 'unrelated-app', 'https://unrelated.example.com')).toEqual({
      status: VerifiedStatus.NOT_VERIFIED,
    });
  });

  it('returns NOT_VERIFIED for an empty list of authorized apps', () => {
    expect(getVerifiedStatus([], 'gitea', 'https://git.example.com')).toEqual({
      status: VerifiedStatus.NOT_VERIFIED,
    });
  });
});

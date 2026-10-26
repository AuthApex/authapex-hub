import { describe, expect, it } from 'vitest';
import { UserWithPassword } from '@/lib/models/User';
import { getOidcUserClaims } from './tokens';

const user: UserWithPassword = {
  userId: 'user-1',
  username: 'john_doe',
  email: 'john@example.com',
  displayName: 'John Doe',
  roles: [
    { application: 'gitea', role: 'admin' },
    { application: 'immich', role: 'user' },
  ],
  profileImageUrl: 'https://images.example.com/john.png',
  password: 'hash',
};

describe('getOidcUserClaims', () => {
  it('returns no claims for an empty scope list', () => {
    expect(getOidcUserClaims(user, [])).toEqual({});
  });

  it('adds profile claims for the profile scope', () => {
    expect(getOidcUserClaims(user, ['profile'])).toEqual({
      name: 'John Doe',
      nickname: 'John Doe',
      preferred_username: 'john_doe',
      picture: 'https://images.example.com/john.png',
    });
  });

  it('omits the picture when the user has no profile image', () => {
    expect(getOidcUserClaims({ ...user, profileImageUrl: undefined }, ['profile'])).toEqual({
      name: 'John Doe',
      nickname: 'John Doe',
      preferred_username: 'john_doe',
    });
  });

  it('adds email claims for the email scope', () => {
    expect(getOidcUserClaims(user, ['email'])).toEqual({
      email: 'john@example.com',
      email_verified: false,
    });
    expect(getOidcUserClaims({ ...user, emailVerified: true }, ['email'])).toEqual({
      email: 'john@example.com',
      email_verified: true,
    });
  });

  it('adds group and role claims for the groups scope', () => {
    expect(getOidcUserClaims(user, ['groups'])).toEqual({
      groups: ['gitea:admin', 'immich:user'],
      roles: user.roles,
    });
  });

  it('returns empty groups and roles when the user has no roles', () => {
    expect(getOidcUserClaims({ ...user, roles: [] }, ['groups'])).toEqual({ groups: [], roles: [] });
  });

  it('combines claims for multiple scopes', () => {
    expect(getOidcUserClaims(user, ['profile', 'email', 'groups'])).toEqual({
      name: 'John Doe',
      nickname: 'John Doe',
      preferred_username: 'john_doe',
      picture: 'https://images.example.com/john.png',
      email: 'john@example.com',
      email_verified: false,
      groups: ['gitea:admin', 'immich:user'],
      roles: user.roles,
    });
  });

  it('ignores unsupported scopes', () => {
    expect(getOidcUserClaims(user, ['openid', 'offline_access'])).toEqual({});
  });
});

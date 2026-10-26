import { Document } from 'mongodb';
import { describe, expect, it } from 'vitest';
import { EMPTY_ADMIN_USERS_FILTERS } from '@/lib/userFilters';
import { buildUsersQuery, compareUsers, escapeRegExp, mapAdminUser } from './userQuery';

describe('escapeRegExp', () => {
  it('escapes regular expression metacharacters', () => {
    expect(escapeRegExp('a.b*c+d?e^f$g{h}i(j)k|l[m]n\\o')).toBe(
      'a\\.b\\*c\\+d\\?e\\^f\\$g\\{h\\}i\\(j\\)k\\|l\\[m\\]n\\\\o'
    );
  });

  it('leaves plain text unchanged', () => {
    expect(escapeRegExp('john.doe@example.com')).toBe('john\\.doe@example\\.com');
    expect(escapeRegExp('plain text')).toBe('plain text');
  });
});

describe('buildUsersQuery', () => {
  it('returns an empty query for empty filters', () => {
    expect(buildUsersQuery(EMPTY_ADMIN_USERS_FILTERS)).toEqual({});
  });

  it('builds a case-insensitive email regex and escapes the value', () => {
    expect(buildUsersQuery({ ...EMPTY_ADMIN_USERS_FILTERS, email: 'john.doe+test@example.com' })).toEqual({
      email: { $regex: 'john\\.doe\\+test@example\\.com', $options: 'i' },
    });
  });

  it('builds a google provider query', () => {
    expect(buildUsersQuery({ ...EMPTY_ADMIN_USERS_FILTERS, provider: 'google' })).toEqual({
      googleId: { $exists: true, $nin: [null, ''] },
    });
  });

  it('builds a native provider query', () => {
    expect(buildUsersQuery({ ...EMPTY_ADMIN_USERS_FILTERS, provider: 'native' })).toEqual({
      $or: [{ googleId: { $exists: false } }, { googleId: null }, { googleId: '' }],
    });
  });

  it('builds verification queries', () => {
    expect(buildUsersQuery({ ...EMPTY_ADMIN_USERS_FILTERS, verified: 'true' })).toEqual({ emailVerified: true });
    expect(buildUsersQuery({ ...EMPTY_ADMIN_USERS_FILTERS, verified: 'false' })).toEqual({
      emailVerified: { $ne: true },
    });
  });

  it('builds a role query for an application', () => {
    expect(buildUsersQuery({ ...EMPTY_ADMIN_USERS_FILTERS, application: 'gitea' })).toEqual({
      roles: { $elemMatch: { application: 'gitea' } },
    });
  });

  it('builds a role query for a role', () => {
    expect(buildUsersQuery({ ...EMPTY_ADMIN_USERS_FILTERS, role: 'admin' })).toEqual({
      roles: { $elemMatch: { role: 'admin' } },
    });
  });

  it('combines application and role in a single element match', () => {
    expect(buildUsersQuery({ ...EMPTY_ADMIN_USERS_FILTERS, application: 'gitea', role: 'admin' })).toEqual({
      roles: { $elemMatch: { application: 'gitea', role: 'admin' } },
    });
  });

  it('combines all filters', () => {
    expect(
      buildUsersQuery({
        query: 'john',
        email: 'john@example.com',
        provider: 'native',
        verified: 'false',
        application: 'gitea',
        role: 'admin',
      })
    ).toEqual({
      email: { $regex: 'john@example\\.com', $options: 'i' },
      $or: [{ googleId: { $exists: false } }, { googleId: null }, { googleId: '' }],
      emailVerified: { $ne: true },
      roles: { $elemMatch: { application: 'gitea', role: 'admin' } },
    });
  });
});

describe('compareUsers', () => {
  it('compares _id values as strings', () => {
    expect(compareUsers({ _id: 'a' }, { _id: 'b' }, '_id')).toBeLessThan(0);
    expect(compareUsers({ _id: 'b' }, { _id: 'a' }, '_id')).toBeGreaterThan(0);
    expect(compareUsers({ _id: 'a' }, { _id: 'a' }, '_id')).toBe(0);
  });

  it('compares text fields case-insensitively', () => {
    expect(compareUsers({ username: 'Apple' }, { username: 'banana' }, 'username')).toBeLessThan(0);
    expect(compareUsers({ username: 'apple' }, { username: 'BANANA' }, 'username')).toBeLessThan(0);
  });

  it('treats missing values as empty strings', () => {
    expect(compareUsers({}, { displayName: 'John' }, 'displayName')).toBeLessThan(0);
    expect(compareUsers({ email: 'john@example.com' }, {}, 'email')).toBeGreaterThan(0);
    expect(compareUsers({}, {}, 'email')).toBe(0);
  });

  it('stringifies numeric values', () => {
    expect(compareUsers({ _id: 2 }, { _id: 10 }, '_id')).toBeGreaterThan(0);
  });
});

describe('mapAdminUser', () => {
  it('maps a native user with defaults', () => {
    expect(
      mapAdminUser({
        userId: 'user-1',
        email: 'john@example.com',
        displayName: 'John',
        username: 'john',
      })
    ).toEqual({
      userId: 'user-1',
      email: 'john@example.com',
      displayName: 'John',
      username: 'john',
      roles: [],
      profileImageId: null,
      profileImageUrl: null,
      provider: 'native',
      emailVerified: false,
    });
  });

  it('maps a google user with roles and images', () => {
    expect(
      mapAdminUser({
        userId: 'user-2',
        email: 'jane@example.com',
        displayName: 'Jane',
        username: 'jane',
        googleId: 'google-123',
        emailVerified: true,
        profileImageId: 'image-id',
        profileImageUrl: 'https://images.example.com/image.png',
        roles: [{ application: 'gitea', role: 'admin' }],
      })
    ).toEqual({
      userId: 'user-2',
      email: 'jane@example.com',
      displayName: 'Jane',
      username: 'jane',
      roles: [{ application: 'gitea', role: 'admin' }],
      profileImageId: 'image-id',
      profileImageUrl: 'https://images.example.com/image.png',
      provider: 'google',
      emailVerified: true,
    });
  });

  it('only treats an explicit true as verified', () => {
    const user = mapAdminUser({ userId: 'user-3', emailVerified: 'true' } as unknown as Document);

    expect(user.emailVerified).toBe(false);
  });

  it('treats an empty googleId as a native user', () => {
    expect(mapAdminUser({ userId: 'user-4', googleId: '' }).provider).toBe('native');
  });
});

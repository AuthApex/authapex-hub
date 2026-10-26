import { describe, expect, it } from 'vitest';
import {
  clearAdminUsersFilters,
  countActiveAdminUsersFilters,
  DEFAULT_USERS_PER_PAGE,
  EMPTY_ADMIN_USERS_FILTERS,
  parseAdminUsersQuery,
  setAdminUsersFilters,
} from './userFilters';

describe('parseAdminUsersQuery', () => {
  it('returns defaults for empty search params', () => {
    expect(parseAdminUsersQuery({})).toEqual({
      filters: EMPTY_ADMIN_USERS_FILTERS,
      page: 0,
      size: DEFAULT_USERS_PER_PAGE,
      sortBy: '_id',
      sortOrder: 'asc',
      isValid: true,
    });
  });

  it('parses and trims all filters', () => {
    const result = parseAdminUsersQuery({
      q: '  john ',
      email: ' john@example.com ',
      provider: 'google',
      verified: 'true',
      app: ' gitea ',
      role: 'admin',
    });

    expect(result.filters).toEqual({
      query: 'john',
      email: 'john@example.com',
      provider: 'google',
      verified: 'true',
      application: 'gitea',
      role: 'admin',
    });
    expect(result.isValid).toBe(true);
  });

  it('parses pagination and sorting', () => {
    const result = parseAdminUsersQuery({
      page: '2',
      size: '25',
      sortBy: 'email',
      sortOrder: 'desc',
    });

    expect(result).toMatchObject({ page: 2, size: 25, sortBy: 'email', sortOrder: 'desc', isValid: true });
  });

  it('treats array-valued params as empty', () => {
    const result = parseAdminUsersQuery({ q: ['one', 'two'], provider: ['google'] });

    expect(result.filters.query).toBe('');
    expect(result.filters.provider).toBe('');
  });

  it.each([
    ['page', '-1'],
    ['page', '1.5'],
    ['page', 'abc'],
    ['size', '7'],
    ['sortBy', 'password'],
    ['sortOrder', 'sideways'],
    ['provider', 'github'],
    ['verified', 'maybe'],
    ['role', 'superadmin'],
  ])('marks the query invalid for %s=%s', (key, value) => {
    expect(parseAdminUsersQuery({ [key]: value }).isValid).toBe(false);
  });

  it('falls back to safe values for invalid sort, order, provider, verification and role', () => {
    const result = parseAdminUsersQuery({
      sortBy: 'password',
      sortOrder: 'sideways',
      provider: 'github',
      verified: 'maybe',
      role: 'superadmin',
    });

    expect(result.sortBy).toBe('_id');
    expect(result.sortOrder).toBe('asc');
    expect(result.filters.provider).toBe('');
    expect(result.filters.verified).toBe('');
    expect(result.filters.role).toBe('');
  });

  it('keeps the invalid page size so the caller can reject the query', () => {
    const result = parseAdminUsersQuery({ size: '7' });

    expect(result.size).toBe(7);
    expect(result.isValid).toBe(false);
  });

  it('returns NaN for a non numeric page and marks it invalid', () => {
    const result = parseAdminUsersQuery({ page: 'abc' });

    expect(Number.isNaN(result.page)).toBe(true);
    expect(result.isValid).toBe(false);
  });
});

describe('countActiveAdminUsersFilters', () => {
  it('returns 0 when no filter is set', () => {
    expect(countActiveAdminUsersFilters(EMPTY_ADMIN_USERS_FILTERS)).toBe(0);
  });

  it('counts every non-empty filter', () => {
    expect(
      countActiveAdminUsersFilters({
        ...EMPTY_ADMIN_USERS_FILTERS,
        query: 'john',
        provider: 'native',
        verified: 'false',
      })
    ).toBe(3);
    expect(countActiveAdminUsersFilters({ ...EMPTY_ADMIN_USERS_FILTERS, application: 'gitea' })).toBe(1);
  });
});

describe('setAdminUsersFilters', () => {
  it('writes filters, trims values and resets the page', () => {
    const params = new URLSearchParams('page=3&size=25&sortBy=email');

    setAdminUsersFilters(params, {
      query: ' john ',
      email: ' john@example.com ',
      provider: 'google',
      verified: 'true',
      application: 'gitea',
      role: 'admin',
    });

    expect(Object.fromEntries(params)).toEqual({
      size: '25',
      sortBy: 'email',
      q: 'john',
      email: 'john@example.com',
      provider: 'google',
      verified: 'true',
      app: 'gitea',
      role: 'admin',
    });
  });

  it('removes parameters for empty filters and resets the page', () => {
    const params = new URLSearchParams('page=2&q=old&email=old%40example.com&size=10');

    setAdminUsersFilters(params, EMPTY_ADMIN_USERS_FILTERS);

    expect(Object.fromEntries(params)).toEqual({ size: '10' });
  });
});

describe('clearAdminUsersFilters', () => {
  it('removes every filter and the page but keeps sorting and page size', () => {
    const params = new URLSearchParams(
      'page=4&size=100&sortBy=username&sortOrder=desc&q=john&email=a%40b.cz&provider=google&verified=true&app=gitea&role=admin'
    );

    clearAdminUsersFilters(params);

    expect(Object.fromEntries(params)).toEqual({ size: '100', sortBy: 'username', sortOrder: 'desc' });
  });
});

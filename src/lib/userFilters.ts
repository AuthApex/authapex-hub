export const USER_ROLES = ['user', 'vip', 'moderator', 'admin', 'owner'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const USER_PROVIDERS = ['google', 'native'] as const;
export type UserProvider = (typeof USER_PROVIDERS)[number];

export const USER_VERIFICATION_VALUES = ['true', 'false'] as const;
export type UserVerification = (typeof USER_VERIFICATION_VALUES)[number];

export const USER_SORT_FIELDS = ['_id', 'username', 'displayName', 'email'] as const;
export type UserSortField = (typeof USER_SORT_FIELDS)[number];

export const USER_SORT_ORDERS = ['asc', 'desc'] as const;
export type UserSortOrder = (typeof USER_SORT_ORDERS)[number];

export const USERS_PER_PAGE_OPTIONS = [5, 10, 25, 100] as const;
export const DEFAULT_USERS_PER_PAGE = 5;

export interface AdminUsersFilters {
  query: string;
  email: string;
  provider: UserProvider | '';
  verified: UserVerification | '';
  application: string;
  role: UserRole | '';
}

export const EMPTY_ADMIN_USERS_FILTERS: AdminUsersFilters = {
  query: '',
  email: '',
  provider: '',
  verified: '',
  application: '',
  role: '',
};

export interface ParsedAdminUsersQuery {
  filters: AdminUsersFilters;
  page: number;
  size: number;
  sortBy: UserSortField;
  sortOrder: UserSortOrder;
  isValid: boolean;
}

export type AdminUsersSearchParams = Record<string, string | string[] | undefined>;

const FILTER_PARAM_KEYS: Record<keyof AdminUsersFilters, string> = {
  query: 'q',
  email: 'email',
  provider: 'provider',
  verified: 'verified',
  application: 'app',
  role: 'role',
};

function readParam(searchParams: AdminUsersSearchParams, name: string): string {
  const value = searchParams[name];
  return typeof value === 'string' ? value.trim() : '';
}

function isOneOf<T extends string>(values: readonly T[], value: string): value is T {
  return (values as readonly string[]).includes(value);
}

export function parseAdminUsersQuery(searchParams: AdminUsersSearchParams): ParsedAdminUsersQuery {
  const pageValue = readParam(searchParams, 'page');
  const sizeValue = readParam(searchParams, 'size');
  const sortByValue = readParam(searchParams, 'sortBy');
  const sortOrderValue = readParam(searchParams, 'sortOrder');
  const providerValue = readParam(searchParams, 'provider');
  const verifiedValue = readParam(searchParams, 'verified');
  const roleValue = readParam(searchParams, 'role');

  const page = pageValue === '' ? 0 : Number(pageValue);
  const size = sizeValue === '' ? DEFAULT_USERS_PER_PAGE : Number(sizeValue);
  const sortBy = sortByValue === '' ? '_id' : sortByValue;
  const sortOrder = sortOrderValue === '' ? 'asc' : sortOrderValue;

  const isValid =
    Number.isInteger(page) &&
    page >= 0 &&
    (USERS_PER_PAGE_OPTIONS as readonly number[]).includes(size) &&
    isOneOf(USER_SORT_FIELDS, sortBy) &&
    isOneOf(USER_SORT_ORDERS, sortOrder) &&
    (providerValue === '' || isOneOf(USER_PROVIDERS, providerValue)) &&
    (verifiedValue === '' || isOneOf(USER_VERIFICATION_VALUES, verifiedValue)) &&
    (roleValue === '' || isOneOf(USER_ROLES, roleValue));

  return {
    filters: {
      query: readParam(searchParams, 'q'),
      email: readParam(searchParams, 'email'),
      provider: isOneOf(USER_PROVIDERS, providerValue) ? providerValue : '',
      verified: isOneOf(USER_VERIFICATION_VALUES, verifiedValue) ? verifiedValue : '',
      application: readParam(searchParams, 'app'),
      role: isOneOf(USER_ROLES, roleValue) ? roleValue : '',
    },
    page,
    size,
    sortBy: isOneOf(USER_SORT_FIELDS, sortBy) ? sortBy : '_id',
    sortOrder: isOneOf(USER_SORT_ORDERS, sortOrder) ? sortOrder : 'asc',
    isValid,
  };
}

export function countActiveAdminUsersFilters(filters: AdminUsersFilters): number {
  return Object.values(filters).filter((value) => value !== '').length;
}

/** Writes all filter values into the params and resets pagination. */
export function setAdminUsersFilters(params: URLSearchParams, filters: AdminUsersFilters): void {
  for (const [field, param] of Object.entries(FILTER_PARAM_KEYS) as [keyof AdminUsersFilters, string][]) {
    const value = filters[field].trim();
    if (value) {
      params.set(param, value);
    } else {
      params.delete(param);
    }
  }
  params.delete('page');
}

/** Removes all filters and resets pagination, keeping sorting and page size intact. */
export function clearAdminUsersFilters(params: URLSearchParams): void {
  for (const param of Object.values(FILTER_PARAM_KEYS)) {
    params.delete(param);
  }
  params.delete('page');
}

import { Document, Filter } from 'mongodb';
import { AdminUser } from '@/lib/models/User';
import { AdminUsersFilters, UserSortField } from '@/lib/userFilters';

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function buildUsersQuery(filters: AdminUsersFilters): Filter<Document> {
  const query: Filter<Document> = {};

  if (filters.email) {
    query.email = { $regex: escapeRegExp(filters.email), $options: 'i' };
  }

  if (filters.provider === 'google') {
    query.googleId = { $exists: true, $nin: [null, ''] };
  } else if (filters.provider === 'native') {
    query.$or = [{ googleId: { $exists: false } }, { googleId: null }, { googleId: '' }];
  }

  if (filters.verified === 'true') {
    query.emailVerified = true;
  } else if (filters.verified === 'false') {
    query.emailVerified = { $ne: true };
  }

  if (filters.application || filters.role) {
    const roleMatch: Record<string, string> = {};
    if (filters.application) {
      roleMatch.application = filters.application;
    }
    if (filters.role) {
      roleMatch.role = filters.role;
    }
    query.roles = { $elemMatch: roleMatch };
  }

  return query;
}

export function compareUsers(a: Document, b: Document, sortBy: UserSortField): number {
  if (sortBy === '_id') {
    return String(a._id).localeCompare(String(b._id));
  }
  return String(a[sortBy] ?? '').localeCompare(String(b[sortBy] ?? ''), undefined, { sensitivity: 'base' });
}

export function mapAdminUser(user: Document): AdminUser {
  return {
    userId: user.userId,
    email: user.email,
    displayName: user.displayName,
    username: user.username,
    roles: user.roles ?? [],
    profileImageId: user.profileImageId ?? null,
    profileImageUrl: user.profileImageUrl ?? null,
    provider: user.googleId ? 'google' : 'native',
    emailVerified: user.emailVerified === true,
  };
}

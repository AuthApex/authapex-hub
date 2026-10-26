import 'server-only';
import { getServerState } from '@/lib/server/serverState';
import { logError } from '@/lib/server/logger';
import { nanoid } from 'nanoid';
import { AdminUser, UserWithPassword } from '@/lib/models/User';
import { RoleModel, TokenRequest } from '@authapex/core';
import Fuse from 'fuse.js';
import { VerifiedStatus } from '@/lib/getVerifiedStatus';
import { AdminUsersFilters, UserSortField, UserSortOrder } from '@/lib/userFilters';
import { normalizeEmail, normalizeUsername } from '@/lib/normalize';
import { buildUsersQuery, compareUsers, mapAdminUser } from '@/lib/server/userQuery';

export interface DbUpdateResult {
  success: boolean;
}

export async function setDisplayName(userId: string, newDisplayName: string): Promise<DbUpdateResult> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    await db.collection('users').updateOne({ userId }, { $set: { displayName: newDisplayName } });
    return { success: true };
  } catch (error) {
    logError(error, 'MongoDB operation failed', { area: 'mongodb', tags: { operation: 'setDisplayName' } });
    return { success: false };
  }
}

export async function setEmail(userId: string, normalizedEmail: string): Promise<DbUpdateResult> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);

    const existingUser = await db.collection('users').findOne({ email: normalizedEmail });
    if (existingUser) {
      return { success: false };
    }

    await db.collection('users').updateOne({ userId }, { $set: { email: normalizedEmail } });
    return { success: true };
  } catch (error) {
    logError(error, 'MongoDB operation failed', { area: 'mongodb', tags: { operation: 'setEmail' } });
    return { success: false };
  }
}

export async function setProfileImageId(
  userId: string,
  newProfileImageId: string | null | undefined
): Promise<DbUpdateResult> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    await db.collection('users').updateOne({ userId }, { $set: { profileImageId: newProfileImageId } });
    return { success: true };
  } catch (error) {
    logError(error, 'MongoDB operation failed', { area: 'mongodb', tags: { operation: 'setProfileImageId' } });
    return { success: false };
  }
}

export async function setProfileImageUrl(
  userId: string,
  newProfileImageUrl: string | null | undefined
): Promise<DbUpdateResult> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    await db.collection('users').updateOne({ userId }, { $set: { profileImageUrl: newProfileImageUrl } });
    return { success: true };
  } catch (error) {
    logError(error, 'MongoDB operation failed', { area: 'mongodb', tags: { operation: 'setProfileImageUrl' } });
    return { success: false };
  }
}

export async function invalidateSession({ sessionId }: { sessionId: string }): Promise<DbUpdateResult> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    await db.collection('sessions').deleteOne({ sessionId });
    return { success: true };
  } catch (error) {
    logError(error, 'MongoDB operation failed', { area: 'mongodb', tags: { operation: 'invalidateSession' } });
    return { success: false };
  }
}

export async function insertSession({
  userId,
  sessionId,
  expiresAt,
}: {
  userId: string;
  sessionId: string;
  expiresAt: Date;
}): Promise<DbUpdateResult> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    await db.collection('sessions').insertOne({ userId, sessionId, expiresAt });
    return { success: true };
  } catch (error) {
    logError(error, 'MongoDB operation failed', { area: 'mongodb', tags: { operation: 'insertSession' } });
    return { success: false };
  }
}

export async function getUserRawSession(
  app: string,
  userId: string,
  verified: boolean | null
): Promise<{
  app: string;
  userId: string;
  websocketEndpoint?: string | null;
  verified: boolean | null;
} | null> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    const session = await db.collection('userAppSessions').findOne({ app, userId, verified });
    if (session == null) {
      return null;
    }
    return {
      app: session.app,
      userId: session.userId,
      verified: session.verified,
      websocketEndpoint: session.websocketEndpoint,
    };
  } catch (error) {
    logError(error, 'MongoDB operation failed', { area: 'mongodb', tags: { operation: 'getUserRawSession' } });
    return null;
  }
}

export async function getUserByEmail(email: string): Promise<UserWithPassword | null> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      return null;
    }

    return {
      userId: user.userId,
      email: user.email,
      password: user.password,
      displayName: user.displayName,
      username: user.username,
      roles: user.roles,
      profileImageId: user.profileImageId,
      profileImageUrl: user.profileImageUrl,
    };
  } catch (error) {
    logError(error, 'MongoDB operation failed', { area: 'mongodb', tags: { operation: 'getUserByEmail' } });
    return null;
  }
}

export async function getUserByGoogleId(googleId: string): Promise<UserWithPassword | null> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    const user = await db.collection('users').findOne({ googleId });

    if (!user) {
      return null;
    }

    return {
      userId: user.userId,
      email: user.email,
      password: user.password,
      displayName: user.displayName,
      username: user.username,
      roles: user.roles,
      profileImageId: user.profileImageId,
      profileImageUrl: user.profileImageUrl,
    };
  } catch (error) {
    logError(error, 'MongoDB operation failed', { area: 'mongodb', tags: { operation: 'getUserByGoogleId' } });
    return null;
  }
}

export async function getUserBySession(sessionId: string): Promise<UserWithPassword | null> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    const session = await db.collection('sessions').findOne({ sessionId, expiresAt: { $gt: new Date() } });

    if (!session) {
      return null;
    }
    const user = await db.collection('users').findOne({ userId: session.userId });
    if (!user) {
      return null;
    }

    return {
      userId: user.userId,
      email: user.email,
      password: user.password,
      displayName: user.displayName,
      username: user.username,
      roles: user.roles,
      profileImageId: user.profileImageId,
      profileImageUrl: user.profileImageUrl,
      googleId: user.googleId,
    };
  } catch (error) {
    logError(error, 'MongoDB operation failed', { area: 'mongodb', tags: { operation: 'getUserBySession' } });
    return null;
  }
}

export async function createUser({
  googleId,
  email,
  username,
  password,
  emailVerified,
  profileImageUrl,
}: {
  googleId?: string;
  username: string;
  email: string;
  password: string | null;
  emailVerified: boolean;
  profileImageUrl?: string;
}): Promise<UserWithPassword | null> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    const normalizedUsername = normalizeUsername(username);
    const normalizedEmail = normalizeEmail(email);

    const existingUser = await db.collection('users').findOne({
      $or: [{ username: normalizedUsername }, { email: normalizedEmail }],
    });

    if (existingUser) {
      return null;
    }

    const userId = nanoid();
    const emailVerificationKey = nanoid();
    const inserted = await db.collection('users').insertOne({
      userId,
      googleId,
      username: normalizedUsername,
      email: normalizedEmail,
      password,
      emailVerified: emailVerified,
      emailVerificationKey,
      roles: [],
      displayName: username.trim(),
      profileImageUrl,
    });
    const user = await db.collection('users').findOne({ _id: inserted.insertedId });
    if (!user) {
      return null;
    }

    return {
      userId: user.userId,
      email: user.email,
      password: user.password,
      displayName: user.displayName,
      username: user.username,
      roles: user.roles,
      profileImageId: user.profileImageId,
      profileImageUrl: user.profileImageUrl,
    };
  } catch (error) {
    logError(error, 'MongoDB operation failed', { area: 'mongodb', tags: { operation: 'createUser' } });
    return null;
  }
}

export async function insertAuthCode(
  authCode: string,
  userId: string,
  status: VerifiedStatus
): Promise<DbUpdateResult> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    await db.collection('authCodes').insertOne({ authCode, userId, status });
    return { success: true };
  } catch (error) {
    logError(error, 'MongoDB operation failed', { area: 'mongodb', tags: { operation: 'insertAuthCode' } });
    return { success: false };
  }
}

export async function getUserIdByAuthCode(
  authCode: string
): Promise<{ userId: string; status: VerifiedStatus } | null> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    const authCodeDoc = await db.collection('authCodes').findOne({ authCode });
    if (!authCodeDoc) {
      return null;
    }
    return {
      userId: authCodeDoc.userId,
      status: authCodeDoc.status,
    };
  } catch (error) {
    logError(error, 'MongoDB operation failed', { area: 'mongodb', tags: { operation: 'getUserIdByAuthCode' } });
    return null;
  }
}

export async function isAppAuthorizedToSeeUser(
  app: string,
  apiKey: string | null | undefined,
  userId: string
): Promise<boolean> {
  try {
    const authorizedApp = await getAuthorizedApp(app);
    if (authorizedApp != null && authorizedApp.apiKey !== apiKey) {
      return false;
    }

    const userAppSession = await getUserRawSession(app, userId, authorizedApp == null ? null : true);
    return !!userAppSession;
  } catch (error) {
    logError(error, 'MongoDB operation failed', { area: 'mongodb', tags: { operation: 'isAppAuthorizedToSeeUser' } });
    return false;
  }
}

export async function authorizeAppToSeeUser(
  payload: TokenRequest,
  userId: string,
  status: VerifiedStatus
): Promise<DbUpdateResult> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);

    const authorizedApp = await getAuthorizedApp(payload.app);

    let verified: boolean | null;
    if (status === VerifiedStatus.VERIFIED) {
      if (authorizedApp != null && authorizedApp.apiKey === payload.apiKey) {
        verified = true;
      } else {
        return { success: false };
      }
    } else if (status === VerifiedStatus.CONFLICT) {
      verified = false;
    } else {
      if (authorizedApp != null) {
        return { success: false };
      }
      verified = null;
    }

    const existingUserSession = await getUserRawSession(payload.app, userId, verified);
    if (existingUserSession) {
      return { success: true };
    }
    await db
      .collection('userAppSessions')
      .insertOne({ app: payload.app, userId, websocketEndpoint: payload.websocketEndpoint, verified });

    return { success: true };
  } catch (error) {
    logError(error, 'MongoDB operation failed', { area: 'mongodb', tags: { operation: 'authorizeAppToSeeUser' } });
    return { success: false };
  }
}

export async function getUserAppSession(userId: string, app: string, verified: boolean | null) {
  try {
    const session = await getUserRawSession(app, userId, verified);
    if (!session) {
      return null;
    }
    const authorizedApp = await getAuthorizedApp(app);
    return {
      app: session.app,
      userId: session.userId,
      displayName: authorizedApp?.displayName,
      url: authorizedApp?.url,
      verified: session.verified,
      websocketEndpoint: session.websocketEndpoint ?? authorizedApp?.websocketEndpoint,
    };
  } catch (error) {
    logError(error, 'MongoDB operation failed', { area: 'mongodb', tags: { operation: 'getUserAppSession' } });
    return null;
  }
}

export async function getUserAppSessions(userId: string): Promise<
  {
    app: string;
    userId: string;
    displayName?: string;
    url?: string;
    websocketEndpoint?: string | null;
    verified: boolean | null;
  }[]
> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    const userAppSessions = await db.collection('userAppSessions').find({ userId }).toArray();
    const authorizedApps = await getAuthorizedApps();

    return userAppSessions.map((session) => {
      const authorizedApp = authorizedApps.find((app) => app.name === session.app);
      return {
        app: session.app,
        userId: session.userId,
        displayName: authorizedApp?.displayName,
        url: authorizedApp?.url,
        verified: session.verified,
        websocketEndpoint: session.websocketEndpoint ?? authorizedApp?.websocketEndpoint,
      };
    });
  } catch (error) {
    logError(error, 'MongoDB operation failed', { area: 'mongodb', tags: { operation: 'getUserAppSessions' } });
    return [];
  }
}

export async function removeUserAppSession(
  userId: string,
  app: string,
  verified: boolean | null
): Promise<DbUpdateResult> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    await db.collection('userAppSessions').deleteOne({ userId, app, verified });
    return { success: true };
  } catch (error) {
    logError(error, 'MongoDB operation failed', { area: 'mongodb', tags: { operation: 'removeUserAppSession' } });
    return { success: false };
  }
}

export async function getAuthorizedApp(appName: string): Promise<{
  name: string;
  displayName: string;
  url: string;
  apiKey: string;
  websocketEndpoint?: string | null;
} | null> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    const app = await db.collection('authorizedApps').findOne({ name: appName });
    if (app == null) {
      return null;
    }
    return {
      name: app.name,
      displayName: app.displayName,
      url: app.url,
      apiKey: app.apiKey,
      websocketEndpoint: app.websocketEndpoint,
    };
  } catch (error) {
    logError(error, 'MongoDB operation failed', { area: 'mongodb', tags: { operation: 'getAuthorizedApp' } });
    return null;
  }
}

export async function getAuthorizedApps(): Promise<
  { name: string; displayName: string; url: string; apiKey: string; websocketEndpoint?: string | null }[]
> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    const authorizedApps = await db.collection('authorizedApps').find({}).toArray();
    return authorizedApps.map((app) => ({
      name: app.name,
      displayName: app.displayName,
      url: app.url,
      apiKey: app.apiKey,
      websocketEndpoint: app.websocketEndpoint,
    }));
  } catch (error) {
    logError(error, 'MongoDB operation failed', { area: 'mongodb', tags: { operation: 'getAuthorizedApps' } });
    return [];
  }
}

export async function getAuthorizedAppsSanitized(): Promise<{ name: string; displayName: string; url: string }[]> {
  try {
    const apps = await getAuthorizedApps();
    return apps.map((app) => ({ name: app.name, displayName: app.displayName, url: app.url }));
  } catch (error) {
    logError(error, 'MongoDB operation failed', { area: 'mongodb', tags: { operation: 'getAuthorizedAppsSanitized' } });
    return [];
  }
}

export interface FindUsersOptions {
  filters: AdminUsersFilters;
  page: number;
  usersPerPage: number;
  sortBy: UserSortField;
  sortOrder: UserSortOrder;
}

export interface FindUsersResult {
  users: AdminUser[];
  hasMore: boolean;
}

export async function findUsers({
  filters,
  page,
  usersPerPage,
  sortBy,
  sortOrder,
}: FindUsersOptions): Promise<FindUsersResult> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    const collection = db.collection('users');
    const query = buildUsersQuery(filters);
    const sortDirection = sortOrder === 'desc' ? -1 : 1;
    const offset = page * usersPerPage;

    if (filters.query) {
      const candidates = await collection.find(query).toArray();
      const fuse = new Fuse(candidates, {
        keys: ['displayName', 'username', 'email'],
        threshold: 0.2,
        ignoreDiacritics: true,
      });

      const exactMatches = candidates.filter((user) => user.userId === filters.query);
      const exactMatchIds = new Set(exactMatches.map((user) => user.userId));
      const fuzzyMatches = fuse
        .search(filters.query)
        .map((result) => result.item)
        .filter((user) => !exactMatchIds.has(user.userId));

      const matchedUsers = [...exactMatches, ...fuzzyMatches].sort(
        (a, b) => sortDirection * compareUsers(a, b, sortBy)
      );
      const pageUsers = matchedUsers.slice(offset, offset + usersPerPage);

      return {
        users: pageUsers.map(mapAdminUser),
        hasMore: matchedUsers.length > offset + usersPerPage,
      };
    }

    const users = await collection
      .find(query)
      .sort({ [sortBy]: sortDirection })
      .skip(offset)
      .limit(usersPerPage + 1)
      .toArray();

    return {
      users: users.slice(0, usersPerPage).map(mapAdminUser),
      hasMore: users.length > usersPerPage,
    };
  } catch (error) {
    logError(error, 'MongoDB operation failed', { area: 'mongodb', tags: { operation: 'findUsers' } });
    return { users: [], hasMore: false };
  }
}

/** Returns all applications that appear in a role assigned to at least one user. */
export async function getUserRoleApplications(): Promise<string[]> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    const applications = await db.collection('users').distinct('roles.application');
    return applications.filter((app): app is string => typeof app === 'string' && app !== '').sort();
  } catch (error) {
    logError(error, 'MongoDB operation failed', { area: 'mongodb', tags: { operation: 'getUserRoleApplications' } });
    return [];
  }
}

export async function addAuthorizedApp(
  name: string,
  displayName: string,
  url: string,
  websocketEndpoint?: string | null
): Promise<DbUpdateResult> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    await db.collection('authorizedApps').insertOne({ name, displayName, url, apiKey: nanoid(64), websocketEndpoint });
    return { success: true };
  } catch (error) {
    logError(error, 'MongoDB operation failed', { area: 'mongodb', tags: { operation: 'addAuthorizedApp' } });
    return { success: false };
  }
}

export async function deleteAuthorizedApp(name: string): Promise<DbUpdateResult> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    await db.collection('authorizedApps').deleteOne({ name });
    return { success: true };
  } catch (error) {
    logError(error, 'MongoDB operation failed', { area: 'mongodb', tags: { operation: 'deleteAuthorizedApp' } });
    return { success: false };
  }
}

export async function setUserRoles(userId: string, roles: RoleModel[]): Promise<DbUpdateResult> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    await db.collection('users').updateOne({ userId }, { $set: { roles } });
    return { success: true };
  } catch (error) {
    logError(error, 'MongoDB operation failed', { area: 'mongodb', tags: { operation: 'setUserRoles' } });
    return { success: false };
  }
}

export async function getUserByUserId(userId: string): Promise<UserWithPassword | null> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);

    const user = await db.collection('users').findOne({ userId: userId });
    if (!user) {
      return null;
    }

    return {
      userId: user.userId,
      email: user.email,
      password: user.password,
      displayName: user.displayName,
      username: user.username,
      roles: user.roles,
      profileImageId: user.profileImageId,
      profileImageUrl: user.profileImageUrl,
      emailVerified: user.emailVerified,
    };
  } catch (error) {
    logError(error, 'MongoDB operation failed', { area: 'mongodb', tags: { operation: 'getUserByUserId' } });
    return null;
  }
}

export async function removeAuthCode(authCode: string): Promise<DbUpdateResult> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    await db.collection('authCodes').deleteOne({ authCode });
    return { success: true };
  } catch (error) {
    logError(error, 'MongoDB operation failed', { area: 'mongodb', tags: { operation: 'removeAuthCode' } });
    return { success: false };
  }
}

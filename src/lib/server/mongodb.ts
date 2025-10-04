import 'server-only';
import { getServerState } from '@/lib/server/serverState';
import { nanoid } from 'nanoid';
import { UserWithPassword } from '@/lib/models/User';
import { RoleModel, User } from '@authapex/core';

export interface DbUpdateResult {
  success: boolean;
}

export async function setDisplayName(userId: string, newDisplayName: string): Promise<DbUpdateResult> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    await db.collection('users').updateOne({ userId }, { $set: { displayName: newDisplayName } });
    return { success: true };
  } catch {
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
  } catch {
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
  } catch {
    return { success: false };
  }
}

export async function invalidateSession({ sessionId }: { sessionId: string }): Promise<DbUpdateResult> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    await db.collection('sessions').deleteOne({ sessionId });
    return { success: true };
  } catch {
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
  } catch {
    return { success: false };
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
  } catch {
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
  } catch {
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
  } catch {
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
    const normalizedUsername = username
      .trim()
      .replace(/\s/g, '_')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();

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
  } catch {
    return null;
  }
}

export async function insertAuthCode(authCode: string, userId: string): Promise<DbUpdateResult> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    await db.collection('authCodes').insertOne({ authCode, userId });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function getUserIdByAuthCode(authCode: string): Promise<string | null> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    const authCodeDoc = await db.collection('authCodes').findOne({ authCode });
    if (!authCodeDoc) {
      return null;
    }
    return authCodeDoc.userId;
  } catch {
    return null;
  }
}

export async function isAppAuthorizedToSeeUser(
  app: string,
  apiKey: string | null | undefined,
  userId: string
): Promise<boolean> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);

    const authorizedApp = await db.collection('authorizedApps').findOne({ name: app });
    if (authorizedApp && authorizedApp.apiKey !== apiKey) {
      return false;
    }

    const userAppSession = await db.collection('userAppSessions').findOne({ app, userId });
    return !!userAppSession;
  } catch {
    return false;
  }
}

export async function authorizeAppToSeeUser(
  app: string,
  apiKey: string | null | undefined,
  userId: string
): Promise<DbUpdateResult> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);

    const authorizedApp = await db.collection('authorizedApps').findOne({ name: app });
    const verified = authorizedApp ? authorizedApp.apiKey === apiKey : null;

    const existingUserSession = await db.collection('userAppSessions').findOne({ app, userId, verified });
    if (existingUserSession) {
      return { success: true };
    }
    await db.collection('userAppSessions').insertOne({ app, userId, verified });

    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function getUserAppSessions(
  userId: string
): Promise<{ app: string; userId: string; displayName?: string; url?: string; verified: boolean | null }[]> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    const userAppSessions = await db.collection('userAppSessions').find({ userId }).toArray();
    const authorizedApps = await db.collection('authorizedApps').find({}).toArray();

    return userAppSessions.map((session) => {
      const authorizedApp = authorizedApps.find((app) => app.name === session.app);
      return {
        app: session.app,
        userId: session.userId,
        displayName: authorizedApp?.displayName,
        url: authorizedApp?.url,
        verified: session.verified,
      };
    });
  } catch {
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
  } catch {
    return { success: false };
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
  } catch {
    return [];
  }
}

export async function getAuthorizedAppsSanitized(): Promise<{ name: string; displayName: string; url: string }[]> {
  try {
    return getAuthorizedApps().then((apps) =>
      apps.map((app) => ({ name: app.name, displayName: app.displayName, url: app.url }))
    );
  } catch {
    return [];
  }
}

export async function getUsers(page: number, usersPerPage: number = 5): Promise<User[]> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    const users = await db
      .collection('users')
      .find({})
      .skip(page * usersPerPage)
      .limit(usersPerPage)
      .toArray();
    return users.map((user) => ({
      userId: user.userId,
      email: user.email,
      displayName: user.displayName,
      username: user.username,
      roles: user.roles,
      profileImageId: user.profileImageId,
      profileImageUrl: user.profileImageUrl,
    }));
  } catch {
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
  } catch {
    return { success: false };
  }
}

export async function deleteAuthorizedApp(name: string): Promise<DbUpdateResult> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    await db.collection('authorizedApps').deleteOne({ name });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function setUserRoles(userId: string, roles: RoleModel[]): Promise<DbUpdateResult> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    await db.collection('users').updateOne({ userId }, { $set: { roles } });
    return { success: true };
  } catch {
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
    };
  } catch {
    return null;
  }
}

export async function removeAuthCode(authCode: string): Promise<DbUpdateResult> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    await db.collection('authCodes').deleteOne({ authCode });
    return { success: true };
  } catch {
    return { success: false };
  }
}

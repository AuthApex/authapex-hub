import 'server-only';
import { getServerState } from '@/lib/server/serverState';
import { nanoid } from 'nanoid';
import { UserWithPassword } from '@/lib/models/User';

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
    const userId = nanoid();
    const emailVerificationKey = nanoid();
    const inserted = await db.collection('users').insertOne({
      userId,
      googleId,
      username: username.trim().replace(/\s/g, '_').toLowerCase(),
      email,
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

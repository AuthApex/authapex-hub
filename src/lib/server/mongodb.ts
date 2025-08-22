import 'server-only';
import { getServerState } from '@/lib/server/serverState';
import { nanoid } from 'nanoid';
import { UserWithPassword } from '@/lib/models/User';

export async function invalidateSession({ sessionId }: { sessionId: string }) {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    await db.collection('sessions').deleteOne({ sessionId });
  } catch {
    return;
  }
}

export async function insertSession({
  userId,
  sessionId,
  app,
  expiresAt,
}: {
  userId: string;
  sessionId: string;
  app: string;
  expiresAt: Date;
}): Promise<{ inserted: boolean }> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    await db.collection('sessions').insertOne({ userId, sessionId, app, expiresAt });
    return { inserted: true };
  } catch {
    return { inserted: false };
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

export async function getUserBySession(sessionId: string, app: string): Promise<UserWithPassword | null> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    const session = await db.collection('sessions').findOne({ sessionId, app, expiresAt: { $gt: new Date() } });

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
      username,
      email,
      password,
      emailVerified: emailVerified,
      emailVerificationKey,
      roles: [],
      displayName: username.toLowerCase().trim(),
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

export async function insertAuthCode(authCode: string, userId: string) {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    await db.collection('authCodes').insertOne({ authCode, userId });
  } catch {
    return;
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

export async function removeAuthCode(authCode: string) {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    await db.collection('authCodes').deleteOne({ authCode });
  } catch {
    return;
  }
}

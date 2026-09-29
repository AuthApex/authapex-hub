import 'server-only';
import { getServerState } from '@/lib/server/serverState';
import { nanoid } from 'nanoid';
import { DbUpdateResult } from '@/lib/server/mongodb';

export interface OidcClient {
  clientId: string;
  clientSecret: string;
  displayName: string;
  redirectUris: string[];
  scopes: string[];
}

export interface OidcAuthCode {
  code: string;
  clientId: string;
  userId: string;
  redirectUri: string;
  scope: string;
  nonce?: string | null;
  authTime: number;
  expiresAt: Date;
}

export interface OidcRefreshToken {
  token: string;
  clientId: string;
  userId: string;
  scope: string;
  authTime: number;
  expiresAt: Date;
}

export interface OidcGrant {
  clientId: string;
  userId: string;
  scope: string;
  displayName?: string;
  createdAt: Date;
}

export async function getOidcClient(clientId: string): Promise<OidcClient | null> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    const client = await db.collection('oidcClients').findOne({ clientId });
    if (client == null) {
      return null;
    }
    return {
      clientId: client.clientId,
      clientSecret: client.clientSecret,
      displayName: client.displayName,
      redirectUris: client.redirectUris ?? [],
      scopes: client.scopes ?? [],
    };
  } catch {
    return null;
  }
}

export async function getOidcClients(): Promise<OidcClient[]> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    const clients = await db.collection('oidcClients').find({}).toArray();
    return clients.map((client) => ({
      clientId: client.clientId,
      clientSecret: client.clientSecret,
      displayName: client.displayName,
      redirectUris: client.redirectUris ?? [],
      scopes: client.scopes ?? [],
    }));
  } catch {
    return [];
  }
}

export async function addOidcClient(
  displayName: string,
  redirectUris: string[],
  scopes: string[]
): Promise<DbUpdateResult> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    await db.collection('oidcClients').insertOne({
      clientId: nanoid(32),
      clientSecret: nanoid(64),
      displayName,
      redirectUris,
      scopes,
      createdAt: new Date(),
    });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function deleteOidcClient(clientId: string): Promise<DbUpdateResult> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    await db.collection('oidcClients').deleteOne({ clientId });
    await db.collection('oidcGrants').deleteMany({ clientId });
    await db.collection('oidcAuthCodes').deleteMany({ clientId });
    await db.collection('oidcRefreshTokens').deleteMany({ clientId });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function insertOidcAuthCode(authCode: OidcAuthCode): Promise<DbUpdateResult> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    await db.collection('oidcAuthCodes').insertOne({ ...authCode });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function consumeOidcAuthCode(code: string): Promise<OidcAuthCode | null> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    const authCode = await db.collection('oidcAuthCodes').findOneAndDelete({ code });
    if (authCode == null) {
      return null;
    }
    return {
      code: authCode.code,
      clientId: authCode.clientId,
      userId: authCode.userId,
      redirectUri: authCode.redirectUri,
      scope: authCode.scope,
      nonce: authCode.nonce,
      authTime: authCode.authTime,
      expiresAt: authCode.expiresAt,
    };
  } catch {
    return null;
  }
}

export async function insertOidcRefreshToken(refreshToken: OidcRefreshToken): Promise<DbUpdateResult> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    await db.collection('oidcRefreshTokens').insertOne({ ...refreshToken });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function consumeOidcRefreshToken(token: string): Promise<OidcRefreshToken | null> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    const refreshToken = await db.collection('oidcRefreshTokens').findOneAndDelete({ token });
    if (refreshToken == null) {
      return null;
    }
    return {
      token: refreshToken.token,
      clientId: refreshToken.clientId,
      userId: refreshToken.userId,
      scope: refreshToken.scope,
      authTime: refreshToken.authTime,
      expiresAt: refreshToken.expiresAt,
    };
  } catch {
    return null;
  }
}

export async function getOidcGrant(clientId: string, userId: string): Promise<OidcGrant | null> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    const grant = await db.collection('oidcGrants').findOne({ clientId, userId });
    if (grant == null) {
      return null;
    }
    return {
      clientId: grant.clientId,
      userId: grant.userId,
      scope: grant.scope,
      createdAt: grant.createdAt,
    };
  } catch {
    return null;
  }
}

export async function upsertOidcGrant(clientId: string, userId: string, scope: string): Promise<DbUpdateResult> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    await db
      .collection('oidcGrants')
      .updateOne(
        { clientId, userId },
        { $set: { scope }, $setOnInsert: { clientId, userId, createdAt: new Date() } },
        { upsert: true }
      );
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function getOidcGrants(userId: string): Promise<OidcGrant[]> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    const grants = await db.collection('oidcGrants').find({ userId }).toArray();
    const clients = await getOidcClients();

    return grants.map((grant) => ({
      clientId: grant.clientId,
      userId: grant.userId,
      scope: grant.scope,
      displayName: clients.find((client) => client.clientId === grant.clientId)?.displayName,
      createdAt: grant.createdAt,
    }));
  } catch {
    return [];
  }
}

export async function removeOidcGrant(clientId: string, userId: string): Promise<DbUpdateResult> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    await db.collection('oidcGrants').deleteOne({ clientId, userId });
    await db.collection('oidcAuthCodes').deleteMany({ clientId, userId });
    await db.collection('oidcRefreshTokens').deleteMany({ clientId, userId });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function removeOidcUserTokens(userId: string): Promise<DbUpdateResult> {
  try {
    const serverState = getServerState();
    const db = serverState.mongoClient.db(serverState.mongoDbName);
    await db.collection('oidcAuthCodes').deleteMany({ userId });
    await db.collection('oidcRefreshTokens').deleteMany({ userId });
    return { success: true };
  } catch {
    return { success: false };
  }
}

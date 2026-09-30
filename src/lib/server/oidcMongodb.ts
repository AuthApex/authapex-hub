import 'server-only';
import { Db, Document } from 'mongodb';
import { getServerState } from '@/lib/server/serverState';
import { nanoid } from 'nanoid';
import { DbUpdateResult } from '@/lib/server/mongodb';
import { hashOidcSecret } from '@/lib/server/oidc/hash';

export interface OidcClient {
  clientId: string;
  displayName: string;
  redirectUris: string[];
  scopes: string[];
}

export interface OidcClientWithSecretHash extends OidcClient {
  clientSecretHash: string;
}

export interface OidcAuthCode {
  clientId: string;
  userId: string;
  redirectUri: string;
  scope: string;
  nonce?: string | null;
  codeChallenge?: string | null;
  codeChallengeMethod?: string | null;
  authTime: number;
  expiresAt: Date;
}

export interface OidcRefreshToken {
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

export type OidcClientCredentialsResult =
  | { success: true; clientId: string; clientSecret: string }
  | { success: false };

async function getOidcDb(): Promise<Db> {
  const serverState = getServerState();
  return serverState.mongoClient.db(serverState.mongoDbName);
}

function toOidcClient(client: Document): OidcClient {
  return {
    clientId: client.clientId,
    displayName: client.displayName,
    redirectUris: client.redirectUris ?? [],
    scopes: client.scopes ?? [],
  };
}

export async function getOidcClient(clientId: string): Promise<OidcClient | null> {
  try {
    const db = await getOidcDb();
    const client = await db.collection('oidcClients').findOne({ clientId });
    return client == null ? null : toOidcClient(client);
  } catch {
    return null;
  }
}

export async function getOidcClientWithSecretHash(clientId: string): Promise<OidcClientWithSecretHash | null> {
  try {
    const db = await getOidcDb();
    const client = await db.collection('oidcClients').findOne({ clientId });
    if (client == null || typeof client.clientSecretHash !== 'string') {
      return null;
    }
    return { ...toOidcClient(client), clientSecretHash: client.clientSecretHash };
  } catch {
    return null;
  }
}

export async function getOidcClients(): Promise<OidcClient[]> {
  try {
    const db = await getOidcDb();
    const clients = await db.collection('oidcClients').find({}).toArray();
    return clients.map(toOidcClient);
  } catch {
    return [];
  }
}

export async function addOidcClient(
  displayName: string,
  redirectUris: string[],
  scopes: string[]
): Promise<OidcClientCredentialsResult> {
  try {
    const db = await getOidcDb();
    const clientId = nanoid(32);
    const clientSecret = nanoid(64);
    await db.collection('oidcClients').insertOne({
      clientId,
      clientSecretHash: hashOidcSecret(clientSecret),
      displayName,
      redirectUris,
      scopes,
      createdAt: new Date(),
    });
    return { success: true, clientId, clientSecret };
  } catch {
    return { success: false };
  }
}

export async function regenerateOidcClientSecret(clientId: string): Promise<OidcClientCredentialsResult> {
  try {
    const db = await getOidcDb();
    const clientSecret = nanoid(64);
    const result = await db
      .collection('oidcClients')
      .updateOne({ clientId }, { $set: { clientSecretHash: hashOidcSecret(clientSecret) } });
    if (result.matchedCount === 0) {
      return { success: false };
    }
    return { success: true, clientId, clientSecret };
  } catch {
    return { success: false };
  }
}

export async function deleteOidcClient(clientId: string): Promise<DbUpdateResult> {
  try {
    const db = await getOidcDb();
    await db.collection('oidcClients').deleteOne({ clientId });
    await db.collection('oidcGrants').deleteMany({ clientId });
    await db.collection('oidcAuthCodes').deleteMany({ clientId });
    await db.collection('oidcRefreshTokens').deleteMany({ clientId });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function insertOidcAuthCode(code: string, authCode: OidcAuthCode): Promise<DbUpdateResult> {
  try {
    const db = await getOidcDb();
    await db.collection('oidcAuthCodes').insertOne({ ...authCode, codeHash: hashOidcSecret(code) });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function consumeOidcAuthCode(code: string): Promise<OidcAuthCode | null> {
  try {
    const db = await getOidcDb();
    const authCode = await db.collection('oidcAuthCodes').findOneAndDelete({ codeHash: hashOidcSecret(code) });
    if (authCode == null) {
      return null;
    }
    return {
      clientId: authCode.clientId,
      userId: authCode.userId,
      redirectUri: authCode.redirectUri,
      scope: authCode.scope,
      nonce: authCode.nonce,
      codeChallenge: authCode.codeChallenge,
      codeChallengeMethod: authCode.codeChallengeMethod,
      authTime: authCode.authTime,
      expiresAt: authCode.expiresAt,
    };
  } catch {
    return null;
  }
}

export async function insertOidcRefreshToken(token: string, refreshToken: OidcRefreshToken): Promise<DbUpdateResult> {
  try {
    const db = await getOidcDb();
    await db.collection('oidcRefreshTokens').insertOne({ ...refreshToken, tokenHash: hashOidcSecret(token) });
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function consumeOidcRefreshToken(token: string): Promise<OidcRefreshToken | null> {
  try {
    const db = await getOidcDb();
    const refreshToken = await db
      .collection('oidcRefreshTokens')
      .findOneAndDelete({ tokenHash: hashOidcSecret(token) });
    if (refreshToken == null) {
      return null;
    }
    return {
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
    const db = await getOidcDb();
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
    const db = await getOidcDb();
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
    const db = await getOidcDb();
    const grants = await db.collection('oidcGrants').find({ userId }).toArray();
    const clients = await db
      .collection('oidcClients')
      .find(
        { clientId: { $in: grants.map((grant) => grant.clientId) } },
        { projection: { clientId: 1, displayName: 1 } }
      )
      .toArray();

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
    const db = await getOidcDb();
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
    const db = await getOidcDb();
    await db.collection('oidcAuthCodes').deleteMany({ userId });
    await db.collection('oidcRefreshTokens').deleteMany({ userId });
    return { success: true };
  } catch {
    return { success: false };
  }
}

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
  postLogoutRedirectUris: string[];
  scopes: string[];
}

export interface OidcClientWithSecretHash extends OidcClient {
  clientSecretHash: string;
}

export interface OidcAuthCode {
  familyId: string;
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
  familyId: string;
  clientId: string;
  userId: string;
  scope: string;
  authTime: number;
  expiresAt: Date;
}

// Codes and refresh tokens are marked as used instead of being deleted, so a replay can be detected.
// Everything issued from the same authorization code shares a familyId and is revoked together on replay.
export type OidcConsumeResult<T> = { type: 'valid'; value: T } | { type: 'reused' } | { type: 'invalid' };

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
    postLogoutRedirectUris: client.postLogoutRedirectUris ?? [],
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
  postLogoutRedirectUris: string[],
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
      postLogoutRedirectUris,
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

async function revokeOidcTokenFamily(db: Db, familyId: unknown): Promise<void> {
  if (typeof familyId !== 'string') {
    return;
  }
  await db.collection('oidcRefreshTokens').deleteMany({ familyId });
}

export async function consumeOidcAuthCode(code: string): Promise<OidcConsumeResult<OidcAuthCode>> {
  try {
    const db = await getOidcDb();
    const codeHash = hashOidcSecret(code);
    const authCode = await db
      .collection('oidcAuthCodes')
      .findOneAndUpdate({ codeHash, usedAt: { $exists: false } }, { $set: { usedAt: new Date() } });
    if (authCode == null) {
      const usedAuthCode = await db.collection('oidcAuthCodes').findOne({ codeHash });
      if (usedAuthCode == null) {
        return { type: 'invalid' };
      }
      await revokeOidcTokenFamily(db, usedAuthCode.familyId);
      return { type: 'reused' };
    }
    return {
      type: 'valid',
      value: {
        familyId: authCode.familyId,
        clientId: authCode.clientId,
        userId: authCode.userId,
        redirectUri: authCode.redirectUri,
        scope: authCode.scope,
        nonce: authCode.nonce,
        codeChallenge: authCode.codeChallenge,
        codeChallengeMethod: authCode.codeChallengeMethod,
        authTime: authCode.authTime,
        expiresAt: authCode.expiresAt,
      },
    };
  } catch {
    return { type: 'invalid' };
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

export async function consumeOidcRefreshToken(token: string): Promise<OidcConsumeResult<OidcRefreshToken>> {
  try {
    const db = await getOidcDb();
    const tokenHash = hashOidcSecret(token);
    const refreshToken = await db
      .collection('oidcRefreshTokens')
      .findOneAndUpdate({ tokenHash, usedAt: { $exists: false } }, { $set: { usedAt: new Date() } });
    if (refreshToken == null) {
      const usedRefreshToken = await db.collection('oidcRefreshTokens').findOne({ tokenHash });
      if (usedRefreshToken == null) {
        return { type: 'invalid' };
      }
      await revokeOidcTokenFamily(db, usedRefreshToken.familyId);
      return { type: 'reused' };
    }
    return {
      type: 'valid',
      value: {
        familyId: refreshToken.familyId,
        clientId: refreshToken.clientId,
        userId: refreshToken.userId,
        scope: refreshToken.scope,
        authTime: refreshToken.authTime,
        expiresAt: refreshToken.expiresAt,
      },
    };
  } catch {
    return { type: 'invalid' };
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

export async function addOidcGrantScopes(clientId: string, userId: string, scopes: string[]): Promise<DbUpdateResult> {
  try {
    const db = await getOidcDb();
    const existingGrant = await db.collection('oidcGrants').findOne({ clientId, userId });
    const existingScopes = typeof existingGrant?.scope === 'string' ? existingGrant.scope.split(' ') : [];
    const scope = Array.from(new Set([...existingScopes, ...scopes].filter(Boolean))).join(' ');
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

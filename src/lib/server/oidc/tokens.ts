import 'server-only';
import { createHash } from 'crypto';
import { JWTPayload, jwtVerify, SignJWT } from 'jose';
import { nanoid } from 'nanoid';
import { UserWithPassword } from '@/lib/models/User';
import { getOidcSigningKey } from '@/lib/server/oidc/keys';
import { getOidcIssuer, OIDC_ACCESS_TOKEN_LIFETIME_SECONDS } from '@/lib/server/oidc/config';

export interface OidcAccessTokenPayload extends JWTPayload {
  scope?: string;
  client_id?: string;
}

export function getOidcUserClaims(user: UserWithPassword, scopes: string[]): JWTPayload {
  const claims: JWTPayload = {};

  if (scopes.includes('profile')) {
    claims.name = user.displayName;
    claims.nickname = user.displayName;
    claims.preferred_username = user.username;
    if (user.profileImageUrl) {
      claims.picture = user.profileImageUrl;
    }
  }

  if (scopes.includes('email')) {
    claims.email = user.email;
    claims.email_verified = user.emailVerified === true;
  }

  if (scopes.includes('groups')) {
    claims.groups = (user.roles ?? []).map((role) => `${role.application}:${role.role}`);
    claims.roles = user.roles ?? [];
  }

  return claims;
}

function getAtHash(accessToken: string, alg: string): string {
  const digest = createHash(`sha${alg.slice(-3)}`)
    .update(accessToken)
    .digest();
  return digest.subarray(0, digest.length / 2).toString('base64url');
}

export async function signOidcAccessToken({
  userId,
  clientId,
  scope,
}: {
  userId: string;
  clientId: string;
  scope: string;
}): Promise<string> {
  const { privateKey, alg, kid } = await getOidcSigningKey();
  const issuer = getOidcIssuer();

  return new SignJWT({ scope, client_id: clientId })
    .setProtectedHeader({ alg, kid, typ: 'at+jwt' })
    .setIssuer(issuer)
    .setSubject(userId)
    .setAudience(issuer)
    .setIssuedAt()
    .setJti(nanoid())
    .setExpirationTime(`${OIDC_ACCESS_TOKEN_LIFETIME_SECONDS}s`)
    .sign(privateKey);
}

export async function signOidcIdToken({
  user,
  clientId,
  scope,
  nonce,
  authTime,
  accessToken,
}: {
  user: UserWithPassword;
  clientId: string;
  scope: string;
  nonce?: string | null;
  authTime: number;
  accessToken: string;
}): Promise<string> {
  const { privateKey, alg, kid } = await getOidcSigningKey();
  const scopes = scope.split(' ').filter(Boolean);

  const payload: JWTPayload = {
    ...getOidcUserClaims(user, scopes),
    auth_time: authTime,
    at_hash: getAtHash(accessToken, alg),
  };
  if (nonce) {
    payload.nonce = nonce;
  }

  return new SignJWT(payload)
    .setProtectedHeader({ alg, kid })
    .setIssuer(getOidcIssuer())
    .setSubject(user.userId)
    .setAudience(clientId)
    .setIssuedAt()
    .setExpirationTime(`${OIDC_ACCESS_TOKEN_LIFETIME_SECONDS}s`)
    .sign(privateKey);
}

export async function verifyOidcAccessToken(token: string): Promise<OidcAccessTokenPayload | null> {
  try {
    const { publicKey, alg } = await getOidcSigningKey();
    const issuer = getOidcIssuer();
    const { payload } = await jwtVerify<OidcAccessTokenPayload>(token, publicKey, {
      issuer,
      audience: issuer,
      algorithms: [alg],
    });
    return payload;
  } catch {
    return null;
  }
}

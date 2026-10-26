import { NextRequest, NextResponse } from 'next/server';
import { getUserByUserId } from '@/lib/server/mongodb';
import { getOidcGrant } from '@/lib/server/oidcMongodb';
import { getOidcUserClaims, verifyOidcAccessToken } from '@/lib/server/oidc/tokens';
import { NO_STORE_HEADERS } from '@/lib/server/api';
import { logError } from '@/lib/server/logger';

function unauthorized(description: string) {
  return NextResponse.json(
    { error: 'invalid_token', error_description: description },
    {
      status: 401,
      headers: { ...NO_STORE_HEADERS, 'WWW-Authenticate': `Bearer error="invalid_token"` },
    }
  );
}

async function handleUserinfo(request: NextRequest) {
  const authorizationHeader = request.headers.get('authorization');
  if (authorizationHeader == null || !authorizationHeader.toLowerCase().startsWith('bearer ')) {
    return unauthorized('A bearer access token is required.');
  }

  const payload = await verifyOidcAccessToken(authorizationHeader.slice(7).trim());
  if (payload?.sub == null || payload.client_id == null) {
    return unauthorized('The access token is not valid.');
  }

  const grant = await getOidcGrant(payload.client_id, payload.sub);
  if (grant == null) {
    return unauthorized('The user has revoked access for this application.');
  }

  const user = await getUserByUserId(payload.sub);
  if (user == null) {
    return unauthorized('The user no longer exists.');
  }

  const scopes = (payload.scope ?? '').split(' ').filter(Boolean);

  return NextResponse.json({ sub: user.userId, ...getOidcUserClaims(user, scopes) }, { headers: NO_STORE_HEADERS });
}

async function handleUserinfoRoute(request: NextRequest) {
  try {
    return await handleUserinfo(request);
  } catch (error) {
    logError(error, 'OIDC userinfo endpoint failed', { area: 'oidc-userinfo' });
    return NextResponse.json(
      { error: 'server_error', error_description: 'The user information could not be loaded.' },
      { status: 500, headers: NO_STORE_HEADERS }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleUserinfoRoute(request);
}

export async function POST(request: NextRequest) {
  return handleUserinfoRoute(request);
}

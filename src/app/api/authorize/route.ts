import { NextRequest, NextResponse } from 'next/server';
import { authorizeAppToSeeUser, getUserByUserId, getUserIdByAuthCode, removeAuthCode } from '@/lib/server/mongodb';
import { User } from '@authapex/core';
import { object, string } from 'yup';

interface TokenRequest {
  authCode: string;
  app: string;
  apiKey?: string | null;
}

export async function POST(request: NextRequest) {
  const payload: TokenRequest = await request.json();

  const isValid = await object({
    authCode: string().required(),
    app: string().required(),
    apiKey: string().optional().nullable(),
  }).isValid(payload);

  if (!isValid) {
    return NextResponse.json({ error: 'Missing auth code or app' }, { status: 400 });
  }

  const userId = await getUserIdByAuthCode(payload.authCode);
  if (userId == null) {
    return NextResponse.json({ error: 'Auth code not valid' }, { status: 401 });
  }

  const user = await getUserByUserId(userId);
  if (!user) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  await removeAuthCode(payload.authCode);
  const result = await authorizeAppToSeeUser(payload.app, payload.apiKey, userId);
  if (!result.success) {
    return NextResponse.json({ error: 'Cannot create user session' }, { status: 500 });
  }

  return NextResponse.json<User>({
    userId: user.userId,
    email: user.email,
    displayName: user.displayName,
    username: user.username,
    roles: user.roles,
    profileImageId: user.profileImageId,
    profileImageUrl: user.profileImageUrl,
  });
}

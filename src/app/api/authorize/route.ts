import { NextRequest, NextResponse } from 'next/server';
import { getUserByUserId, getUserIdByAuthCode, removeAuthCode } from '@/lib/server/mongodb';
import { User } from '@authapex/core';

interface TokenRequest {
  authCode?: string;
  app?: string;
}

export async function POST(request: NextRequest) {
  const payload: TokenRequest = await request.json();
  if (typeof payload.authCode != 'string' || typeof payload.app != 'string') {
    return NextResponse.json({ error: 'Missing auth code or app' }, { status: 400 });
  }

  const userId = await getUserIdByAuthCode(payload.authCode);
  if (userId == null) {
    return NextResponse.json({ error: 'Auth code not valid' }, { status: 401 });
  }
  const user = await getUserByUserId(userId);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await removeAuthCode(payload.authCode);
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

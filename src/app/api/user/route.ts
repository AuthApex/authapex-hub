import { NextRequest, NextResponse } from 'next/server';
import { getUserByUserId, isAppAuthorizedToSeeUser } from '@/lib/server/mongodb';
import { User } from '@authapex/core';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const userId = params.get('userId');
  const app = params.get('app');
  const apiKey = params.get('apiKey');

  if (userId == null || app == null) {
    return NextResponse.json({ error: 'Missing userId or app' }, { status: 400 });
  }

  const result = await isAppAuthorizedToSeeUser(app, apiKey, userId);
  if (!result) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getUserByUserId(userId);
  if (user == null) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  return NextResponse.json({
    userId: user.userId,
    username: user.username,
    displayName: user.displayName,
    profileImageId: user.profileImageId,
    profileImageUrl: user.profileImageUrl,
    email: user.email,
    roles: user.roles,
  } as User);
}

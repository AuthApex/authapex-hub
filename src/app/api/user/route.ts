import { NextRequest, NextResponse } from 'next/server';
import { getUserByUserId } from '@/lib/server/mongodb';
import { SimpleUser } from '@authapex/core';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const userId = params.get('userId');

  if (userId == null) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
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
  } as SimpleUser);
}

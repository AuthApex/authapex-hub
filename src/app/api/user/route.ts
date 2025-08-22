import { NextRequest, NextResponse } from 'next/server';
import { decrypt } from '@/lib/server/encryption';
import { SessionPayload } from '@/lib/server/session';
import { getUserBySession } from '@/lib/server/mongodb';
import { User } from '@authapex/core';

export interface UserRequest {
  session?: string;
  app?: string;
}

export interface UserResponse {
  expiresAt: string;
  user: User;
}

export async function POST(request: NextRequest) {
  const payload: UserRequest = await request.json();
  if (typeof payload.session != 'string' || typeof payload.app != 'string') {
    return NextResponse.json({ error: 'Missing auth token or app' }, { status: 400 });
  }

  const session = await decrypt<SessionPayload>(payload.session);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getUserBySession(session.sessionId, payload.app);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json<UserResponse>({
    expiresAt: session.expiresAt,
    user: {
      userId: user.userId,
      email: user.email,
      displayName: user.displayName,
      username: user.username,
      roles: user.roles,
      profileImageId: user.profileImageId,
      profileImageUrl: user.profileImageUrl,
    },
  });
}

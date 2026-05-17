import { NextRequest, NextResponse } from 'next/server';
import { getUserByUserId, isAppAuthorizedToSeeUser } from '@/lib/server/mongodb';
import { User } from '@authapex/core';
import { object, string } from 'yup';

interface UserRequestPayload {
  userId: string;
  app: string;
  apiKey?: string | null;
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const payload = {
    userId: params.get('userId'),
    app: params.get('app'),
    apiKey: params.get('apiKey'),
  } as UserRequestPayload;

  const isValid = await object({
    userId: string().required(),
    app: string().required(),
    apiKey: string().optional().nullable(),
  }).isValid(payload);

  if (!isValid) {
    return NextResponse.json({ error: 'Missing userId or app' }, { status: 400 });
  }

  const result = await isAppAuthorizedToSeeUser(payload.app, payload.apiKey, payload.userId);
  if (!result) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getUserByUserId(payload.userId);
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

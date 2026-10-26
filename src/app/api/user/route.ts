import { NextRequest } from 'next/server';
import { getUserByUserId, isAppAuthorizedToSeeUser } from '@/lib/server/mongodb';
import { User } from '@authapex/core';
import { object, string } from 'yup';
import { apiError, handleRouteError, jsonNoStore } from '@/lib/server/api';

interface UserRequestPayload {
  userId: string;
  app: string;
  apiKey?: string | null;
}

export async function GET(request: NextRequest) {
  try {
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
      return apiError('Missing userId or app', 400);
    }

    const result = await isAppAuthorizedToSeeUser(payload.app, payload.apiKey, payload.userId);
    if (!result) {
      return apiError('Unauthorized', 401);
    }

    const user = await getUserByUserId(payload.userId);
    if (user == null) {
      return apiError('User not found', 404);
    }

    return jsonNoStore({
      userId: user.userId,
      username: user.username,
      displayName: user.displayName,
      profileImageId: user.profileImageId,
      profileImageUrl: user.profileImageUrl,
      email: user.email,
      roles: user.roles,
    } as User);
  } catch (error) {
    return handleRouteError(error, '/api/user');
  }
}

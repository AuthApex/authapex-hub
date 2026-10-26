import { NextRequest } from 'next/server';
import { authorizeAppToSeeUser, getUserByUserId, getUserIdByAuthCode, removeAuthCode } from '@/lib/server/mongodb';
import { TokenRequest, User } from '@authapex/core';
import { object, string } from 'yup';
import { apiError, handleRouteError, jsonNoStore } from '@/lib/server/api';

export async function POST(request: NextRequest) {
  let payload: TokenRequest;
  try {
    payload = await request.json();
  } catch {
    return apiError('Invalid JSON body', 400);
  }

  try {
    const isValid = await object({
      authCode: string().required(),
      app: string().required(),
      apiKey: string().optional().nullable(),
      websocketEndpoint: string().optional().nullable(),
    }).isValid(payload);

    if (!isValid) {
      return apiError('Missing auth code or app', 400);
    }

    const authCodeData = await getUserIdByAuthCode(payload.authCode);
    if (authCodeData == null) {
      return apiError('Auth code not valid', 401);
    }
    const { userId, status } = authCodeData;

    const user = await getUserByUserId(userId);
    if (!user) {
      return apiError('Not found', 404);
    }

    const removedAuthCode = await removeAuthCode(payload.authCode);
    if (!removedAuthCode.success) {
      return apiError('Internal Server Error', 500);
    }
    const result = await authorizeAppToSeeUser(payload, userId, status);
    if (!result.success) {
      return apiError('Cannot create user session', 500);
    }

    return jsonNoStore<User>({
      userId: user.userId,
      email: user.email,
      displayName: user.displayName,
      username: user.username,
      roles: user.roles,
      profileImageId: user.profileImageId,
      profileImageUrl: user.profileImageUrl,
    });
  } catch (error) {
    return handleRouteError(error, '/api/authorize');
  }
}

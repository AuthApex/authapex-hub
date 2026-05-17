import 'server-only';
import { User, WebSocketEvent } from '@authapex/core';
import { getUserAppSession, getUserAppSessions } from '@/lib/server/mongodb';
import axios from 'axios';

export async function notifyUserUpdate(user: User): Promise<void> {
  const userAppSessions = await getUserAppSessions(user.userId);
  const promisses = userAppSessions.map((session) => {
    if (session.websocketEndpoint == null) {
      return;
    }
    return axios
      .post(session.websocketEndpoint, {
        type: 'user-update',
        data: {
          userId: user.userId,
        },
      } as WebSocketEvent)
      .catch(console.error);
  });

  await Promise.all(promisses);
}

export async function notifySessionDelete(userId: string, app: string, verified: boolean | null): Promise<void> {
  const session = await getUserAppSession(userId, app, verified);
  if (session?.websocketEndpoint == null) {
    return;
  }
  await axios
    .post(session.websocketEndpoint, {
      type: 'session-deleted',
      data: {
        userId,
      },
    } as WebSocketEvent)
    .catch(console.error);
}

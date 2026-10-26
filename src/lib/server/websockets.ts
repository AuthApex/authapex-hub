import 'server-only';
import { User, WebSocketEvent } from '@authapex/core';
import { getUserAppSession, getUserAppSessions } from '@/lib/server/mongodb';
import { logWarning } from '@/lib/server/logger';
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
      .catch((error) => {
        logWarning('User update notification failed', { area: 'websockets', tags: { event: 'user-update' } }, error);
      });
  });

  await Promise.all(promisses);
}

export async function notifySessionDelete(userId: string, app: string, verified: boolean | null): Promise<void> {
  const session = await getUserAppSession(userId, app, verified);
  if (session?.websocketEndpoint == null) {
    return;
  }
  try {
    await axios.post(session.websocketEndpoint, {
      type: 'session-deleted',
      data: {
        userId,
      },
    } as WebSocketEvent);
  } catch (error) {
    logWarning('Session delete notification failed', { area: 'websockets', tags: { event: 'session-deleted' } }, error);
  }
}

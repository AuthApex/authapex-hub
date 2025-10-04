import 'server-only';
import { User, WebSocketEvent } from '@authapex/core';
import { getAuthorizedApps, getUserAppSessions } from '@/lib/server/mongodb';
import axios from 'axios';

export async function notifyUserUpdate(user: User): Promise<void> {
  const authorizedApps = await getAuthorizedApps();
  const userAppSessions = await getUserAppSessions(user.userId);

  const promisses = userAppSessions.map((session) => {
    const authorizedApp = authorizedApps.find((app) => app.name === session.app && app.websocketEndpoint != null);
    if (authorizedApp == null) {
      return;
    }
    return axios
      .post(authorizedApp.websocketEndpoint!, {
        type: 'user-update',
        data: {
          userId: user.userId,
        },
      } as WebSocketEvent)
      .catch(console.error);
  });

  await Promise.all(promisses);
}

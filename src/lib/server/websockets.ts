import 'server-only';
import { User, WebSocketEvent } from '@authapex/core';
import { getAuthorizedApps } from '@/lib/server/mongodb';
import axios from 'axios';

export async function notifyUserUpdate(user: User): Promise<void> {
  const authorizedApps = await getAuthorizedApps();

  const promisses = authorizedApps.map(async (app) => {
    if (app.websocketEndpoint == null) {
      return;
    }
    await axios
      .post(app.websocketEndpoint, {
        type: 'user-update',
        data: {
          userId: user.userId,
        },
      } as WebSocketEvent)
      .catch();
  });

  await Promise.all(promisses);
}

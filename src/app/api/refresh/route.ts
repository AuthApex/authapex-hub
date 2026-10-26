import { getAuth } from '@/lib/actions/auth';
import { addWeeks, isAfter } from 'date-fns';
import { insertSession, invalidateSession } from '@/lib/server/mongodb';
import { createSession, deleteSession } from '@/lib/server/session';
import { apiError, handleRouteError, jsonNoStore } from '@/lib/server/api';

export async function GET() {
  try {
    const auth = await getAuth();
    if (auth.isAuth && isAfter(addWeeks(new Date(), 1), auth.expiresAt)) {
      const invalidateResult = await invalidateSession({ sessionId: auth.sessionId });
      if (!invalidateResult.success) {
        return apiError('Internal Server Error', 500);
      }
      await deleteSession();

      const session = await createSession();
      const insertResult = await insertSession({
        sessionId: session.sessionId,
        userId: auth.user.userId,
        expiresAt: session.expiresAt,
      });

      if (!insertResult.success) {
        await deleteSession();
        return apiError('Internal Server Error', 500);
      }

      return jsonNoStore({
        refreshed: true,
      });
    }
    return jsonNoStore({
      refreshed: false,
    });
  } catch (error) {
    return handleRouteError(error, '/api/refresh');
  }
}

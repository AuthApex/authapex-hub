import { NextResponse } from 'next/server';
import { getAuth } from '@/lib/actions/auth';
import { addWeeks, isAfter } from 'date-fns';
import { getSessionAuthTime, insertSession, invalidateSession } from '@/lib/server/mongodb';
import { createSession, deleteSession } from '@/lib/server/session';

export async function GET() {
  const auth = await getAuth();
  if (auth.isAuth && isAfter(addWeeks(new Date(), 1), auth.expiresAt)) {
    try {
      // Sessions without authTime were created before it was stored; the new session starts without one as well,
      // which makes the OIDC authorize endpoint ask for a fresh sign in.
      const authTime = await getSessionAuthTime(auth.sessionId);
      const invalidateResult = await invalidateSession({ sessionId: auth.sessionId });
      if (!invalidateResult.success) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }
      await deleteSession();

      const session = await createSession();
      const insertResult = await insertSession({
        sessionId: session.sessionId,
        userId: auth.user.userId,
        expiresAt: session.expiresAt,
        authTime,
      });

      if (!insertResult.success) {
        await deleteSession();
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }

      return NextResponse.json({
        refreshed: true,
      });
    } catch (e) {
      console.error(e);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
  return NextResponse.json({
    refreshed: false,
  });
}

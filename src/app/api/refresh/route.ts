import { NextResponse } from 'next/server';
import { getAuth } from '@/lib/actions/auth';
import { addWeeks, isAfter } from 'date-fns';
import { insertSession, invalidateSession } from '@/lib/server/mongodb';
import { createSession, deleteSession } from '@/lib/server/session';

export async function GET() {
  const auth = await getAuth();
  if (auth.isAuth && isAfter(addWeeks(new Date(), 1), auth.expiresAt)) {
    try {
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
        app: 'authapex-hub',
      });

      if (!insertResult.success) {
        await deleteSession();
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
      }

      return NextResponse.json({
        refreshed: true,
      });
    } catch {
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
  return NextResponse.json({
    refreshed: false,
  });
}

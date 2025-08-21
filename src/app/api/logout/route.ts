import { NextRequest, NextResponse } from 'next/server';
import { getUserBySession, invalidateSession } from '@/lib/server/mongodb';
import { SessionPayload } from '@/lib/server/session';
import { UserRequest } from '@/app/api/user/route';
import { decrypt } from '@/lib/server/encryption';

export async function POST(request: NextRequest) {
  const payload: UserRequest = await request.json();
  if (typeof payload.session != 'string' || typeof payload.app != 'string') {
    return NextResponse.json({ error: 'Missing auth token or app' }, { status: 400 });
  }

  const session = await decrypt<SessionPayload>(payload.session);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getUserBySession(session.sessionId, payload.app);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await invalidateSession({ sessionId: session.sessionId });
}

import { NextRequest, NextResponse } from 'next/server';
import { getUserIdByAuthCode, insertSession, removeAuthCode } from '@/lib/server/mongodb';
import { generateSession } from '@/lib/server/session';

interface TokenRequest {
  authCode?: string;
  app?: string;
}

export async function POST(request: NextRequest) {
  const payload: TokenRequest = await request.json();
  if (typeof payload.authCode != 'string' || typeof payload.app != 'string') {
    return NextResponse.json({ error: 'Missing auth code or app' }, { status: 400 });
  }

  const userId = await getUserIdByAuthCode(payload.authCode);
  if (userId == null) {
    return NextResponse.json({ error: 'Auth code not valid' }, { status: 401 });
  }
  await removeAuthCode(payload.authCode);

  const { sessionId, expiresAt, session } = await generateSession();

  const inserted = await insertSession({
    sessionId: sessionId,
    userId: userId,
    expiresAt: expiresAt,
    app: payload.app,
  });

  if (!inserted) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  return NextResponse.json({
    session: session,
    expiresAt: expiresAt.toISOString(),
  });
}

import { NextResponse } from 'next/server';
import { getOidcJwks } from '@/lib/server/oidc/keys';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    return NextResponse.json(await getOidcJwks(), {
      headers: { 'Cache-Control': 'public, max-age=600' },
    });
  } catch {
    return NextResponse.json(
      { error: 'server_error', error_description: 'No signing key is configured.' },
      { status: 500 }
    );
  }
}

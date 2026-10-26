import { NextResponse } from 'next/server';
import { getOidcJwks } from '@/lib/server/oidc/keys';
import { logError } from '@/lib/server/logger';

export async function GET() {
  try {
    return NextResponse.json(await getOidcJwks(), {
      headers: { 'Cache-Control': 'public, max-age=600' },
    });
  } catch (error) {
    logError(error, 'OIDC JWKS could not be created', { area: 'oidc-jwks' });
    return NextResponse.json(
      { error: 'server_error', error_description: 'No signing key is configured.' },
      { status: 500 }
    );
  }
}

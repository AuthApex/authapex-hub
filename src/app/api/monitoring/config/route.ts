import { NextResponse } from 'next/server';
import { getMonitoringConfig } from '@/lib/monitoring/config';
import { NO_STORE_HEADERS } from '@/lib/server/api';

export const dynamic = 'force-dynamic';

/**
 * Public, minimal monitoring configuration for the browser SDK.
 *
 * A Sentry/GlitchTip DSN is designed to be public, so this endpoint intentionally requires no authentication. Every
 * page (including statically rendered ones) reads the runtime configuration from here.
 */
export function GET() {
  const config = getMonitoringConfig();
  if (config == null) {
    return new NextResponse(null, { status: 204, headers: NO_STORE_HEADERS });
  }
  return NextResponse.json(config, { headers: NO_STORE_HEADERS });
}

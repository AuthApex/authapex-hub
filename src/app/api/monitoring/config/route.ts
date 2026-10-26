import { NextResponse } from 'next/server';
import { getMonitoringConfig } from '@/lib/monitoring/config';
import { NO_STORE_HEADERS } from '@/lib/server/api';

export function GET() {
  const config = getMonitoringConfig();
  if (config == null) {
    return new NextResponse(null, { status: 204, headers: NO_STORE_HEADERS });
  }
  return NextResponse.json(config, { headers: NO_STORE_HEADERS });
}

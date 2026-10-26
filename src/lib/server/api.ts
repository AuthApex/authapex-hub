import 'server-only';
import { NextResponse } from 'next/server';
import { logError } from '@/lib/server/logger';

/** Responses containing session, token or user data must never be cached by a browser or proxy. */
export const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
  Pragma: 'no-cache',
} as const;

type ExtraHeaders = Record<string, string>;

export function jsonNoStore<T>(body: T, status = 200, headers: ExtraHeaders = {}): NextResponse<T> {
  return NextResponse.json(body, { status, headers: { ...NO_STORE_HEADERS, ...headers } });
}

export function apiError(message: string, status = 500, headers: ExtraHeaders = {}): NextResponse<{ error: string }> {
  return jsonNoStore({ error: message }, status, headers);
}

/**
 * Turns an unexpected route handler failure into a logged, non-cacheable 500 response.
 *
 * The thrown error is never echoed to the caller, only a stable error message, so internal details cannot leak.
 */
export function handleRouteError(error: unknown, route: string, message = 'Internal Server Error') {
  logError(error, `Unhandled error in ${route}`, { area: 'api-route', tags: { route } });
  return apiError(message, 500);
}

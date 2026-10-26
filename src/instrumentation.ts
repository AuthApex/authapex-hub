import type { Instrumentation } from 'next';

/**
 * Next.js instrumentation hook.
 *
 * Runs once when a new server process starts. Monitoring is initialized here so that errors are reported even when
 * they happen before the first request (for example while loading the OIDC signing key).
 */
export async function register() {
  // Node.js is the runtime used by every route handler, server action and server component in this app. Middleware
  // runs on the edge runtime; its errors are still reported through `onRequestError`, which initializes the SDK
  // lazily only when such an error occurs.
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initMonitoring } = await import('@/lib/server/monitoring');
    initMonitoring();
  }
}

/**
 * Called by Next.js for every error that escapes a route handler, server action, middleware or server component
 * render. Without this hook these errors only end up in the container log.
 */
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const { logRequestError } = await import('@/lib/server/monitoring');
  logRequestError(error, request, context);
};

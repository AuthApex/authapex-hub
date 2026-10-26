import type { Instrumentation } from 'next';

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { initMonitoring } = await import('@/lib/server/monitoring');
    initMonitoring();
  }
}

export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  const { logRequestError } = await import('@/lib/server/monitoring');
  logRequestError(error, request, context);
};

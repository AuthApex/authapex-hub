import 'server-only';
import {
  captureException,
  captureMessage,
  type MonitoringContext,
  type MonitoringLevel,
} from '@/lib/server/monitoring';

export interface LogContext extends MonitoringContext {
  /** Short machine readable area, e.g. `mongodb`, `oidc`, `api-route`. Stored as a tag. */
  area?: string;
}

function withArea(context: LogContext): MonitoringContext {
  const { area, ...rest } = context;
  const tags = { ...rest.tags };
  if (area != null) {
    tags.area = area;
  }
  return { ...rest, tags };
}

/**
 * Logs an error locally and forwards it to GlitchTip when monitoring is configured.
 *
 * Use this instead of a bare `console.error` so every unexpected failure is visible in the container log and in the
 * error tracker. Expected failures (invalid credentials, expired tokens, malformed cookies, ...) must not be reported.
 */
export function logError(error: unknown, message: string, context: LogContext = {}): void {
  console.error(`[authapex-hub] ${message}`, error);
  captureException(error, {
    ...withArea(context),
    extra: { ...context.extra, message },
  });
}

/**
 * Logs a non-fatal failure. When an error is passed its stack trace is reported as well, tagged as a warning so it is
 * easier to filter from real failures.
 */
export function logWarning(message: string, context: LogContext = {}, error?: unknown): void {
  if (error === undefined) {
    console.warn(`[authapex-hub] ${message}`);
    captureMessage(message, 'warning', withArea(context));
    return;
  }

  console.warn(`[authapex-hub] ${message}`, error);
  const base = withArea(context);
  captureException(error, {
    ...base,
    tags: { ...base.tags, severity: 'warning' },
    extra: { ...context.extra, message },
  });
}

export function logInfo(message: string, level: MonitoringLevel = 'info', context: LogContext = {}): void {
  console.info(`[authapex-hub] ${message}`);
  captureMessage(message, level, withArea(context));
}

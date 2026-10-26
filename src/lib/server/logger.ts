import 'server-only';
import {
  captureException,
  captureMessage,
  type MonitoringContext,
  type MonitoringLevel,
} from '@/lib/server/monitoring';

export interface LogContext extends MonitoringContext {
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

export function logError(error: unknown, message: string, context: LogContext = {}): void {
  console.error(`[authapex-hub] ${message}`, error);
  captureException(error, {
    ...withArea(context),
    extra: { ...context.extra, message },
  });
}

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

import 'server-only';
import * as Sentry from '@sentry/nextjs';
import { resolveMonitoringConfig, type MonitoringRuntimeConfig } from '@/lib/monitoring/config';
import { sanitizeMonitoringEvent } from '@/lib/monitoring/sanitize';

export type MonitoringLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

export interface MonitoringContext {
  tags?: Record<string, string | number | boolean | undefined>;
  extra?: Record<string, unknown>;
  user?: { id?: string };
  fingerprint?: string[];
}

export interface RequestErrorContext {
  routerKind: string;
  routePath: string;
  routeType: string;
}

export interface RequestErrorRequest {
  path: string;
  method: string;
  headers: Record<string, string | string[] | undefined>;
}

declare global {
  // The instrumentation hook and the application code are bundled separately, so keep the state on globalThis to
  // avoid initializing the SDK twice.
  var __AUTHAPEX_MONITORING_INITIALIZED__: boolean | undefined;
  var __AUTHAPEX_MONITORING_INIT_FAILED__: boolean | undefined;
}

function isInitialized(): boolean {
  return globalThis.__AUTHAPEX_MONITORING_INITIALIZED__ === true;
}

function hasInitializationFailed(): boolean {
  return globalThis.__AUTHAPEX_MONITORING_INIT_FAILED__ === true;
}

function toError(error: unknown): Error {
  if (error instanceof Error) {
    return error;
  }
  if (typeof error === 'string') {
    return new Error(error);
  }
  try {
    return new Error(`Non-error value thrown: ${JSON.stringify(error)}`);
  } catch {
    return new Error('Non-error value thrown');
  }
}

function createSentryOptions(config: MonitoringRuntimeConfig): Sentry.NodeOptions {
  return {
    dsn: config.dsn,
    environment: config.environment,
    release: config.release,
    tracesSampleRate: config.tracesSampleRate,
    // The hub handles credentials, so keep request bodies, cookies, headers, query parameters and user details out of
    // every report. `sanitizeMonitoringEvent` is an additional safety net for data attached by integrations.
    dataCollection: {
      userInfo: false,
      cookies: false,
      httpHeaders: false,
      httpBodies: [],
      urlQueryParams: false,
      databaseQueryData: false,
      stackFrameVariables: false,
      genAI: { inputs: false, outputs: false },
      mcp: { inputs: false, outputs: false },
    },
    beforeSend: (event) => sanitizeMonitoringEvent(event),
  };
}

export function initMonitoring(): boolean {
  if (isInitialized()) {
    return true;
  }
  if (hasInitializationFailed()) {
    return false;
  }

  const { config, error } = resolveMonitoringConfig();
  if (error != null) {
    globalThis.__AUTHAPEX_MONITORING_INIT_FAILED__ = true;
    console.error(`[monitoring] ${error}`);
    return false;
  }
  if (config == null) {
    return false;
  }

  try {
    Sentry.init(createSentryOptions(config));
    globalThis.__AUTHAPEX_MONITORING_INITIALIZED__ = true;
    console.info(`[monitoring] GlitchTip error reporting is enabled (environment: ${config.environment}).`);
    return true;
  } catch (initError) {
    globalThis.__AUTHAPEX_MONITORING_INIT_FAILED__ = true;
    console.error('[monitoring] GlitchTip error reporting could not be initialized.', initError);
    return false;
  }
}

function applyContext(scope: Sentry.Scope, context: MonitoringContext): void {
  scope.setTag('service', 'authapex-hub');
  for (const [key, value] of Object.entries(context.tags ?? {})) {
    if (value !== undefined) {
      scope.setTag(key, value);
    }
  }
  if (context.extra != null) {
    scope.setExtras(context.extra);
  }
  if (context.user?.id != null) {
    scope.setUser({ id: context.user.id });
  }
  if (context.fingerprint != null) {
    scope.setFingerprint(context.fingerprint);
  }
}

export function captureException(error: unknown, context: MonitoringContext = {}): void {
  if (!initMonitoring()) {
    return;
  }

  Sentry.withScope((scope) => {
    applyContext(scope, context);
    Sentry.captureException(toError(error));
  });
}

export function captureMessage(
  message: string,
  level: MonitoringLevel = 'info',
  context: MonitoringContext = {}
): void {
  if (!initMonitoring()) {
    return;
  }

  Sentry.withScope((scope) => {
    applyContext(scope, context);
    Sentry.captureMessage(message, level);
  });
}

export function logRequestError(error: unknown, request: RequestErrorRequest, context: RequestErrorContext): void {
  const route = context.routePath || request.path;
  console.error(`[request-error] ${request.method} ${request.path} (${context.routeType} ${route})`, error);

  captureException(error, {
    tags: {
      area: 'next-request',
      router_kind: context.routerKind,
      route_type: context.routeType,
      route_path: route,
    },
    extra: { path: request.path, method: request.method },
  });
}

import * as Sentry from '@sentry/nextjs';
import { MONITORING_GLOBAL_KEY, type MonitoringRuntimeConfig } from '@/lib/monitoring/config';
import { sanitizeMonitoringEvent } from '@/lib/monitoring/sanitize';

export interface ClientMonitoringContext {
  tags?: Record<string, string | number | boolean | undefined>;
  extra?: Record<string, unknown>;
  user?: { id?: string };
  fingerprint?: string[];
}

interface PendingError {
  error: unknown;
  context: ClientMonitoringContext;
}

// The browser may report errors before the runtime configuration has been fetched, so a few are queued.
const MAX_PENDING_ERRORS = 20;

let configRequest: Promise<boolean> | null = null;

declare global {
  // Client chunks do not share module state, so the initialization guards live on `globalThis` as well.
  var __AUTHAPEX_CLIENT_MONITORING_INITIALIZED__: boolean | undefined;
  var __AUTHAPEX_CLIENT_MONITORING_INIT_FAILED__: boolean | undefined;
  var __AUTHAPEX_CLIENT_MONITORING_CONFIG_CHECKED__: boolean | undefined;
  var __AUTHAPEX_CLIENT_MONITORING_PENDING__: PendingError[] | undefined;
}

function isClientInitialized(): boolean {
  return globalThis.__AUTHAPEX_CLIENT_MONITORING_INITIALIZED__ === true;
}

function hasClientInitializationFailed(): boolean {
  return globalThis.__AUTHAPEX_CLIENT_MONITORING_INIT_FAILED__ === true;
}

function isConfigChecked(): boolean {
  return globalThis.__AUTHAPEX_CLIENT_MONITORING_CONFIG_CHECKED__ === true;
}

function getBrowserConfig(): MonitoringRuntimeConfig | null {
  return globalThis[MONITORING_GLOBAL_KEY] ?? null;
}

/**
 * Initializes the browser SDK when a GlitchTip DSN is available.
 *
 * Safe to call more than once: the first successful call wins and later calls are no-ops.
 */
export function initClientMonitoring(): boolean {
  if (isClientInitialized()) {
    return true;
  }
  if (hasClientInitializationFailed()) {
    return false;
  }

  const config = getBrowserConfig();
  if (config == null) {
    return false;
  }

  try {
    Sentry.init({
      dsn: config.dsn,
      environment: config.environment,
      release: config.release,
      tracesSampleRate: config.tracesSampleRate,
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
      beforeSend(event) {
        return sanitizeMonitoringEvent(event);
      },
    });
    globalThis.__AUTHAPEX_CLIENT_MONITORING_INITIALIZED__ = true;
    return true;
  } catch (error) {
    globalThis.__AUTHAPEX_CLIENT_MONITORING_INIT_FAILED__ = true;
    console.error('[monitoring] GlitchTip error reporting could not be initialized in the browser.', error);
    return false;
  }
}

function sendClientException(error: unknown, context: ClientMonitoringContext): void {
  Sentry.withScope((scope) => {
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
    Sentry.captureException(error instanceof Error ? error : new Error(String(error)));
  });
}

function getPendingErrors(): PendingError[] {
  if (globalThis.__AUTHAPEX_CLIENT_MONITORING_PENDING__ == null) {
    globalThis.__AUTHAPEX_CLIENT_MONITORING_PENDING__ = [];
  }
  return globalThis.__AUTHAPEX_CLIENT_MONITORING_PENDING__;
}

function flushPendingErrors(): void {
  for (const pending of getPendingErrors().splice(0)) {
    sendClientException(pending.error, pending.context);
  }
}

/**
 * Fetches the runtime monitoring configuration from the server.
 *
 * This lets static pages and deployments that only change the container environment report errors without rebuilding
 * the image. A Sentry/GlitchTip DSN is public by design, so the endpoint does not need authentication.
 */
export function loadClientMonitoringConfig(): Promise<boolean> {
  if (isClientInitialized()) {
    return Promise.resolve(true);
  }
  if (isConfigChecked()) {
    return Promise.resolve(false);
  }
  if (configRequest != null) {
    return configRequest;
  }

  configRequest = fetch('/api/monitoring/config', { cache: 'no-store', credentials: 'same-origin' })
    .then(async (response) => {
      if (response.status === 204 || !response.ok) {
        globalThis.__AUTHAPEX_CLIENT_MONITORING_CONFIG_CHECKED__ = true;
        return false;
      }
      const config = (await response.json()) as MonitoringRuntimeConfig;
      if (!config?.dsn) {
        globalThis.__AUTHAPEX_CLIENT_MONITORING_CONFIG_CHECKED__ = true;
        return false;
      }
      globalThis[MONITORING_GLOBAL_KEY] = config;
      const started = initClientMonitoring();
      globalThis.__AUTHAPEX_CLIENT_MONITORING_CONFIG_CHECKED__ = true;
      if (started) {
        flushPendingErrors();
      }
      return started;
    })
    .catch(() => false)
    .finally(() => {
      configRequest = null;
    });

  return configRequest;
}

/** Reports an unexpected browser side failure. Errors that happen before the config is loaded are queued. */
export function captureClientException(error: unknown, context: ClientMonitoringContext = {}): void {
  if (!initClientMonitoring()) {
    const pendingErrors = getPendingErrors();
    if (pendingErrors.length < MAX_PENDING_ERRORS) {
      pendingErrors.push({ error, context });
    }
    void loadClientMonitoringConfig();
    return;
  }

  sendClientException(error, context);
}

/**
 * Records an expected, user-driven outcome (for example a cancelled Google login) as a breadcrumb instead of an
 * error event. Breadcrumbs are attached to the next real error and never create an issue on their own.
 */
export function logClientInfo(message: string, context: ClientMonitoringContext = {}): void {
  console.info(`[authapex-hub] ${message}`);
  if (!isClientInitialized()) {
    return;
  }
  Sentry.addBreadcrumb({
    category: 'authapex-hub',
    message,
    level: 'info',
    data: { ...context.tags, ...context.extra },
  });
}

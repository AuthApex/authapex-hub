export interface MonitoringRuntimeConfig {
  dsn: string;
  environment: string;
  release?: string;
  tracesSampleRate: number;
}

export interface MonitoringResolution {
  config: MonitoringRuntimeConfig | null;
  disabled: boolean;
  error: string | null;
}

type MonitoringEnv = Record<string, string | undefined>;

export const MONITORING_GLOBAL_KEY = '__AUTHAPEX_MONITORING__';

declare global {
  var __AUTHAPEX_MONITORING__: MonitoringRuntimeConfig | undefined;
}

function firstDefined(env: MonitoringEnv, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = env[key]?.trim();
    if (value) {
      return value;
    }
  }
  return undefined;
}

function parseSampleRate(value: string | undefined): number {
  if (!value) {
    return 0;
  }
  const rate = Number(value);
  if (!Number.isFinite(rate)) {
    return 0;
  }
  return Math.min(Math.max(rate, 0), 1);
}

function isHttpDsn(dsn: string): boolean {
  try {
    const url = new URL(dsn);
    // A Sentry DSN is https://<public key>@<host>/<project id>. The key and the project id are validated here so an
    // unusable DSN is reported by this module instead of producing a cryptic SDK warning later.
    const projectId = url.pathname.split('/').filter(Boolean).pop();
    return (
      (url.protocol === 'https:' || url.protocol === 'http:') &&
      /^\w+$/.test(url.username) &&
      (url.password === '' || /^\w+$/.test(url.password)) &&
      url.hostname.length > 0 &&
      /^\d+$/.test(projectId ?? '')
    );
  } catch {
    return false;
  }
}

export function resolveMonitoringConfig(env: MonitoringEnv = process.env): MonitoringResolution {
  if (['0', 'false', 'off', 'no'].includes((env.GLITCHTIP_ENABLED ?? '').trim().toLowerCase())) {
    return { config: null, disabled: true, error: null };
  }

  const dsn = firstDefined(env, ['GLITCHTIP_DSN', 'SENTRY_DSN']);
  if (!dsn) {
    return { config: null, disabled: true, error: null };
  }

  if (!isHttpDsn(dsn)) {
    return {
      config: null,
      disabled: false,
      error: 'The configured GlitchTip DSN is not a valid http(s) DSN, error reporting is disabled.',
    };
  }

  const environment = firstDefined(env, ['GLITCHTIP_ENVIRONMENT', 'SENTRY_ENVIRONMENT', 'NODE_ENV']) ?? 'production';
  const release = firstDefined(env, ['GLITCHTIP_RELEASE', 'SENTRY_RELEASE']);
  const tracesSampleRate = parseSampleRate(
    firstDefined(env, ['GLITCHTIP_TRACES_SAMPLE_RATE', 'SENTRY_TRACES_SAMPLE_RATE'])
  );

  return {
    config: { dsn, environment, release, tracesSampleRate },
    disabled: false,
    error: null,
  };
}

export function getMonitoringConfig(env: MonitoringEnv = process.env): MonitoringRuntimeConfig | null {
  return resolveMonitoringConfig(env).config;
}

import { describe, expect, it } from 'vitest';
import { getMonitoringConfig, resolveMonitoringConfig } from './config';

const dsn = 'https://abc123@glitchtip.example.com/42';

describe('resolveMonitoringConfig', () => {
  it('disables monitoring when no DSN is configured', () => {
    expect(resolveMonitoringConfig({})).toEqual({ config: null, disabled: true, error: null });
  });

  it('disables monitoring when GLITCHTIP_ENABLED is false', () => {
    for (const value of ['0', 'false', 'off', 'no', ' FALSE ']) {
      expect(resolveMonitoringConfig({ GLITCHTIP_DSN: dsn, GLITCHTIP_ENABLED: value })).toEqual({
        config: null,
        disabled: true,
        error: null,
      });
    }
  });

  it('uses the GLITCHTIP_* variables', () => {
    expect(
      resolveMonitoringConfig({
        GLITCHTIP_DSN: `  ${dsn}  `,
        GLITCHTIP_ENVIRONMENT: 'staging',
        GLITCHTIP_RELEASE: '1.2.3',
        GLITCHTIP_TRACES_SAMPLE_RATE: '0.25',
        NODE_ENV: 'production',
      })
    ).toEqual({
      config: { dsn, environment: 'staging', release: '1.2.3', tracesSampleRate: 0.25 },
      disabled: false,
      error: null,
    });
  });

  it('falls back to the SENTRY_* aliases', () => {
    expect(
      resolveMonitoringConfig({
        SENTRY_DSN: dsn,
        SENTRY_ENVIRONMENT: 'production',
        SENTRY_RELEASE: '9.9.9',
        SENTRY_TRACES_SAMPLE_RATE: '1',
      }).config
    ).toEqual({ dsn, environment: 'production', release: '9.9.9', tracesSampleRate: 1 });
  });

  it('prefers GLITCHTIP_* over SENTRY_* values', () => {
    expect(
      resolveMonitoringConfig({
        GLITCHTIP_DSN: dsn,
        SENTRY_DSN: 'https://other@example.com/1',
        GLITCHTIP_ENVIRONMENT: 'glitchtip',
        SENTRY_ENVIRONMENT: 'sentry',
      }).config
    ).toMatchObject({ dsn, environment: 'glitchtip' });
  });

  it('falls back to the build time NEXT_PUBLIC_* variables', () => {
    expect(resolveMonitoringConfig({ NEXT_PUBLIC_GLITCHTIP_DSN: dsn }).config).toMatchObject({ dsn });
  });

  it('defaults the environment to NODE_ENV or production', () => {
    expect(resolveMonitoringConfig({ GLITCHTIP_DSN: dsn, NODE_ENV: 'staging' }).config?.environment).toBe('staging');
    expect(resolveMonitoringConfig({ GLITCHTIP_DSN: dsn }).config?.environment).toBe('production');
  });

  it('reports an invalid DSN instead of silently disabling reports', () => {
    expect(resolveMonitoringConfig({ GLITCHTIP_DSN: 'not a dsn' })).toEqual({
      config: null,
      disabled: false,
      error: 'The configured GlitchTip DSN is not a valid http(s) DSN, error reporting is disabled.',
    });
  });

  it('rejects a DSN without a public key', () => {
    expect(resolveMonitoringConfig({ GLITCHTIP_DSN: 'https://glitchtip.example.com/42' }).config).toBeNull();
  });

  it('rejects a DSN with an invalid public key or project id', () => {
    expect(resolveMonitoringConfig({ GLITCHTIP_DSN: 'https://public-key@glitchtip.example.com/42' }).config).toBeNull();
    expect(
      resolveMonitoringConfig({ GLITCHTIP_DSN: 'https://abc123@glitchtip.example.com/project' }).config
    ).toBeNull();
  });

  it('clamps the sample rate and ignores invalid values', () => {
    expect(resolveMonitoringConfig({ GLITCHTIP_DSN: dsn, GLITCHTIP_TRACES_SAMPLE_RATE: '-1' }).config).toMatchObject({
      tracesSampleRate: 0,
    });
    expect(resolveMonitoringConfig({ GLITCHTIP_DSN: dsn, GLITCHTIP_TRACES_SAMPLE_RATE: '2' }).config).toMatchObject({
      tracesSampleRate: 1,
    });
    expect(resolveMonitoringConfig({ GLITCHTIP_DSN: dsn, GLITCHTIP_TRACES_SAMPLE_RATE: 'abc' }).config).toMatchObject({
      tracesSampleRate: 0,
    });
    expect(resolveMonitoringConfig({ GLITCHTIP_DSN: dsn }).config).toMatchObject({ tracesSampleRate: 0 });
  });
});

describe('getMonitoringConfig', () => {
  it('returns only the runtime config', () => {
    expect(getMonitoringConfig({ GLITCHTIP_DSN: dsn })).toMatchObject({ dsn });
    expect(getMonitoringConfig({})).toBeNull();
  });
});

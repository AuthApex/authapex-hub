const SENSITIVE_HEADERS = new Set(['authorization', 'cookie', 'set-cookie', 'x-api-key', 'proxy-authorization']);

export interface SanitizableRequest {
  headers?: Record<string, string>;
  cookies?: unknown;
  data?: unknown;
  query_string?: unknown;
}

export interface SanitizableUser {
  id?: string | number;
  [key: string]: unknown;
}

export interface SanitizableEvent {
  request?: SanitizableRequest;
  user?: SanitizableUser;
}

/**
 * Removes credentials and personal data before an event is sent to GlitchTip.
 *
 * The hub handles OAuth codes, refresh tokens, API keys and session cookies, so request headers, bodies and query
 * strings must never leave the server in an error report. Only the opaque user id is kept, which is enough to
 * correlate reports without sending an email address or IP address.
 */
export function sanitizeMonitoringEvent<T extends object>(event: T): T {
  const sanitizable = event as SanitizableEvent;
  if (sanitizable.request != null) {
    if (sanitizable.request.headers != null) {
      for (const key of Object.keys(sanitizable.request.headers)) {
        if (SENSITIVE_HEADERS.has(key.toLowerCase())) {
          sanitizable.request.headers[key] = '[Filtered]';
        }
      }
    }
    delete sanitizable.request.cookies;
    delete sanitizable.request.data;
    delete sanitizable.request.query_string;
  }

  if (sanitizable.user != null) {
    sanitizable.user = sanitizable.user.id == null ? {} : { id: sanitizable.user.id };
  }

  return event;
}

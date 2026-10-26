import { describe, expect, it } from 'vitest';
import { sanitizeMonitoringEvent } from './sanitize';

describe('sanitizeMonitoringEvent', () => {
  it('filters sensitive headers case-insensitively', () => {
    const event = {
      request: {
        headers: {
          Authorization: 'Bearer secret',
          cookie: 'session=secret',
          'Set-Cookie': 'a=b',
          'X-Api-Key': 'key',
          'Proxy-Authorization': 'Basic abc',
          'User-Agent': 'vitest',
        },
      },
    };

    expect(sanitizeMonitoringEvent(event).request?.headers).toEqual({
      Authorization: '[Filtered]',
      cookie: '[Filtered]',
      'Set-Cookie': '[Filtered]',
      'X-Api-Key': '[Filtered]',
      'Proxy-Authorization': '[Filtered]',
      'User-Agent': 'vitest',
    });
  });

  it('removes cookies, bodies and query strings', () => {
    const event = {
      request: {
        cookies: { session: 'secret' },
        data: { password: 'secret' },
        query_string: 'code=secret',
      },
    };

    expect(sanitizeMonitoringEvent(event).request).toEqual({});
  });

  it('keeps only the opaque user id', () => {
    const event = { user: { id: 'user-1', email: 'john@example.com', ip_address: '127.0.0.1' } };

    expect(sanitizeMonitoringEvent(event).user).toEqual({ id: 'user-1' });
  });

  it('removes the user entirely when it has no id', () => {
    expect(sanitizeMonitoringEvent({ user: { email: 'john@example.com' } }).user).toEqual({});
  });

  it('leaves events without request or user data untouched', () => {
    const event = { message: 'Something failed' };

    expect(sanitizeMonitoringEvent(event)).toEqual({ message: 'Something failed' });
  });
});

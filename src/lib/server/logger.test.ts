import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { captureException, captureMessage } = vi.hoisted(() => ({
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

vi.mock('@/lib/server/monitoring', () => ({ captureException, captureMessage }));

import { logError, logInfo, logWarning } from './logger';

beforeEach(() => {
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('logError', () => {
  it('writes to the console and forwards the error with its area', () => {
    const error = new Error('boom');

    logError(error, 'Database failed', { area: 'mongodb', tags: { operation: 'findUsers' } });

    expect(console.error).toHaveBeenCalledWith('[authapex-hub] Database failed', error);
    expect(captureException).toHaveBeenCalledWith(error, {
      tags: { operation: 'findUsers', area: 'mongodb' },
      extra: { message: 'Database failed' },
    });
  });
});

describe('logWarning', () => {
  it('reports a message when no error is attached', () => {
    logWarning('Slow response', { area: 'websockets' });

    expect(console.warn).toHaveBeenCalledWith('[authapex-hub] Slow response');
    expect(captureMessage).toHaveBeenCalledWith('Slow response', 'warning', { tags: { area: 'websockets' } });
  });

  it('reports the attached error as a warning', () => {
    const error = new Error('socket closed');

    logWarning('Notification failed', { area: 'websockets' }, error);

    expect(console.warn).toHaveBeenCalledWith('[authapex-hub] Notification failed', error);
    expect(captureException).toHaveBeenCalledWith(error, {
      tags: { area: 'websockets', severity: 'warning' },
      extra: { message: 'Notification failed' },
    });
  });
});

describe('logInfo', () => {
  it('forwards informational messages', () => {
    logInfo('Server started', 'info', { area: 'startup' });

    expect(console.info).toHaveBeenCalledWith('[authapex-hub] Server started');
    expect(captureMessage).toHaveBeenCalledWith('Server started', 'info', { tags: { area: 'startup' } });
  });
});

import type { ReadonlyURLSearchParams } from 'next/navigation';
import { describe, expect, it } from 'vitest';
import { createQueryString } from './createQueryString';

function searchParams(value = ''): ReadonlyURLSearchParams {
  return new URLSearchParams(value) as unknown as ReadonlyURLSearchParams;
}

describe('createQueryString', () => {
  it('sets a new parameter while keeping existing ones', () => {
    const result = createQueryString(searchParams('q=test&page=2'), 'size', 10);

    expect(Object.fromEntries(new URLSearchParams(result))).toEqual({ q: 'test', page: '2', size: '10' });
  });

  it('overwrites an existing parameter', () => {
    const result = createQueryString(searchParams('page=1'), 'page', 3);

    expect(new URLSearchParams(result).get('page')).toBe('3');
  });

  it('accepts numeric values', () => {
    const result = createQueryString(searchParams(), 'size', 25);

    expect(new URLSearchParams(result).get('size')).toBe('25');
  });

  it('removes the parameter when the value is an empty string', () => {
    const result = createQueryString(searchParams('q=test&email=a%40b.cz'), 'q', '');

    expect(Object.fromEntries(new URLSearchParams(result))).toEqual({ email: 'a@b.cz' });
  });

  it('removes the parameter for the value 0 (current falsy-value behaviour)', () => {
    const result = createQueryString(searchParams('page=5&sortBy=_id'), 'page', 0);

    expect(Object.fromEntries(new URLSearchParams(result))).toEqual({ sortBy: '_id' });
  });

  it('encodes parameter values', () => {
    const result = createQueryString(searchParams(), 'q', 'hello world & more');

    expect(new URLSearchParams(result).get('q')).toBe('hello world & more');
  });

  it('returns an empty string when there are no parameters', () => {
    expect(createQueryString(searchParams(), 'q', '')).toBe('');
  });
});

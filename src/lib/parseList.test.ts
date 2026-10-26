import { describe, expect, it } from 'vitest';
import { parseWhitespaceList } from './parseList';

describe('parseWhitespaceList', () => {
  it('splits values separated by spaces, tabs and newlines', () => {
    expect(parseWhitespaceList(' one\ttwo\nthree  four ')).toEqual(['one', 'two', 'three', 'four']);
  });

  it('returns an empty list for empty input', () => {
    expect(parseWhitespaceList('')).toEqual([]);
    expect(parseWhitespaceList('   \t\n ')).toEqual([]);
    expect(parseWhitespaceList(null)).toEqual([]);
    expect(parseWhitespaceList(undefined)).toEqual([]);
  });

  it('does not deduplicate values', () => {
    expect(parseWhitespaceList('openid openid profile')).toEqual(['openid', 'openid', 'profile']);
  });
});

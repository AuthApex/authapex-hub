import { describe, expect, it } from 'vitest';
import { normalizeEmail, normalizeUsername } from './normalize';

describe('normalizeUsername', () => {
  it('trims, lowercases and replaces whitespace with underscores', () => {
    expect(normalizeUsername('  John Doe  ')).toBe('john_doe');
  });

  it('strips diacritics', () => {
    expect(normalizeUsername('Žluťoučký Kůň')).toBe('zlutoucky_kun');
  });

  it('handles whitespace other than spaces', () => {
    expect(normalizeUsername('John\tDoe\nSmith')).toBe('john_doe_smith');
  });

  it('keeps already normalized usernames unchanged', () => {
    expect(normalizeUsername('john_doe')).toBe('john_doe');
  });
});

describe('normalizeEmail', () => {
  it('trims and lowercases the email', () => {
    expect(normalizeEmail('  User@Example.COM ')).toBe('user@example.com');
  });

  it('keeps the local part unchanged apart from casing', () => {
    expect(normalizeEmail('First.Last+tag@Example.com')).toBe('first.last+tag@example.com');
  });
});

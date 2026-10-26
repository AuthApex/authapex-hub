/** Normalizes a username: trims it, replaces whitespace with underscores, strips diacritics and lowercases it. */
export function normalizeUsername(username: string): string {
  return username
    .trim()
    .replace(/\s/g, '_')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

/** Normalizes an email address by trimming it and lowercasing it. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

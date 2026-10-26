/** Splits a whitespace separated string into trimmed, non-empty values. */
export function parseWhitespaceList(value: string | null | undefined): string[] {
  return (value ?? '')
    .split(/\s+/)
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

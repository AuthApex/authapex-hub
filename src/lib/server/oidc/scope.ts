import 'server-only';
import { parseWhitespaceList } from '@/lib/parseList';

/** Splits a whitespace separated OAuth scope string into unique, non-empty scopes, preserving order. */
export function parseOidcScopes(value: string | null | undefined): string[] {
  return mergeOidcScopes(parseWhitespaceList(value));
}

/** Merges scope lists into one unique list, preserving the order of their first occurrence. */
export function mergeOidcScopes(...scopeLists: string[][]): string[] {
  return [...new Set(scopeLists.flat().filter((scope) => scope.length > 0))];
}

/** Ensures the given scope list contains the required openid scope, listed first. */
export function ensureOpenIdScope(scopes: string[]): string[] {
  return ['openid', ...scopes.filter((scope) => scope !== 'openid')];
}

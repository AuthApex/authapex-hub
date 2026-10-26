import 'server-only';
import { parseWhitespaceList } from '@/lib/parseList';

export function parseOidcScopes(value: string | null | undefined): string[] {
  return mergeOidcScopes(parseWhitespaceList(value));
}

export function mergeOidcScopes(...scopeLists: string[][]): string[] {
  return [...new Set(scopeLists.flat().filter((scope) => scope.length > 0))];
}

export function ensureOpenIdScope(scopes: string[]): string[] {
  return ['openid', ...scopes.filter((scope) => scope !== 'openid')];
}

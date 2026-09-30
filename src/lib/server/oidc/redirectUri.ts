import 'server-only';

const LOOPBACK_HOSTS = ['localhost', '127.0.0.1', '[::1]'];

// Private-use schemes for native apps have to contain a dot (reverse domain name, RFC 8252 section 7.1). This also
// rules out schemes like javascript:, data:, file: or blob:.
const PRIVATE_USE_SCHEME_PATTERN = /^[a-z][a-z0-9+-]*(\.[a-z0-9+-]+)+:$/;

export function isAllowedOidcRedirectUri(redirectUri: string): boolean {
  if (redirectUri.includes('#')) {
    return false;
  }

  let url: URL;
  try {
    url = new URL(redirectUri);
  } catch {
    return false;
  }

  if (url.username || url.password) {
    return false;
  }

  if (url.protocol === 'https:') {
    return url.hostname.length > 0;
  }
  if (url.protocol === 'http:') {
    return LOOPBACK_HOSTS.includes(url.hostname);
  }
  return PRIVATE_USE_SCHEME_PATTERN.test(url.protocol);
}

export function getRoute(lang: string, path: string) {
  if (lang === 'cs') {
    return path;
  }
  return `/${lang}${path}`;
}

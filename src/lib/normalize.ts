export function normalizeUsername(username: string): string {
  return username
    .trim()
    .replace(/\s/g, '_')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

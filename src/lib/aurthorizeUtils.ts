import { AuthorizeData } from '@/lib/models/AuthorizeData';

export function parseAuthorizeData(data: string | null): AuthorizeData | null {
  try {
    return data != '' && data != null ? JSON.parse(atob(data)) : null;
  } catch {
    return null;
  }
}

import 'server-only';
import { cookies } from 'next/headers';
import { AuthorizeData } from '@/lib/models/AuthorizeData';

export async function getAuthorizeData(): Promise<AuthorizeData | null> {
  try {
    const cookieStore = await cookies();
    const authorizeData = cookieStore.get('authorize-data')?.value;
    if (authorizeData == null) {
      return null;
    }
    return JSON.parse(atob(authorizeData));
  } catch {
    return null;
  }
}

export async function clearAuthorizeData(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('authorize-data');
}

import 'server-only';
import { cookies } from 'next/headers';
import { AuthorizeData } from '@authapex/core';
import { AUTHORIZATION_SERVICE } from '@/lib/consts';

export async function getAuthorizeData(): Promise<AuthorizeData | null> {
  const cookieStore = await cookies();
  const authorizeData = cookieStore.get('authorize-data')?.value;
  if (authorizeData == null) {
    return null;
  }
  try {
    return AUTHORIZATION_SERVICE.decodeAuthorizeData(authorizeData);
  } catch {
    return null;
  }
}

export async function clearAuthorizeData(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('authorize-data');
}

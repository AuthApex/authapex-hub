import 'server-only';
import { cookies } from 'next/headers';
import { AUTHORIZATION_SERVICE } from '@/lib/consts';
import { AuthorizeData } from '@authapex/core';

export async function getAuthorizeData(): Promise<AuthorizeData | null> {
  const cookieStore = await cookies();
  const authorizeData = cookieStore.get('authorize-data')?.value;
  if (authorizeData == null) {
    return null;
  }
  return AUTHORIZATION_SERVICE.decodeAuthorizeData(authorizeData);
}

export async function clearAuthorizeData(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('authorize-data');
}

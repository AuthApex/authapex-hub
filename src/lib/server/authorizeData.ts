import 'server-only';
import { cookies } from 'next/headers';
import { AUTHORIZATION_SERVICE } from '@/lib/consts';
import { AuthorizeData } from '@authapex/core';
import { logExpectedWarning } from '@/lib/server/logger';

export async function getAuthorizeData(): Promise<AuthorizeData | null> {
  const cookieStore = await cookies();
  const authorizeData = cookieStore.get('authorize-data')?.value;
  if (authorizeData == null) {
    return null;
  }
  try {
    return AUTHORIZATION_SERVICE.decodeAuthorizeData(authorizeData);
  } catch (error) {
    // A tampered or outdated cookie is an expected client side failure; the flow simply starts over.
    logExpectedWarning('The authorize-data cookie could not be decoded', error);
    return null;
  }
}

export async function clearAuthorizeData(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('authorize-data');
}

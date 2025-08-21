'use server';

import { redirect } from 'next/navigation';
import { nanoid } from 'nanoid';
import { clearAuthorizeData, getAuthorizeData } from '@/lib/server/authorizeData';
import { getAuth } from '@/lib/actions/auth';
import { insertAuthCode } from '@/lib/server/mongodb';
import { getRoute } from '@/lib/getRoute';

export async function authorize(lang: string): Promise<void> {
  const auth = await getAuth();
  if (!auth.isAuth) {
    redirect(getRoute(lang, '/'));
  }
  const authorizeData = await getAuthorizeData();
  if (authorizeData == null) {
    redirect(getRoute(lang, '/'));
  }
  await clearAuthorizeData();

  const authCode = nanoid();

  await insertAuthCode(authCode, auth.user.userId);

  const params = new URLSearchParams();
  params.append('authCode', authCode);
  params.append('lang', lang);

  redirect(authorizeData.redirectUrl + '?' + params.toString());
}

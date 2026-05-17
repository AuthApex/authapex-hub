'use server';

import { redirect } from 'next/navigation';
import { nanoid } from 'nanoid';
import { clearAuthorizeData, getAuthorizeData } from '@/lib/server/authorizeData';
import { getAuth } from '@/lib/actions/auth';
import { getAuthorizedAppsSanitized, insertAuthCode } from '@/lib/server/mongodb';
import { getRoute } from '@/lib/getRoute';
import { getVerifiedStatus } from '@/lib/getVerifiedStatus';

export async function authorize(lang: string): Promise<void> {
  const auth = await getAuth();
  if (!auth.isAuth) {
    redirect(getRoute(lang, '/'));
  }
  const authorizeData = await getAuthorizeData();
  if (authorizeData == null) {
    redirect(getRoute(lang, '/'));
  } else {
    const authorizedApps = await getAuthorizedAppsSanitized();
    const redirectUrlOrigin = new URL(authorizeData.redirectUrl).origin;
    const { status } = getVerifiedStatus(authorizedApps, authorizeData.app, redirectUrlOrigin);

    await clearAuthorizeData();

    const authCode = nanoid();

    await insertAuthCode(authCode, auth.user.userId, status);

    const params = new URLSearchParams();
    params.append('authCode', authCode);
    params.append('lang', lang);

    redirect(authorizeData.redirectUrl + '?' + params.toString());
  }
}

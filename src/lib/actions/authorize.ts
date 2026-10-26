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
    let redirectUrl: URL;
    try {
      redirectUrl = new URL(authorizeData.redirectUrl);
    } catch (error) {
      await clearAuthorizeData();
      redirect(getRoute(lang, '/'));
    }

    const authorizedApps = await getAuthorizedAppsSanitized();
    const { status } = getVerifiedStatus(authorizedApps, authorizeData.app, redirectUrl.origin);

    await clearAuthorizeData();

    const authCode = nanoid();
    const result = await insertAuthCode(authCode, auth.user.userId, status);
    if (!result.success) {
      redirect(getRoute(lang, '/'));
    }

    const params = new URLSearchParams();
    params.append('authCode', authCode);
    params.append('lang', lang);

    redirect(authorizeData.redirectUrl + '?' + params.toString());
  }
}

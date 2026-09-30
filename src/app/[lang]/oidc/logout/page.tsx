import { getTranslation } from '@/locales/lang';
import { getAuth } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import { getRoute } from '@/lib/getRoute';
import Image from 'next/image';
import { Typography } from 'gtomy-lib';
import { Footer } from '@/components/Footer';
import { OidcLogoutCard } from '@/components/client/OidcLogoutCard';
import { getOidcLogoutRequestParams, resolveOidcLogoutRequest } from '@/lib/server/oidc/logoutRequest';

export const dynamic = 'force-dynamic';

export default async function OidcLogout({ params }: Readonly<{ params: Promise<{ lang: string }> }>) {
  const lang = (await params).lang;
  const trans = getTranslation(lang);

  const auth = await getAuth();
  if (!auth.isAuth) {
    redirect(getRoute(lang, '/signin'));
  }

  const logoutParams = await getOidcLogoutRequestParams();
  if (logoutParams == null) {
    redirect(getRoute(lang, '/'));
  }

  const resolved = await resolveOidcLogoutRequest(new URLSearchParams(logoutParams));
  if (resolved.type !== 'valid') {
    redirect(getRoute(lang, '/oidc/error'));
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-center items-center gap-4">
          <Image src="/favicon.ico" className="shrink-0 rounded" alt="Application icon" width={32} height={32} />
          <Typography as="h1" size="lg" weight="bold">
            {trans.title}
          </Typography>
        </div>
        <div className="card md:bg-neutral text-neutral-content w-sm max-w-screen">
          <div className="card-body flex flex-col">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-2">
                <Typography as="h2" size="xl" weight="bold" className="text-center">
                  {trans.oidc.logout.title}
                </Typography>
                <Typography className="text-center">{trans.oidc.logout.subtitle}</Typography>
              </div>
              <OidcLogoutCard lang={lang} trans={trans} displayName={resolved.request.client?.displayName ?? null} />
            </div>
          </div>
        </div>
        <Footer lang={lang} trans={trans} isSignIn />
      </div>
    </div>
  );
}

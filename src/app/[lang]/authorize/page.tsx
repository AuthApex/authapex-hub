import { getTranslation } from '@/locales/lang';
import { AuthorizeCard } from '@/components/client/AuthorizeCard';
import { getAuth } from '@/lib/actions/auth';
import { TokenRefresher } from '@/components/client/TokenRefresher';
import Image from 'next/image';
import { Typography } from 'gtomy-lib';
import { Footer } from '@/components/Footer';
import { getAuthorizedAppsSanitized, getUserAppSessions } from '@/lib/server/mongodb';

export default async function Authorize({ params }: Readonly<{ params: Promise<{ lang: string }> }>) {
  const lang = (await params).lang;
  const trans = getTranslation(lang);

  const auth = await getAuth();
  const authorizedApps = await getAuthorizedAppsSanitized();
  const userAppSessions = auth.user ? await getUserAppSessions(auth.user.userId) : [];

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      {auth.isAuth && <TokenRefresher />}
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
                  {trans.authorize.title}
                </Typography>
                <Typography className="text-center">{trans.authorize.subtitle}</Typography>
              </div>
              <AuthorizeCard
                trans={trans}
                isAuth={auth.isAuth}
                lang={lang}
                authorizedApps={authorizedApps}
                userAppSessions={userAppSessions}
              />
            </div>
          </div>
        </div>
        <Footer lang={lang} trans={trans} isSignIn />
      </div>
    </div>
  );
}

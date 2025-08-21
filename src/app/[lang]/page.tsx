import { getTranslation } from '@/locales/lang';
import { Button, Typography } from 'gtomy-lib';
import Image from 'next/image';
import { getAuth, logout } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import { getRoute } from '@/lib/getRoute';
import { TokenRefresher } from '@/components/client/TokenRefresher';
import { Footer } from '@/components/Footer';

export default async function Home({ params }: Readonly<{ params: Promise<{ lang: string }> }>) {
  const lang = (await params).lang;
  const trans = getTranslation(lang);

  const auth = await getAuth();

  if (!auth.isAuth) {
    redirect(getRoute(lang, '/signin'));
  }
  const user = auth.user;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <TokenRefresher />
      <div className="flex flex-col gap-6">
        <div className="flex justify-center items-center gap-4">
          <Image src="/favicon.ico" className="shrink-0 rounded" alt="Application icon" width={32} height={32} />
          <Typography as="h1" size="lg" weight="bold">
            {trans.title}
          </Typography>
        </div>
        <div className="card md:bg-neutral text-neutral-content w-lg max-w-screen">
          <div className="card-body flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4 break-all">
              <Typography>{trans.home.userId}</Typography>
              <Typography>{user.userId}</Typography>
              <Typography>Email</Typography>
              <Typography>{user.email}</Typography>
              <Typography>{trans.home.username}</Typography>
              <Typography>{user.username}</Typography>
              <Typography>{trans.home.displayName}</Typography>
              <Typography>{user.displayName}</Typography>
              {user.profileImageUrl && (
                <>
                  <Typography>{trans.home.profileImageUrl}</Typography>
                  <Typography>{user.profileImageUrl}</Typography>
                </>
              )}
              {user.profileImageId && (
                <>
                  <Typography>{trans.home.profileImageId}</Typography>
                  <Typography>{user.profileImageId}</Typography>
                </>
              )}
            </div>
            <div className="divider"></div>
            <Button onClick={logout}>{trans.logout}</Button>
          </div>
        </div>
        <Footer lang={lang} trans={trans} />
      </div>
    </div>
  );
}

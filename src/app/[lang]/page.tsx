import { getTranslation } from '@/locales/lang';
import { Button, Typography } from 'gtomy-lib';
import Image from 'next/image';
import { getAuth, logout } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import { getRoute } from '@/lib/getRoute';
import { TokenRefresher } from '@/components/client/TokenRefresher';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { ProfileImage } from '@/components/ProfileImage';
import { PERMISSION_SERVICE, VERIFIED_APPS } from '@/lib/consts';
import { EditDisplayNameButton } from '@/components/client/actionButtons/EditDisplayNameButton';
import { ProfilePictureButtons } from '@/components/client/actionButtons/ProfilePictureButtons';

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
        <div className="card md:bg-neutral text-neutral-content w-3xl max-w-screen">
          <div className="card-body flex flex-col gap-4">
            <div className="flex justify-between flex-col md:flex-row gap-4">
              <div className="flex gap-4">
                <ProfileImage user={user} className="w-24 h-24" />
                <div className="flex flex-col">
                  <Typography size="xl" weight="semibold">
                    {user.displayName}
                  </Typography>
                  <Typography>@{user.username}</Typography>
                </div>
              </div>
              <div>
                <Typography>{trans.home.userId}:&nbsp;</Typography>
                <Typography>{user.userId}</Typography>
              </div>
            </div>
            <div className="divider"></div>
            <Typography size="xl" weight="semibold">
              {trans.home.userInformation}
            </Typography>
            <div className="grid grid-cols-2 gap-4 break-all">
              <Typography>{trans.home.email}</Typography>
              <Typography>{user.email}</Typography>
              {user.roles.length > 0 && (
                <>
                  <Typography>{trans.home.permissions}</Typography>
                  <div className="flex flex-col">
                    {user.roles.map((role) => (
                      <div key={role.application + role.role}>
                        <Typography weight="semibold">
                          {VERIFIED_APPS.find((app) => app.name === role.application)?.displayName ?? role.application}
                          :&nbsp;
                        </Typography>
                        <Typography>{role.role.toUpperCase()}</Typography>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="divider"></div>
            <div className="flex flex-col md:flex-row justify-between gap-12 md:gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <EditDisplayNameButton user={user} trans={trans} />
                {auth.canChangeProfileImage && <ProfilePictureButtons trans={trans} />}
                {PERMISSION_SERVICE.hasPermission(user, 'admin') && (
                  <Button as={Link} href={getRoute(lang, '/admin')} color="accent">
                    {trans.admin.title}
                  </Button>
                )}
              </div>
              <Button onClick={logout}>{trans.logout}</Button>
            </div>
          </div>
        </div>
        <Footer lang={lang} trans={trans} isSignIn />
      </div>
    </div>
  );
}

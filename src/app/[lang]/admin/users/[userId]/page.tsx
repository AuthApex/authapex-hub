import { getTranslation } from '@/locales/lang';
import { Typography } from 'gtomy-lib';
import Image from 'next/image';
import { TokenRefresher } from '@/components/client/TokenRefresher';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { getRoute } from '@/lib/getRoute';
import { getAuth } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import { PERMISSION_SERVICE } from '@/lib/consts';
import { getAuthorizedAppsSanitized, getUserByUserId } from '@/lib/server/mongodb';
import { ProfileImage } from '@/components/ProfileImage';
import { EditUserRolesButton } from '@/components/client/actionButtons/EditUserRolesButton';

export default async function Admin({ params }: Readonly<{ params: Promise<{ lang: string; userId: string }> }>) {
  const lang = (await params).lang;
  const userId = (await params).userId;
  const trans = getTranslation(lang);

  const auth = await getAuth();

  if (!auth.isAuth) {
    redirect(getRoute(lang, '/signin'));
  }

  if (!PERMISSION_SERVICE.hasPermission(auth.user, 'admin')) {
    redirect(getRoute(lang, '/'));
  }

  const user = await getUserByUserId(userId);

  if (!user) {
    redirect(getRoute(lang, '/admin/users'));
  }

  const verifiedApps = await getAuthorizedAppsSanitized();

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
        <div className="card md:bg-neutral text-neutral-content w-5xl max-w-screen">
          <div className="card-body flex flex-col gap-4">
            <div className="breadcrumbs text-sm">
              <ul>
                <li>
                  <Link href={getRoute(lang, '/')}>{trans.home.title}</Link>
                </li>
                <li>
                  <Link href={getRoute(lang, '/admin')}>{trans.admin.title}</Link>
                </li>
                <li>
                  <Link href={getRoute(lang, '/admin/users')}>{trans.admin.users.title}</Link>
                </li>
                <li>{user.username}</li>
              </ul>
            </div>

            <div className="flex gap-4">
              <ProfileImage user={user} className="size-24" />
              <div className="flex flex-col gap-1">
                <Typography weight="semibold" size="2xl">
                  {user.displayName}
                </Typography>
                <Typography>@{user.username}</Typography>
                <Typography size="xs">{user.userId}</Typography>
              </div>
            </div>
            <div className="divider"></div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="grid grid-cols-2 md:col-span-4 gap-2">
                <Typography>{trans.admin.users.userId}</Typography>
                <Typography>{user.userId}</Typography>
                <Typography>{trans.admin.users.userName}</Typography>
                <Typography>{user.username}</Typography>
                <Typography>{trans.admin.users.displayName}</Typography>
                <Typography>{user.displayName}</Typography>
                <Typography>{trans.admin.users.email}</Typography>
                <Typography>{user.email}</Typography>
                <Typography>{trans.admin.users.roles}</Typography>
                <Typography>
                  <div className="flex flex-col">
                    {user.roles.map((role) => (
                      <div key={role.application + role.role}>
                        <Typography weight="semibold">
                          {verifiedApps.find((app) => app.name === role.application)?.displayName ?? role.application}
                          :&nbsp;
                        </Typography>
                        <Typography>{role.role.toUpperCase()}</Typography>
                      </div>
                    ))}
                  </div>
                </Typography>
              </div>
              <div className="flex flex-col gap-2">
                <EditUserRolesButton user={user} trans={trans} verifiedApps={verifiedApps} />
                {/*<Button color="warning">Block user</Button>*/}
                {/*<Button color="error">Remove user</Button>*/}
              </div>
            </div>
          </div>
        </div>
        <Footer lang={lang} trans={trans} isSignIn />
      </div>
    </div>
  );
}

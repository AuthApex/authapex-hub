import { getTranslation } from '@/locales/lang';
import { Button, Typography } from 'gtomy-lib';
import Image from 'next/image';
import { TokenRefresher } from '@/components/client/TokenRefresher';
import { Footer } from '@/components/Footer';
import Link from 'next/link';
import { getRoute } from '@/lib/getRoute';
import { getAuth } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import { PERMISSION_SERVICE } from '@/lib/consts';
import { getUsers } from '@/lib/server/mongodb';
import { ProfileImage } from '@/components/ProfileImage';
import { AdminUsersPagination } from '@/components/client/AdminUsersPagination';

export default async function Admin({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ page?: string }>;
}>) {
  const lang = (await params).lang;
  const page = (await searchParams).page;
  const trans = getTranslation(lang);

  const auth = await getAuth();

  if (!auth.isAuth) {
    redirect(getRoute(lang, '/signin'));
  }

  if (!PERMISSION_SERVICE.hasPermission(auth.user, 'admin')) {
    redirect(getRoute(lang, '/'));
  }

  if (page != null && isNaN(+page)) {
    redirect(getRoute(lang, '/admin/users'));
  }
  const users = await getUsers(+(page ?? 0));

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
                <li>{trans.admin.users.title}</li>
              </ul>
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th></th>
                    <th>{trans.admin.users.displayName}</th>
                    <th>{trans.admin.users.email}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.userId}>
                      <td className="flex flex-col lg:flex-row gap-4">
                        <ProfileImage user={user} className="size-12" />
                        <div className="flex flex-col gap-0.5 justify-center">
                          <Typography weight="semibold">{user.username}</Typography>
                          <Typography size="xs" className="whitespace-nowrap">
                            {user.userId}
                          </Typography>
                        </div>
                      </td>
                      <td>{user.displayName}</td>
                      <td>{user.email}</td>
                      <td>
                        <Button size="sm" as={Link} href={getRoute(lang, '/admin/users/' + user.userId)}>
                          Detail
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <AdminUsersPagination page={+(page ?? 0)} />
          </div>
        </div>
        <Footer lang={lang} trans={trans} isSignIn />
      </div>
    </div>
  );
}

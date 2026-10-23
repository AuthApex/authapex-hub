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
import { findUsers, getAuthorizedAppsSanitized, getUserRoleApplications } from '@/lib/server/mongodb';
import { ProfileImage } from '@/components/ProfileImage';
import { AdminUsersPagination } from '@/components/client/AdminUsersPagination';
import { AdminUsersFilter } from '@/components/client/AdminUsersFilter';
import { parseAdminUsersQuery } from '@/lib/userFilters';

export default async function Admin({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ lang: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}>) {
  const lang = (await params).lang;
  const trans = getTranslation(lang);

  const auth = await getAuth();

  if (!auth.isAuth) {
    redirect(getRoute(lang, '/signin'));
  }

  if (!PERMISSION_SERVICE.hasPermission(auth.user, 'admin')) {
    redirect(getRoute(lang, '/'));
  }

  const { filters, page, size: usersPerPage, sortBy, sortOrder, isValid } = parseAdminUsersQuery(await searchParams);

  if (!isValid) {
    redirect(getRoute(lang, '/admin/users'));
  }

  const [{ users, hasMore }, verifiedApps, roleApplications] = await Promise.all([
    findUsers({ filters, page, usersPerPage, sortBy, sortOrder }),
    getAuthorizedAppsSanitized(),
    getUserRoleApplications(),
  ]);

  const applications = [
    ...verifiedApps.map((app) => ({ value: app.name, label: app.displayName })),
    ...roleApplications
      .filter((application) => !verifiedApps.some((app) => app.name === application))
      .map((application) => ({ value: application, label: application })),
  ].sort((a, b) => a.label.localeCompare(b.label));

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
            <AdminUsersFilter
              filters={filters}
              applications={applications}
              usersPerPage={String(usersPerPage)}
              sortBy={sortBy}
              sortOrder={sortOrder}
              trans={trans}
            />
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
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="text-center opacity-70">
                        {trans.admin.users.noResults}
                      </td>
                    </tr>
                  )}
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
                      <td>
                        <div className="flex flex-col gap-1">
                          <span>{user.email}</span>
                          <div className="flex flex-wrap gap-1">
                            <span className="badge badge-sm badge-ghost">
                              {user.provider === 'google'
                                ? trans.admin.users.providerGoogle
                                : trans.admin.users.providerNative}
                            </span>
                            {!user.emailVerified && (
                              <span className="badge badge-sm badge-warning">
                                {trans.admin.users.verificationUnverified}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
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
            <AdminUsersPagination page={page} isLast={!hasMore} />
          </div>
        </div>
        <Footer lang={lang} trans={trans} isSignIn />
      </div>
    </div>
  );
}

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
import { getAuthorizedApps } from '@/lib/server/mongodb';
import { AddAuthorizedAppButton } from '@/components/client/actionButtons/AddAuthorizedAppButton';
import { CopyApiKeyButton } from '@/components/client/actionButtons/CopyApiKeyButton';
import { RemoveAuthorizedAppButton } from '@/components/client/actionButtons/RemoveAuthorizedAppButton';

export default async function Admin({ params }: Readonly<{ params: Promise<{ lang: string }> }>) {
  const lang = (await params).lang;
  const trans = getTranslation(lang);

  const auth = await getAuth();

  if (!auth.isAuth) {
    redirect(getRoute(lang, '/signin'));
  }

  if (!PERMISSION_SERVICE.hasPermission(auth.user, 'admin')) {
    redirect(getRoute(lang, '/'));
  }

  const authorizedApps = await getAuthorizedApps();

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
                <li>{trans.admin.authorizedApps.title}</li>
              </ul>
            </div>
            <div className="flex gap-4">
              <AddAuthorizedAppButton trans={trans} />
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>{trans.admin.authorizedApps.name}</th>
                    <th>{trans.admin.authorizedApps.displayName}</th>
                    <th>{trans.admin.authorizedApps.url}</th>
                    <th>{trans.admin.authorizedApps.websocketEndpoint}</th>
                    <th>{trans.admin.authorizedApps.apiKey}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {authorizedApps.map((app) => (
                    <tr key={app.name}>
                      <td>{app.name}</td>
                      <td>{app.displayName}</td>
                      <td>{app.url}</td>
                      <td>{app.websocketEndpoint}</td>
                      <td>{app.apiKey.slice(0, 8) + '...'}</td>
                      <td className="flex gap-1 flex-wrap justify-end">
                        <CopyApiKeyButton apiKey={app.apiKey} trans={trans} />
                        <RemoveAuthorizedAppButton app={app.name} trans={trans} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <Footer lang={lang} trans={trans} isSignIn />
      </div>
    </div>
  );
}

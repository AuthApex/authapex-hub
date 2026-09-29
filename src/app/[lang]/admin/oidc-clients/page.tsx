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
import { getOidcClients } from '@/lib/server/oidcMongodb';
import { AddOidcClientButton } from '@/components/client/actionButtons/AddOidcClientButton';
import { CopyTextButton } from '@/components/client/actionButtons/CopyTextButton';
import { RemoveOidcClientButton } from '@/components/client/actionButtons/RemoveOidcClientButton';

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

  const oidcClients = await getOidcClients();

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
                <li>{trans.admin.oidcClients.title}</li>
              </ul>
            </div>
            <div className="flex gap-4">
              <AddOidcClientButton trans={trans} />
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>{trans.admin.oidcClients.displayName}</th>
                    <th>{trans.admin.oidcClients.clientId}</th>
                    <th>{trans.admin.oidcClients.redirectUris}</th>
                    <th>{trans.admin.oidcClients.scopes}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {oidcClients.map((client) => (
                    <tr key={client.clientId}>
                      <td className="whitespace-nowrap">{client.displayName}</td>
                      <td className="whitespace-nowrap">{client.clientId.slice(0, 8) + '...'}</td>
                      <td>
                        {client.redirectUris.map((redirectUri) => (
                          <div key={redirectUri}>{redirectUri}</div>
                        ))}
                      </td>
                      <td>{client.scopes.join(' ')}</td>
                      <td className="flex gap-2 flex-col justify-end w-max">
                        <CopyTextButton text={client.clientId} label={trans.admin.oidcClients.copyClientId} />
                        <CopyTextButton text={client.clientSecret} label={trans.admin.oidcClients.copyClientSecret} />
                        <RemoveOidcClientButton clientId={client.clientId} trans={trans} />
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

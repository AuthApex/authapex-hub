import { getTranslation } from '@/locales/lang';
import { Typography } from 'gtomy-lib';
import Image from 'next/image';
import { getAuth } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import { getRoute } from '@/lib/getRoute';
import { TokenRefresher } from '@/components/client/TokenRefresher';
import { Footer } from '@/components/Footer';
import { getUserAppSessions } from '@/lib/server/mongodb';
import Link from 'next/link';
import { RemoveUserSessionButton } from '@/components/client/actionButtons/RemoveUserSessionButton';

export default async function Home({ params }: Readonly<{ params: Promise<{ lang: string }> }>) {
  const lang = (await params).lang;
  const trans = getTranslation(lang);

  const auth = await getAuth();

  if (!auth.isAuth) {
    redirect(getRoute(lang, '/signin'));
  }
  const user = auth.user;
  const userAppSessions = await getUserAppSessions(user.userId);

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
            <div className="breadcrumbs text-sm">
              <ul>
                <li>
                  <Link href={getRoute(lang, '/')}>{trans.home.title}</Link>
                </li>
                <li>{trans.sessions.button}</li>
              </ul>
            </div>

            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>{trans.authorize.appName}</th>
                    <th>{trans.authorize.appUrl}</th>
                    <th></th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {userAppSessions.map((session) => (
                    <tr key={session.app + session.userId + session.verified}>
                      <td>{session.displayName ?? session.app}</td>
                      <td>
                        {session.url != null ? (
                          <a href={session.url} className="hover:underline" rel="noopener noreferrer">
                            {session.url}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        {session.verified && (
                          <div className="tooltip tooltip-success" data-tip={trans.authorize.verifiedTooltip}>
                            <div className="badge badge-success badge-sm">{trans.authorize.verified}</div>
                          </div>
                        )}
                        {session.verified === false && (
                          <div className="tooltip tooltip-error" data-tip={trans.authorize.notVerifiedTooltip}>
                            <div className="badge badge-error badge-sm">{trans.authorize.notVerified}</div>
                          </div>
                        )}
                      </td>
                      <td className="flex justify-end">
                        <RemoveUserSessionButton session={session} trans={trans} />
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

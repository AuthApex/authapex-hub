import { getTranslation } from '@/locales/lang';
import { AuthorizeCard } from '@/components/client/AuthorizeCard';
import { getAuth } from '@/lib/actions/auth';
import { TokenRefresher } from '@/components/client/TokenRefresher';

export default async function Authorize({ params }: Readonly<{ params: Promise<{ lang: string }> }>) {
  const lang = (await params).lang;
  const trans = getTranslation(lang);

  const auth = await getAuth();

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      {auth.isAuth && <TokenRefresher />}
      <AuthorizeCard trans={trans} isAuth={auth.isAuth} lang={lang} />
    </div>
  );
}

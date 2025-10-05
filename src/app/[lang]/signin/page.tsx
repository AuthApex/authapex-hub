import { getTranslation } from '@/locales/lang';
import Image from 'next/image';
import { Typography } from 'gtomy-lib';
import { Footer } from '@/components/Footer';
import { LoginForm } from '@/components/client/forms/LoginForm';
import { GoogleLoginButton } from '@/components/client/GoogleLoginButton';
import Link from 'next/link';
import { getRoute } from '@/lib/getRoute';
import { getAuth } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';

export default async function Signin({ params }: Readonly<{ params: Promise<{ lang: string }> }>) {
  const lang = (await params).lang;
  const trans = getTranslation(lang);

  const auth = await getAuth();

  if (auth.isAuth) {
    redirect(getRoute(lang, '/'));
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="flex flex-col gap-6">
        <div className="flex justify-center items-center gap-4">
          <Image src="/favicon.ico" className="shrink-0 rounded" alt="Application icon" width={32} height={32} />
          <Typography as="h1" size="lg" weight="bold">
            {trans.title}
          </Typography>
        </div>
        <div className="card md:bg-neutral text-neutral-content w-sm max-w-screen">
          <div className="card-body flex flex-col">
            <Typography as="h2" size="xl" weight="bold" className="text-center">
              {trans.signin.title}
            </Typography>
            <Typography className="text-center">{trans.signin.subtitle}</Typography>
            <div className="flex flex-col gap-4 mt-6 mb-4 items-center">
              <GoogleLoginButton />
            </div>
            <div className="divider">{trans.signin.divider}</div>
            <LoginForm trans={trans} />
            <Typography className="text-center mt-2">
              {trans.signin.dontHaveAnAccount}{' '}
              <Link href={getRoute(lang, '/signup')} className="link">
                {trans.signup.button}
              </Link>
            </Typography>
          </div>
        </div>
        <Footer lang={lang} trans={trans} />
      </div>
    </div>
  );
}

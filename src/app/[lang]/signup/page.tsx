import { getTranslation } from '@/locales/lang';
import { Typography } from 'gtomy-lib';
import Link from 'next/link';
import Image from 'next/image';
import { getRoute } from '@/lib/getRoute';
import { Footer } from '@/components/Footer';
import { RegisterForm } from '@/components/client/forms/RegisterForm';
import { getAuth } from '@/lib/actions/auth';
import { redirect } from 'next/navigation';
import { OIDC_SIGNIN_FLOW } from '@/lib/consts';

export default async function Signup({
  params,
  searchParams,
}: Readonly<{ params: Promise<{ lang: string }>; searchParams: Promise<{ flow?: string | string[] }> }>) {
  const lang = (await params).lang;
  const trans = getTranslation(lang);
  const flow = (await searchParams).flow === OIDC_SIGNIN_FLOW ? OIDC_SIGNIN_FLOW : null;

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
              {trans.signup.title}
            </Typography>
            <RegisterForm trans={trans} flow={flow} />
            <Typography className="text-center mt-2">
              {trans.signup.alreadyHaveAnAccount}{' '}
              <Link href={getRoute(lang, flow ? `/signin?flow=${flow}` : '/signin')} className="link">
                {trans.signin.button}
              </Link>
            </Typography>
          </div>
        </div>
        <Footer lang={lang} trans={trans} />
      </div>
    </div>
  );
}

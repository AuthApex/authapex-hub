import { getTranslation } from '@/locales/lang';
import Image from 'next/image';
import Link from 'next/link';
import { Button, Typography } from 'gtomy-lib';
import { Footer } from '@/components/Footer';
import { getRoute } from '@/lib/getRoute';

export default async function OidcError({ params }: Readonly<{ params: Promise<{ lang: string }> }>) {
  const lang = (await params).lang;
  const trans = getTranslation(lang);

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
          <div className="card-body flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <Typography as="h2" size="xl" weight="bold" className="text-center">
                {trans.oidc.error.title}
              </Typography>
              <Typography className="text-center">{trans.oidc.error.description}</Typography>
            </div>
            <Button as={Link} href={getRoute(lang, '/')} color="primary">
              {trans.oidc.error.backHome}
            </Button>
          </div>
        </div>
        <Footer lang={lang} trans={trans} isSignIn />
      </div>
    </div>
  );
}

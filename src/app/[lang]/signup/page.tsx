import { getTranslation } from '@/locales/lang';
import { Button, TextInput, Typography } from 'gtomy-lib';
import Link from 'next/link';
import Image from 'next/image';
import { signup } from '@/lib/actions/auth';
import { getRoute } from '@/lib/getRoute';
import { Footer } from '@/components/Footer';

export default async function Signup({ params }: Readonly<{ params: Promise<{ lang: string }> }>) {
  const lang = (await params).lang;
  const trans = getTranslation(lang);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <form action={signup} className="flex flex-col gap-6">
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
            <div className="flex flex-col gap-2">
              <TextInput label={trans.signup.name} name="username" placeholder={trans.signup.namePlaceholder} />
              <TextInput label="Email" name="email" placeholder="mail@example.com" type="email" />
              <TextInput
                label={trans.signup.password}
                name="password"
                type="password"
                placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
              />
              <TextInput
                label={trans.signup.repeatPassword}
                name="confirmPassword"
                type="password"
                placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
              />
              <Button color="primary" className="mt-4" type="submit">
                {trans.signup.button}
              </Button>
            </div>
            <Typography className="text-center mt-2">
              {trans.signup.alreadyHaveAnAccount}{' '}
              <Link href={getRoute(lang, '/signin')} className="link">
                {trans.signin.button}
              </Link>
            </Typography>
          </div>
        </div>
        <Footer lang={lang} trans={trans} />
      </form>
    </div>
  );
}

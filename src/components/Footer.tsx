import { Typography } from 'gtomy-lib';
import Link from 'next/link';
import { getRoute } from '@/lib/getRoute';
import { Translations } from '@/locales/translation';

export interface FooterProps {
  lang: string;
  trans: Translations;
  isSignIn?: boolean;
}

export function Footer({ trans, lang }: FooterProps) {
  return (
    <div className="text-center p-2">
      <Typography as="p" size="sm">
        {trans.signin.byContinuing}
      </Typography>
      <Typography as="p" size="sm">
        <Link href={getRoute(lang, '/terms-of-service')} className="link">
          {trans.signin.termsOfService}
        </Link>
        {' ' + trans.and + ' '}
        <Link href={getRoute(lang, '/privacy-policy')} className="link">
          {trans.signin.privacyPolicy}
        </Link>
        .
      </Typography>
    </div>
  );
}

import { getTranslation } from '@/locales/lang';
import { Button, ColumnPage, Typography } from 'gtomy-lib';
import Link from 'next/link';
import { getRoute } from '@/lib/getRoute';

export default async function TermsOfService({ params }: Readonly<{ params: Promise<{ lang: string }> }>) {
  const lang = (await params).lang;
  const trans = getTranslation(lang);

  return (
    <ColumnPage>
      <div className="flex justify-between flex-col md:flex-row text-center md:text-left gap-4">
        <Typography size="4xl" weight="semibold">
          {trans.terms.title}
        </Typography>
        <Button as={Link} href={getRoute(lang, '/')} color="primary" size="lg">
          {trans.back}
        </Button>
      </div>
      <Typography size="xl" weight="semibold">
        {trans.terms.subtitle}
      </Typography>
      <p>{trans.terms.description}</p>
      <Typography size="xl" weight="medium">
        {trans.terms.acceptanceOfTerms.title}
      </Typography>
      <p>{trans.terms.acceptanceOfTerms.element1}</p>
      <Typography size="xl" weight="medium">
        {trans.terms.usageOfService.title}
      </Typography>
      <p>{trans.terms.usageOfService.element1}</p>
      <Typography size="xl" weight="medium">
        {trans.terms.registrationAndAccounts.title}
      </Typography>
      <p>{trans.terms.registrationAndAccounts.element1}</p>
      <Typography size="xl" weight="medium">
        {trans.terms.integrationWithOtherServices.title}
      </Typography>
      <p>{trans.terms.integrationWithOtherServices.element1}</p>
      <Typography size="xl" weight="medium">
        {trans.terms.terminationOfService.title}
      </Typography>
      <p>{trans.terms.terminationOfService.element1}</p>
      <Typography size="xl" weight="medium">
        {trans.terms.changesToTerms.title}
      </Typography>
      <p>{trans.terms.changesToTerms.element1}</p>
      <Typography size="xl" weight="medium">
        {trans.terms.limitationOfLiability.title}
      </Typography>
      <p>{trans.terms.limitationOfLiability.element1}</p>
      <p>{trans.terms.limitationOfLiability.element2}</p>
      <ul>
        <li>{trans.terms.limitationOfLiability.list.element1}</li>
        <li>{trans.terms.limitationOfLiability.list.element2}</li>
      </ul>
    </ColumnPage>
  );
}

import { getTranslation } from '@/locales/lang';
import { Button, ColumnPage, Typography } from 'gtomy-lib';
import Link from 'next/link';
import { getRoute } from '@/lib/getRoute';

export default async function PrivacyPolicy({ params }: Readonly<{ params: Promise<{ lang: string }> }>) {
  const lang = (await params).lang;
  const trans = getTranslation(lang);

  return (
    <ColumnPage>
      <div className="flex justify-between flex-col md:flex-row text-center md:text-left gap-4">
        <Typography size="4xl" weight="semibold">
          {trans.privacy.title}
        </Typography>
        <Button as={Link} href={getRoute(lang, '/')} color="primary" size="lg">
          {trans.back}
        </Button>
      </div>
      <Typography size="xl" weight="semibold">
        {trans.privacy.subtitle}
      </Typography>
      <p>{trans.privacy.description}</p>
      <Typography size="xl" weight="medium">
        {trans.privacy.informationWeCollect.title}
      </Typography>
      <p>{trans.privacy.informationWeCollect.paragraph1}</p>
      <ul>
        <li>{trans.privacy.informationWeCollect.list.element1}</li>
        <li>{trans.privacy.informationWeCollect.list.element2}</li>
        <li>{trans.privacy.informationWeCollect.list.element3}</li>
      </ul>
      <p>{trans.privacy.informationWeCollect.paragraph2}</p>
      <Typography size="xl" weight="medium">
        {trans.privacy.howWeUseYourInformation.title}
      </Typography>
      <p>{trans.privacy.howWeUseYourInformation.paragraph1}</p>
      <ul>
        <li>{trans.privacy.howWeUseYourInformation.list.element1}</li>
        <li>{trans.privacy.howWeUseYourInformation.list.element2}</li>
        <li>{trans.privacy.howWeUseYourInformation.list.element3}</li>
        <li>{trans.privacy.howWeUseYourInformation.list.element4}</li>
        <li>{trans.privacy.howWeUseYourInformation.list.element5}</li>
      </ul>
      <Typography size="xl" weight="medium">
        {trans.privacy.sharingOfYourInformation.title}
      </Typography>
      <p>{trans.privacy.sharingOfYourInformation.paragraph1}</p>
      <p>{trans.privacy.sharingOfYourInformation.paragraph2}</p>
      <Typography size="xl" weight="medium">
        {trans.privacy.dataSecurity.title}
      </Typography>
      <p>{trans.privacy.dataSecurity.paragraph1}</p>
      <Typography size="xl" weight="medium">
        {trans.privacy.gdpr.title}
      </Typography>
      <p>{trans.privacy.gdpr.paragraph1}</p>
      <ul>
        <li>{trans.privacy.gdpr.list.element1}</li>
        <li>{trans.privacy.gdpr.list.element2}</li>
        <li>{trans.privacy.gdpr.list.element3}</li>
        <li>{trans.privacy.gdpr.list.element4}</li>
        <li>{trans.privacy.gdpr.list.element5}</li>
        <li>{trans.privacy.gdpr.list.element6}</li>
      </ul>
      <p>{trans.privacy.gdpr.paragraph2}</p>
      <Typography size="xl" weight="medium">
        {trans.privacy.childrenPrivacy.title}
      </Typography>
      <p>{trans.privacy.childrenPrivacy.paragraph1}</p>
      <Typography size="xl" weight="medium">
        {trans.privacy.changesToPolicy.title}
      </Typography>
      <p>{trans.privacy.changesToPolicy.paragraph1}</p>
      <Typography size="xl" weight="medium">
        {trans.privacy.contactUs.title}
      </Typography>
      <p>{trans.privacy.contactUs.paragraph1}</p>
      <ul>
        <li>{trans.privacy.contactUs.list.element1}</li>
        <li>{trans.privacy.contactUs.list.element2}</li>
      </ul>
      <p>{trans.privacy.contactUs.paragraph2}</p>
      <p>{trans.privacy.contactUs.paragraph3}</p>
    </ColumnPage>
  );
}

'use client';

import { Translations } from '@/locales/translation';
import useCookie from 'react-use-cookie';
import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button, Typography } from 'gtomy-lib';
import { authorize } from '@/lib/actions/authorize';
import { Footer } from '@/components/Footer';
import { parseAuthorizeData } from '@/lib/aurthorizeUtils';
import Fuse from 'fuse.js';

enum VerifiedStatus {
  NO_DATA,
  VERIFIED,
  NOT_VERIFIED,
}

interface VerifiedApp {
  name: string;
  url: string;
}

// TODO: Move to config file
const VERIFIED_APPS: VerifiedApp[] = [
  {
    name: 'authapex',
    url: 'https://id.authapex.net',
  },
  {
    name: 'gtomy',
    url: 'https://gtomy.net',
  },
  {
    name: 'mythranel',
    url: 'https://mythranel.net',
  },
  {
    name: 'prvni-sobota',
    url: 'https://prvni-sobota.cz',
  },
  {
    name: 'galleryeet',
    url: 'https://galleryeet.net',
  },
];

const fuse = new Fuse(VERIFIED_APPS, {
  keys: ['name'],
  threshold: 0.2,
  ignoreDiacritics: true,
});

function getVerifiedStatus(appName: string, url: string): VerifiedStatus {
  const verifiedApp = VERIFIED_APPS.find((app) => app.name === appName);
  if (!verifiedApp) {
    const results = fuse.search(appName).map((result) => result.item);
    if (results.length > 0) {
      return VerifiedStatus.NOT_VERIFIED;
    }
    return VerifiedStatus.NO_DATA;
  }
  return url === verifiedApp.url ? VerifiedStatus.VERIFIED : VerifiedStatus.NOT_VERIFIED;
}

export interface AuthorizeCardProps {
  lang: string;
  trans: Translations;
  isAuth: boolean;
}

export function AuthorizeCard({ isAuth, trans, lang }: AuthorizeCardProps) {
  const router = useRouter();
  const [rawAuthorizeData, setRawAuthorizeData, removeRawAuthorizeData] = useCookie('authorize-data', undefined);
  const searchParams = useSearchParams();

  const authorizeData = parseAuthorizeData(rawAuthorizeData);

  useEffect(() => {
    const appData = searchParams.get('appData');
    if (appData) {
      setRawAuthorizeData(appData, {
        days: 1,
      });
      if (!isAuth) {
        router.replace('./signin');
      }
      router.replace('./authorize');
    } else {
      if (!rawAuthorizeData) {
        router.push('./');
      } else if (!isAuth) {
        router.push('./signin');
      }
    }
  }, [isAuth, rawAuthorizeData, router, searchParams, setRawAuthorizeData]);

  const cancelAuthorize = () => {
    removeRawAuthorizeData();
    router.push('./');
  };

  if (!isAuth || !authorizeData) {
    return null;
  }

  const redirectUrlOrigin = new URL(authorizeData.redirectUrl).origin;
  const verifiedStatus = getVerifiedStatus(authorizeData.app, redirectUrlOrigin);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-center items-center gap-4">
        <Image src="/favicon.ico" className="shrink-0 rounded" alt="Application icon" width={32} height={32} />
        <Typography as="h1" size="lg" weight="bold">
          {trans.title}
        </Typography>
      </div>
      <div className="card md:bg-neutral text-neutral-content w-sm max-w-screen">
        <div className="card-body flex flex-col">
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
              <Typography as="h2" size="xl" weight="bold" className="text-center">
                {trans.authorize.title}
              </Typography>
              <Typography className="text-center">{trans.authorize.subtitle}</Typography>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Typography>{trans.authorize.appName}</Typography>
              <Typography className="flex items-center gap-2 flex-wrap">
                {authorizeData.app}
                {verifiedStatus === VerifiedStatus.VERIFIED && (
                  <div className="tooltip tooltip-success" data-tip={trans.authorize.verifiedTooltip}>
                    <div className="badge badge-success badge-sm">{trans.authorize.verified}</div>
                  </div>
                )}
                {verifiedStatus === VerifiedStatus.NOT_VERIFIED && (
                  <div className="tooltip tooltip-error" data-tip={trans.authorize.notVerifiedTooltip}>
                    <div className="badge badge-error badge-sm">{trans.authorize.notVerified}</div>
                  </div>
                )}
              </Typography>
              <Typography>{trans.authorize.appUrl}</Typography>
              <Typography>{redirectUrlOrigin}</Typography>
            </div>
            <div className="flex flex-col gap-2 mt-4">
              <Button color="primary" onClick={() => authorize(lang)}>
                {trans.authorize.button}
              </Button>
              <Button color="neutral" onClick={cancelAuthorize}>
                {trans.authorize.cancelButton}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Footer lang={lang} trans={trans} />
    </div>
  );
}

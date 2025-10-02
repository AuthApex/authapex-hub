'use client';

import { Translations } from '@/locales/translation';
import useCookie from 'react-use-cookie';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Typography } from 'gtomy-lib';
import { authorize } from '@/lib/actions/authorize';
import Fuse from 'fuse.js';
import { AUTHORIZATION_SERVICE, VERIFIED_APPS, VerifiedStatus, VerifiedStatusResponse } from '@/lib/consts';

const fuse = new Fuse(VERIFIED_APPS, {
  keys: ['name'],
  threshold: 0.2,
  ignoreDiacritics: true,
});

function getVerifiedStatus(appName: string, url: string): VerifiedStatusResponse {
  const verifiedApp = VERIFIED_APPS.find((app) => app.name === appName);
  if (!verifiedApp) {
    const results = fuse.search(appName).map((result) => result.item);
    if (results.length > 0) {
      return {
        status: VerifiedStatus.NOT_VERIFIED,
      };
    }
    return {
      status: VerifiedStatus.NO_DATA,
    };
  }
  return url === verifiedApp.url
    ? { status: VerifiedStatus.VERIFIED, displayName: verifiedApp.displayName }
    : {
        status: VerifiedStatus.NOT_VERIFIED,
      };
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
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const authorizeData = AUTHORIZATION_SERVICE.decodeAuthorizeData(rawAuthorizeData);

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

  const onAuthorize = async () => {
    setIsLoading(true);
    await authorize(lang);
    setIsLoading(false);
  };

  const cancelAuthorize = () => {
    removeRawAuthorizeData();
    router.push('./');
  };

  if (!isAuth || !authorizeData) {
    return null;
  }

  const redirectUrlOrigin = new URL(authorizeData.redirectUrl).origin;
  const { status: verifiedStatus, displayName: verifiedDisplayName } = getVerifiedStatus(
    authorizeData.app,
    redirectUrlOrigin
  );

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Typography>{verifiedDisplayName ?? trans.authorize.appName}</Typography>
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
        <Button color="primary" onClick={onAuthorize} disabled={isLoading}>
          {trans.authorize.button}
        </Button>
        <Button color="neutral" onClick={cancelAuthorize} disabled={isLoading}>
          {trans.authorize.cancelButton}
        </Button>
      </div>
    </>
  );
}

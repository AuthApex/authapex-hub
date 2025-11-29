'use client';

import { Translations } from '@/locales/translation';
import useCookie from 'react-use-cookie';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, LoadingState, Typography } from 'gtomy-lib';
import { authorize } from '@/lib/actions/authorize';
import Fuse from 'fuse.js';
import { AUTHORIZATION_SERVICE } from '@/lib/consts';

enum VerifiedStatus {
  NO_DATA,
  VERIFIED,
  NOT_VERIFIED,
}

interface VerifiedStatusResponse {
  status: VerifiedStatus;
  displayName?: string;
}

export interface AuthorizeCardProps {
  lang: string;
  trans: Translations;
  isAuth: boolean;
  authorizedApps: { name: string; displayName: string; url: string }[];
  userAppSessions: { app: string; userId: string; displayName?: string; url?: string; verified: boolean | null }[];
}

export function AuthorizeCard({ isAuth, trans, lang, authorizedApps, userAppSessions }: AuthorizeCardProps) {
  const router = useRouter();
  const [rawAuthorizeData, setRawAuthorizeData, removeRawAuthorizeData] = useCookie('authorize-data', undefined);
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const authorizeData = AUTHORIZATION_SERVICE.decodeAuthorizeData(rawAuthorizeData);

  const fuse = useMemo(
    () =>
      new Fuse(authorizedApps, {
        keys: ['name'],
        threshold: 0.2,
        ignoreDiacritics: true,
      }),
    [authorizedApps]
  );

  const getVerifiedStatus = useCallback(
    (appName: string, url: string): VerifiedStatusResponse => {
      const verifiedApp = authorizedApps.find((app) => app.name === appName);
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
    },
    [authorizedApps, fuse]
  );

  const isAppAlreadyAuthorized = useCallback(
    (appName: string): boolean => {
      return userAppSessions.some((session) => session.app === appName && session.verified === true);
    },
    [userAppSessions]
  );

  const onAuthorize = useCallback(async () => {
    setIsLoading(true);
    await authorize(lang);
    setIsLoading(false);
  }, [lang]);

  const cancelAuthorize = useCallback(() => {
    const redirectUrlOrigin = authorizeData == null ? null : new URL(authorizeData.redirectUrl).origin;
    removeRawAuthorizeData();
    if (redirectUrlOrigin) {
      window.location.href = redirectUrlOrigin;
    } else {
      router.push('./');
    }
  }, [authorizeData, removeRawAuthorizeData, router]);

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
      } else if (authorizeData != null) {
        const redirectUrlOrigin = new URL(authorizeData.redirectUrl).origin;
        const { status } = getVerifiedStatus(authorizeData.app, redirectUrlOrigin);
        const appAlreadyAuthorized = isAppAlreadyAuthorized(authorizeData.app);
        if (status === VerifiedStatus.VERIFIED && appAlreadyAuthorized) {
          onAuthorize();
        }
      }
    }
  }, [
    authorizeData,
    getVerifiedStatus,
    isAppAlreadyAuthorized,
    isAuth,
    onAuthorize,
    rawAuthorizeData,
    router,
    searchParams,
    setRawAuthorizeData,
  ]);

  if (!isAuth || !authorizeData) {
    return <LoadingState />;
  }

  const redirectUrlOrigin = new URL(authorizeData.redirectUrl).origin;
  const { status: verifiedStatus, displayName: verifiedDisplayName } = getVerifiedStatus(
    authorizeData.app,
    redirectUrlOrigin
  );
  const appAlreadyAuthorized = isAppAlreadyAuthorized(authorizeData.app);

  if (verifiedStatus === VerifiedStatus.VERIFIED && appAlreadyAuthorized) {
    return <LoadingState />;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Typography>{trans.authorize.appName}</Typography>
        <Typography className="flex items-center gap-2 flex-wrap">
          {verifiedDisplayName ?? authorizeData.app}
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

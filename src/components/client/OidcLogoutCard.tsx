'use client';

import { useCallback, useState } from 'react';
import { Button, Typography } from 'gtomy-lib';
import { Translations } from '@/locales/translation';
import { cancelOidcLogout, confirmOidcLogout } from '@/lib/actions/oidc';

export interface OidcLogoutCardProps {
  lang: string;
  trans: Translations;
  displayName: string | null;
}

export function OidcLogoutCard({ lang, trans, displayName }: OidcLogoutCardProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onConfirm = useCallback(async () => {
    setIsLoading(true);
    const result = await confirmOidcLogout(lang);
    window.location.href = result.redirectUrl;
  }, [lang]);

  const onCancel = useCallback(async () => {
    setIsLoading(true);
    const result = await cancelOidcLogout(lang);
    window.location.href = result.redirectUrl;
  }, [lang]);

  return (
    <>
      {displayName != null && (
        <div className="grid grid-cols-2 gap-4">
          <Typography>{trans.oidc.logout.requestedBy}</Typography>
          <Typography>{displayName}</Typography>
        </div>
      )}
      <div className="flex flex-col gap-2 mt-4">
        <Button color="primary" onClick={onConfirm} disabled={isLoading}>
          {trans.oidc.logout.button}
        </Button>
        <Button color="neutral" onClick={onCancel} disabled={isLoading}>
          {trans.oidc.logout.cancelButton}
        </Button>
      </div>
    </>
  );
}

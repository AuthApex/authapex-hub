'use client';

import { useCallback, useState } from 'react';
import { Button, Typography } from 'gtomy-lib';
import { Translations } from '@/locales/translation';
import { approveOidcAuthorization, denyOidcAuthorization } from '@/lib/actions/oidc';

export interface OidcConsentCardProps {
  lang: string;
  trans: Translations;
  displayName: string;
  redirectUrlOrigin: string;
  scopes: string[];
}

const SCOPE_KEYS: Record<string, keyof Translations['oidc']['consent']['scopes']> = {
  openid: 'openid',
  profile: 'profile',
  email: 'email',
  groups: 'groups',
  offline_access: 'offlineAccess',
};

export function OidcConsentCard({ lang, trans, displayName, redirectUrlOrigin, scopes }: OidcConsentCardProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onApprove = useCallback(async () => {
    setIsLoading(true);
    const result = await approveOidcAuthorization(lang);
    window.location.href = result.redirectUrl;
  }, [lang]);

  const onDeny = useCallback(async () => {
    setIsLoading(true);
    const result = await denyOidcAuthorization(lang);
    window.location.href = result.redirectUrl;
  }, [lang]);

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <Typography>{trans.oidc.consent.appName}</Typography>
        <Typography>{displayName}</Typography>
        {redirectUrlOrigin && (
          <>
            <Typography>{trans.oidc.consent.appUrl}</Typography>
            <Typography>{redirectUrlOrigin}</Typography>
          </>
        )}
      </div>
      <div className="flex flex-col gap-2 mt-4">
        <Typography weight="semibold">{trans.oidc.consent.permissions}</Typography>
        <ul className="list-disc list-inside flex flex-col gap-1">
          {scopes
            .filter((scope) => SCOPE_KEYS[scope] != null)
            .map((scope) => (
              <li key={scope} className="text-sm">
                {trans.oidc.consent.scopes[SCOPE_KEYS[scope]]}
              </li>
            ))}
        </ul>
      </div>
      <div className="flex flex-col gap-2 mt-4">
        <Button color="primary" onClick={onApprove} disabled={isLoading}>
          {trans.oidc.consent.button}
        </Button>
        <Button color="neutral" onClick={onDeny} disabled={isLoading}>
          {trans.oidc.consent.cancelButton}
        </Button>
      </div>
    </>
  );
}

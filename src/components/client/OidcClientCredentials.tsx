'use client';

import { Typography } from 'gtomy-lib';
import { Translations } from '@/locales/translation';
import { CopyTextButton } from '@/components/client/actionButtons/CopyTextButton';
import type { OidcClientCredentials as OidcClientCredentialsModel } from '@/lib/actions/admin';

export interface OidcClientCredentialsProps {
  trans: Translations;
  credentials: OidcClientCredentialsModel;
}

export function OidcClientCredentials({ trans, credentials }: OidcClientCredentialsProps) {
  return (
    <div className="flex flex-col gap-4">
      <div role="alert" className="alert alert-warning">
        <Typography size="sm">{trans.admin.oidcClients.secretShownOnce}</Typography>
      </div>
      <div className="flex flex-col gap-2">
        <Typography weight="semibold">{trans.admin.oidcClients.clientId}</Typography>
        <code className="break-all text-sm">{credentials.clientId}</code>
        <div>
          <CopyTextButton text={credentials.clientId} label={trans.admin.oidcClients.copyClientId} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Typography weight="semibold">{trans.admin.oidcClients.clientSecret}</Typography>
        <code className="break-all text-sm">{credentials.clientSecret}</code>
        <div>
          <CopyTextButton text={credentials.clientSecret} label={trans.admin.oidcClients.copyClientSecret} />
        </div>
      </div>
    </div>
  );
}

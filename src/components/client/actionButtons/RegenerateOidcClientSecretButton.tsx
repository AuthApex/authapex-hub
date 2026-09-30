'use client';

import { useState } from 'react';
import { Button } from 'gtomy-lib';
import { Translations } from '@/locales/translation';
import {
  OidcClientCredentials as OidcClientCredentialsModel,
  regenerateOidcClientSecretAction,
} from '@/lib/actions/admin';
import { OidcClientCredentials } from '@/components/client/OidcClientCredentials';

export function RegenerateOidcClientSecretButton({ clientId, trans }: { clientId: string; trans: Translations }) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [credentials, setCredentials] = useState<OidcClientCredentialsModel | null>(null);

  const onRegenerate = async () => {
    if (!window.confirm(trans.admin.oidcClients.regenerateSecretConfirm)) {
      return;
    }
    setIsLoading(true);
    const result = await regenerateOidcClientSecretAction(clientId);
    if (result.success && result.credentials) {
      setCredentials(result.credentials);
    }
    setIsLoading(false);
  };

  if (credentials) {
    return (
      <div className="w-sm max-w-full">
        <OidcClientCredentials trans={trans} credentials={credentials} />
      </div>
    );
  }

  return (
    <Button size="sm" color="warning" onClick={onRegenerate} disabled={isLoading}>
      {trans.admin.oidcClients.regenerateSecret}
    </Button>
  );
}

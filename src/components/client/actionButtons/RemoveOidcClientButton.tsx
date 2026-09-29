'use client';

import { removeOidcClient } from '@/lib/actions/admin';
import { Button } from 'gtomy-lib';
import { Translations } from '@/locales/translation';
import { useRouter } from 'next/navigation';

export function RemoveOidcClientButton({ clientId, trans }: { clientId: string; trans: Translations }) {
  const router = useRouter();

  const onRemove = async () => {
    const result = await removeOidcClient(clientId);
    if (result.success) {
      router.refresh();
    }
  };

  return (
    <Button size="sm" color="error" onClick={onRemove}>
      {trans.admin.oidcClients.remove}
    </Button>
  );
}

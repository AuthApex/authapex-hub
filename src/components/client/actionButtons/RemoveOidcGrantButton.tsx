'use client';

import { removeOidcApp } from '@/lib/actions/profileUpdates';
import { Button } from 'gtomy-lib';
import { useRouter } from 'next/navigation';
import { Translations } from '@/locales/translation';

export function RemoveOidcGrantButton({ clientId, trans }: { clientId: string; trans: Translations }) {
  const router = useRouter();

  const onRemove = async () => {
    await removeOidcApp(clientId);
    router.refresh();
  };

  return (
    <Button onClick={onRemove} size="sm" color="error">
      {trans.sessions.remove}
    </Button>
  );
}

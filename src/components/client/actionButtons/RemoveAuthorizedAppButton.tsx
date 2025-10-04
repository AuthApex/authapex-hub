'use client';

import { removeAuthorizedApp } from '@/lib/actions/admin';
import { Button } from 'gtomy-lib';
import { Translations } from '@/locales/translation';
import { useRouter } from 'next/navigation';

export function RemoveAuthorizedAppButton({ app, trans }: { app: string; trans: Translations }) {
  const router = useRouter();

  const onRemove = async () => {
    const result = await removeAuthorizedApp(app);
    if (result.success) {
      router.refresh();
    }
  };

  return (
    <Button size="sm" color="error" onClick={onRemove}>
      {trans.admin.authorizedApps.remove}
    </Button>
  );
}

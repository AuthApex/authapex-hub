'use client';

import { removeActiveSession } from '@/lib/actions/profileUpdates';
import { Button } from 'gtomy-lib';
import { useRouter } from 'next/navigation';
import { Translations } from '@/locales/translation';

export function RemoveUserSessionButton({
  trans,
  session,
}: {
  trans: Translations;
  session: { app: string; verified: boolean | null };
}) {
  const router = useRouter();

  const onRemove = async () => {
    await removeActiveSession(session.app, session.verified);
    router.refresh();
  };

  return (
    <Button onClick={onRemove} size="sm" color="error">
      {trans.sessions.remove}
    </Button>
  );
}

'use client';

import { Button, DialogElement, useDialog } from 'gtomy-lib';
import { Translations } from '@/locales/translation';
import { useRouter } from 'next/navigation';
import { PlusIcon } from '@heroicons/react/24/outline';
import { AddOidcClientDialog } from '@/components/client/dialogs/AddOidcClientDialog';

export interface AddOidcClientButtonProps {
  trans: Translations;
}

export function AddOidcClientButton({ trans }: AddOidcClientButtonProps) {
  const router = useRouter();
  const { dialogElementProps, openDialog } = useDialog(({ onOpenChange, ...props }) => (
    <AddOidcClientDialog
      trans={trans}
      onOpenChange={(open) => {
        if (!open) {
          router.refresh();
        }
        onOpenChange?.(open);
      }}
      {...props}
    />
  ));

  return (
    <>
      <DialogElement {...dialogElementProps} />
      <Button startIcon={PlusIcon} color="primary" onClick={openDialog}>
        {trans.admin.oidcClients.addNewClient}
      </Button>
    </>
  );
}

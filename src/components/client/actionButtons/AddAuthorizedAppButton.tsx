'use client';

import { Button, DialogElement, useDialog } from 'gtomy-lib';
import { Translations } from '@/locales/translation';
import { useRouter } from 'next/navigation';
import { PlusIcon } from '@heroicons/react/24/outline';
import { AddAuthorizedAppDialog } from '@/components/client/dialogs/AddAuthorizedAppDialog';

export interface AddAuthorizedAppButtonProps {
  trans: Translations;
}

export function AddAuthorizedAppButton({ trans }: AddAuthorizedAppButtonProps) {
  const router = useRouter();
  const { dialogElementProps, openDialog } = useDialog(({ onOpenChange, ...props }) => (
    <AddAuthorizedAppDialog
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
        {trans.admin.authorizedApps.addNewApp}
      </Button>
    </>
  );
}

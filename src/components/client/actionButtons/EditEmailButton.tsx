'use client';

import { Button, DialogElement, useDialog } from 'gtomy-lib';
import { Translations } from '@/locales/translation';
import { User } from '@authapex/core';
import { EditEmailDialog } from '@/components/client/dialogs/EditEmailDialog';
import { useRouter } from 'next/navigation';
import { PencilIcon } from '@heroicons/react/24/outline';

export interface EditEmailButtonProps {
  trans: Translations;
  user: User;
}

export function EditEmailButton({ trans, user }: EditEmailButtonProps) {
  const router = useRouter();
  const { dialogElementProps, openDialog } = useDialog(({ onOpenChange, ...props }) => (
    <EditEmailDialog
      trans={trans}
      user={user}
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
      <Button startIcon={PencilIcon} color="secondary" onClick={openDialog}>
        {trans.home.editEmail}
      </Button>
    </>
  );
}

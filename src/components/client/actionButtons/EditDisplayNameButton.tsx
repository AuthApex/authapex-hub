'use client';

import { Button, DialogElement, useDialog } from 'gtomy-lib';
import { Translations } from '@/locales/translation';
import { User } from '@authapex/core';
import { EditDisplayNameDialog } from '@/components/client/dialogs/EditDisplayNameDialog';
import { useRouter } from 'next/navigation';
import { PencilIcon } from '@heroicons/react/24/outline';

export interface EditDisplayNameButtonProps {
  trans: Translations;
  user: User;
}

export function EditDisplayNameButton({ trans, user }: EditDisplayNameButtonProps) {
  const router = useRouter();
  const { dialogElementProps, openDialog } = useDialog(({ onOpenChange, ...props }) => (
    <EditDisplayNameDialog
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
        {trans.home.editDisplayName}
      </Button>
    </>
  );
}

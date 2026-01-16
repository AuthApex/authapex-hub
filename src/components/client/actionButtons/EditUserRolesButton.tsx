'use client';

import { Button, DialogElement, useDialog } from 'gtomy-lib';
import { Translations } from '@/locales/translation';
import { User } from '@authapex/core';
import { EditUserRolesDialog } from '@/components/client/dialogs/EditUserRolesDialog';
import { useRouter } from 'next/navigation';
import { PencilIcon } from '@heroicons/react/24/outline';

export interface EditUserRolesButtonProps {
  trans: Translations;
  user: User;
  verifiedApps: { name: string; displayName: string; url: string }[];
}

export function EditUserRolesButton({ trans, user, verifiedApps }: EditUserRolesButtonProps) {
  const router = useRouter();
  const { dialogElementProps, openDialog } = useDialog(({ onOpenChange, ...props }) => (
    <EditUserRolesDialog
      trans={trans}
      user={user}
      verifiedApps={verifiedApps}
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
      <Button startIcon={PencilIcon} onClick={openDialog}>
        {trans.admin.users.editUserRoles}
      </Button>
    </>
  );
}

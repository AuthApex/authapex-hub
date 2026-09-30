'use client';

import { BaseDialog, BaseDialogProps, Button, TextInput, Typography } from 'gtomy-lib';
import { User } from '@authapex/core';
import { Translations } from '@/locales/translation';
import { updateEmail } from '@/lib/actions/profileUpdates';
import { useState } from 'react';
import { getErrorMessageForName, ValidationResult } from '@/lib/validations';
import { PencilIcon } from '@heroicons/react/24/outline';

export interface EditEmailDialogProps extends BaseDialogProps {
  user: User;
  trans: Translations;
}

export function EditEmailDialog({ user, trans, ...props }: EditEmailDialogProps) {
  const [errors, setErrors] = useState<ValidationResult['errors']>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async (formData: FormData) => {
    setIsLoading(true);
    const result = await updateEmail(formData);
    if (result.success) {
      props.onOpenChange?.(false);
    } else {
      setErrors(result.errors);
    }
    setIsLoading(false);
  };

  return (
    <BaseDialog title={trans.home.editEmail} maxWidth="sm" {...props}>
      <Typography size="2xl" weight="semibold">
        {trans.home.editEmail}
      </Typography>
      <form className="flex flex-col gap-4" action={onSubmit}>
        <TextInput
          label={trans.home.email}
          name="email"
          defaultValue={user.email}
          error={getErrorMessageForName('email', errors)}
        />
        <div>
          <Button color="secondary" startIcon={PencilIcon} className="mt-4" type="submit" disabled={isLoading}>
            {trans.home.save}
          </Button>
        </div>
      </form>
    </BaseDialog>
  );
}

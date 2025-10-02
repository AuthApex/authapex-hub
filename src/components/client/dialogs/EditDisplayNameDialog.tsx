'use client';

import { BaseDialog, BaseDialogProps, Button, TextInput, Typography } from 'gtomy-lib';
import { User } from '@authapex/core';
import { Translations } from '@/locales/translation';
import { updateDisplayName } from '@/lib/actions/profileUpdates';
import { useState } from 'react';
import { getErrorMessageForName, ValidationResult } from '@/lib/validations';

export interface EditDisplayNameDialogProps extends BaseDialogProps {
  user: User;
  trans: Translations;
}

export function EditDisplayNameDialog({ user, trans, ...props }: EditDisplayNameDialogProps) {
  const [errors, setErrors] = useState<ValidationResult['errors']>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async (formData: FormData) => {
    setIsLoading(true);
    const result = await updateDisplayName(formData);
    if (result.success) {
      props.onOpenChange?.(false);
    } else {
      setErrors(result.errors);
    }
    setIsLoading(false);
  };

  return (
    <BaseDialog title={trans.home.editDisplayName} maxWidth="sm" {...props}>
      <Typography size="2xl" weight="semibold">
        {trans.home.editDisplayName}
      </Typography>
      <form className="flex flex-col gap-4" action={onSubmit}>
        <TextInput
          label={trans.home.displayName}
          name="displayName"
          defaultValue={user.displayName}
          error={getErrorMessageForName('displayName', errors)}
        />
        <div>
          <Button color="primary" className="mt-4" type="submit" disabled={isLoading}>
            {trans.home.save}
          </Button>
        </div>
      </form>
    </BaseDialog>
  );
}

'use client';

import { BaseDialog, BaseDialogProps, Button, TextInput, Typography } from 'gtomy-lib';
import { Translations } from '@/locales/translation';
import { useState } from 'react';
import { getErrorMessageForName, ValidationResult } from '@/lib/validations';
import { createNewAuthorizedApp } from '@/lib/actions/admin';

export interface AddAuthorizedAppDialogProps extends BaseDialogProps {
  trans: Translations;
}

export function AddAuthorizedAppDialog({ trans, ...props }: AddAuthorizedAppDialogProps) {
  const [errors, setErrors] = useState<ValidationResult['errors']>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async (formData: FormData) => {
    setIsLoading(true);
    const result = await createNewAuthorizedApp(formData);
    if (result.success) {
      props.onOpenChange?.(false);
    } else {
      setErrors(result.errors);
    }
    setIsLoading(false);
  };

  return (
    <BaseDialog title={trans.admin.authorizedApps.addNewApp} maxWidth="sm" {...props}>
      <Typography size="2xl" weight="semibold">
        {trans.admin.authorizedApps.addNewApp}
      </Typography>
      <form className="flex flex-col gap-4" action={onSubmit}>
        <TextInput label={trans.admin.authorizedApps.name} name="name" error={getErrorMessageForName('name', errors)} />
        <TextInput
          label={trans.admin.authorizedApps.displayName}
          name="displayName"
          error={getErrorMessageForName('displayName', errors)}
        />
        <TextInput label={trans.admin.authorizedApps.url} name="url" error={getErrorMessageForName('url', errors)} />
        <TextInput
          label={trans.admin.authorizedApps.websocketEndpoint}
          name="websocketEndpoint"
          error={getErrorMessageForName('websocketEndpoint', errors)}
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

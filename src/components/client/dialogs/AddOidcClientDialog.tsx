'use client';

import { BaseDialog, BaseDialogProps, Button, TextareaInput, TextInput, Typography } from 'gtomy-lib';
import { Translations } from '@/locales/translation';
import { useState } from 'react';
import { getErrorMessageForName, ValidationResult } from '@/lib/validations';
import { createNewOidcClient } from '@/lib/actions/admin';

export interface AddOidcClientDialogProps extends BaseDialogProps {
  trans: Translations;
}

export function AddOidcClientDialog({ trans, ...props }: AddOidcClientDialogProps) {
  const [errors, setErrors] = useState<ValidationResult['errors']>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const onSubmit = async (formData: FormData) => {
    setIsLoading(true);
    const result = await createNewOidcClient(formData);
    if (result.success) {
      props.onOpenChange?.(false);
    } else {
      setErrors(result.errors);
    }
    setIsLoading(false);
  };

  return (
    <BaseDialog title={trans.admin.oidcClients.addNewClient} maxWidth="sm" {...props}>
      <Typography size="2xl" weight="semibold">
        {trans.admin.oidcClients.addNewClient}
      </Typography>
      <form className="flex flex-col gap-4" action={onSubmit}>
        <TextInput
          label={trans.admin.oidcClients.displayName}
          name="displayName"
          error={getErrorMessageForName('displayName', errors)}
        />
        <TextareaInput
          label={trans.admin.oidcClients.redirectUris}
          hint={trans.admin.oidcClients.redirectUrisHint}
          name="redirectUris"
          rows={3}
          error={getErrorMessageForName('redirectUris', errors)}
        />
        <TextInput
          label={trans.admin.oidcClients.scopes}
          hint={trans.admin.oidcClients.scopesHint}
          name="scopes"
          defaultValue="openid profile email"
          error={getErrorMessageForName('scopes', errors)}
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

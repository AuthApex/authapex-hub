'use client';

import { Button, TextInput } from 'gtomy-lib';
import { signin } from '@/lib/actions/auth';
import { useState, useTransition } from 'react';
import { getErrorMessageForName, ValidationResult } from '@/lib/validations';
import { Translations } from '@/locales/translation';

export interface LoginFormProps {
  trans: Translations;
  flow?: string | null;
}

export function LoginForm({ trans, flow }: LoginFormProps) {
  const [, startTransition] = useTransition();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationResult['errors']>([]);
  const generalError = getErrorMessageForName('general', errors);

  const onSubmit = async (formData: FormData) => {
    setIsLoading(true);
    startTransition(async () => {
      const result = await signin(formData);
      if (!result.success) {
        setErrors(result.errors);
      }
      setIsLoading(false);
    });
  };
  return (
    <form action={onSubmit} className="flex flex-col gap-2">
      {flow && <input type="hidden" name="flow" value={flow} />}
      <TextInput
        label="Email"
        name="email"
        placeholder="mail@example.com"
        type="email"
        error={getErrorMessageForName('email', errors)}
      />
      <TextInput
        label={trans.signin.password}
        name="password"
        type="password"
        placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
        error={getErrorMessageForName('password', errors)}
      />
      <div className="mt-4 flex flex-col gap-2">
        {generalError && <div className="alert alert-error">{generalError}</div>}
        <Button color="primary" type="submit" disabled={isLoading}>
          {trans.signin.button}
        </Button>
      </div>
    </form>
  );
}

'use client';

import { Button, TextInput } from 'gtomy-lib';
import { signup } from '@/lib/actions/auth';
import { useState } from 'react';
import { getErrorMessageForName, ValidationResult } from '@/lib/validations';
import { Translations } from '@/locales/translation';

export interface RegisterFormProps {
  trans: Translations;
}

export function RegisterForm({ trans }: RegisterFormProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationResult['errors']>([]);
  const generalError = getErrorMessageForName('general', errors);

  const onSubmit = async (formData: FormData) => {
    setIsLoading(true);
    const result = await signup(formData);
    if (!result.success) {
      setErrors(result.errors);
    }
    setIsLoading(false);
  };
  return (
    <form action={onSubmit} className="flex flex-col gap-2">
      <TextInput
        label={trans.signup.name}
        name="username"
        placeholder={trans.signup.namePlaceholder}
        error={getErrorMessageForName('username', errors)}
      />
      <TextInput
        label="Email"
        name="email"
        placeholder="mail@example.com"
        type="email"
        error={getErrorMessageForName('email', errors)}
      />
      <TextInput
        label={trans.signup.password}
        name="password"
        type="password"
        placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
        error={getErrorMessageForName('password', errors)}
      />
      <TextInput
        label={trans.signup.repeatPassword}
        name="confirmPassword"
        type="password"
        placeholder="&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;&#9679;"
        error={getErrorMessageForName('confirmPassword', errors)}
      />
      <div className="mt-4 flex flex-col gap-2">
        {generalError && <div className="alert alert-error">{generalError}</div>}
        <Button color="primary" type="submit" disabled={isLoading}>
          {trans.signup.button}
        </Button>
      </div>
    </form>
  );
}

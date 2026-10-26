import { AnyObjectSchema, ValidationError } from 'yup';
import { describe, expect, it } from 'vitest';
import {
  adminAddNewAppSchema,
  adminAddOidcClientSchema,
  adminEditUserRoles,
  getErrorMessageForName,
  mapValidationErrorToValidationResult,
  signinSchema,
  signupSchema,
  updateDisplayNameSchema,
  updateEmailSchema,
  ValidationResult,
} from './validations';

async function validate(schema: AnyObjectSchema, value: unknown): Promise<ValidationResult> {
  try {
    await schema.validate(value, { abortEarly: false });
    return { success: true, errors: [] };
  } catch (error) {
    return mapValidationErrorToValidationResult(error as ValidationError);
  }
}

describe('getErrorMessageForName', () => {
  const errors = [
    { path: 'email', message: 'Email error' },
    { path: 'password', message: 'Password error' },
    { path: 'email', message: 'Second email error' },
  ];

  it('returns the first message for the requested field', () => {
    expect(getErrorMessageForName('email', errors)).toBe('Email error');
    expect(getErrorMessageForName('password', errors)).toBe('Password error');
  });

  it('returns undefined for an unknown field', () => {
    expect(getErrorMessageForName('username', errors)).toBeUndefined();
  });
});

describe('mapValidationErrorToValidationResult', () => {
  it('maps all inner errors to a failed result', async () => {
    const result = await validate(signinSchema, { email: '', password: '' });

    expect(result.success).toBe(false);
    expect(result.errors).toEqual([
      { path: 'email', message: 'Toto pole je vyžadované' },
      { path: 'password', message: 'Toto pole je vyžadované' },
    ]);
  });
});

describe('signinSchema', () => {
  it('accepts a valid email and password', async () => {
    await expect(validate(signinSchema, { email: 'user@example.com', password: 'secret' })).resolves.toEqual({
      success: true,
      errors: [],
    });
  });

  it('rejects an invalid email', async () => {
    const result = await validate(signinSchema, { email: 'not-an-email', password: 'secret' });

    expect(result.success).toBe(false);
    expect(result.errors.map((error) => error.path)).toEqual(['email']);
  });
});

describe('signupSchema', () => {
  it('accepts matching passwords with at least 8 characters', async () => {
    await expect(
      validate(signupSchema, {
        username: 'john',
        email: 'john@example.com',
        password: 'password1',
        confirmPassword: 'password1',
      })
    ).resolves.toEqual({ success: true, errors: [] });
  });

  it('rejects mismatched passwords', async () => {
    const result = await validate(signupSchema, {
      username: 'john',
      email: 'john@example.com',
      password: 'password1',
      confirmPassword: 'password2',
    });

    expect(result.success).toBe(false);
    expect(getErrorMessageForName('confirmPassword', result.errors)).toBe('Hesla se musí shodovat');
  });

  it('rejects passwords shorter than 8 characters', async () => {
    const result = await validate(signupSchema, {
      username: 'john',
      email: 'john@example.com',
      password: 'short',
      confirmPassword: 'short',
    });

    expect(result.success).toBe(false);
    expect(getErrorMessageForName('password', result.errors)).toBe('Toto pole musí mít alespoň 8 znaků');
  });

  it('requires every field', async () => {
    const result = await validate(signupSchema, {});

    expect(result.success).toBe(false);
    expect(result.errors.map((error) => error.path)).toEqual(['username', 'email', 'password', 'confirmPassword']);
  });
});

describe('profile schemas', () => {
  it('requires a display name', async () => {
    const result = await validate(updateDisplayNameSchema, { displayName: '' });

    expect(result.success).toBe(false);
    expect(getErrorMessageForName('displayName', result.errors)).toBe('Toto pole je vyžadované');
  });

  it('requires an email', async () => {
    const result = await validate(updateEmailSchema, { email: '' });

    expect(result.success).toBe(false);
    expect(getErrorMessageForName('email', result.errors)).toBe('Toto pole je vyžadované');
  });
});

describe('adminNewAppSchema', () => {
  it('accepts a valid app', async () => {
    await expect(
      validate(adminAddNewAppSchema, {
        name: 'gitea',
        displayName: 'Gitea',
        url: 'https://git.example.com',
      })
    ).resolves.toEqual({ success: true, errors: [] });
  });

  it('allows an empty websocket endpoint', async () => {
    await expect(
      validate(adminAddNewAppSchema, {
        name: 'gitea',
        displayName: 'Gitea',
        url: 'https://git.example.com',
        websocketEndpoint: null,
      })
    ).resolves.toEqual({ success: true, errors: [] });
  });

  it('requires the name, display name and URL', async () => {
    const result = await validate(adminAddNewAppSchema, {});

    expect(result.errors.map((error) => error.path)).toEqual(['name', 'displayName', 'url']);
  });
});

describe('adminAddOidcClientSchema', () => {
  it('accepts a client without scopes', async () => {
    await expect(
      validate(adminAddOidcClientSchema, {
        displayName: 'Gitea',
        redirectUris: 'https://git.example.com/callback',
      })
    ).resolves.toEqual({ success: true, errors: [] });
  });

  it('allows null scopes', async () => {
    await expect(
      validate(adminAddOidcClientSchema, {
        displayName: 'Gitea',
        redirectUris: 'https://git.example.com/callback',
        scopes: null,
      })
    ).resolves.toEqual({ success: true, errors: [] });
  });

  it('requires a display name and redirect URIs', async () => {
    const result = await validate(adminAddOidcClientSchema, {});

    expect(result.errors.map((error) => error.path)).toEqual(['displayName', 'redirectUris']);
  });
});

describe('adminEditUserRoles', () => {
  it('accepts a role list', async () => {
    await expect(
      validate(adminEditUserRoles, {
        roles: [{ application: 'gitea', role: 'admin', remove: false }],
      })
    ).resolves.toEqual({ success: true, errors: [] });
  });

  it('requires the application and role of every entry', async () => {
    const result = await validate(adminEditUserRoles, { roles: [{}] });

    expect(result.success).toBe(false);
    expect(result.errors.map((error) => error.path)).toEqual(['roles[0].application', 'roles[0].role']);
  });
});

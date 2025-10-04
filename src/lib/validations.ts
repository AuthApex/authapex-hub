import { array, boolean, object, string, ValidationError } from 'yup';

export interface ValidationResult {
  success: boolean;
  errors: { path?: string; message: string }[];
}

export function getErrorMessageForName(name: string, errors: ValidationResult['errors']) {
  return errors.find((error) => error.path === name)?.message;
}

export function mapValidationErrorToValidationResult(error: ValidationError): ValidationResult {
  return {
    success: false,
    errors: error.inner.map((e) => ({
      path: e.path,
      message: e.message,
    })),
  };
}

export const signinSchema = object({
  email: string().email().required('Toto pole je vyžadované'),
  password: string().required('Toto pole je vyžadované'),
});

export const signupSchema = object({
  username: string().required('Toto pole je vyžadované'),
  email: string().email('Toto pole musí být email').required('Toto pole je vyžadované'),
  password: string().min(8, 'Toto pole musí mít alespoň 8 znaků').required('Toto pole je vyžadované'),
  confirmPassword: string()
    .min(8, 'Toto pole musí mít alespoň 8 znaků')
    .required('Toto pole je vyžadované')
    .test('passwords-match', (confirmPassword, { createError, parent }) => {
      const password = parent.password;
      if (password == null || confirmPassword == null) {
        return true;
      }
      if (password.length < 8 || confirmPassword.length < 8) {
        return true;
      }
      if (password !== confirmPassword) {
        return createError({ message: 'Hesla se musí shodovat' });
      }
      return true;
    }),
});

export const updateDisplayNameSchema = object({
  displayName: string().required('Toto pole je vyžadované'),
});

export const adminAddNewAppSchema = object({
  name: string().required('Toto pole je vyžadované'),
  displayName: string().required('Toto pole je vyžadované'),
  url: string().required('Toto pole je vyžadované'),
  websocketEndpoint: string().nullable().optional(),
});

export const adminEditUserRoles = object({
  roles: array().of(
    object({
      application: string().required('Toto pole je vyžadované'),
      role: string().required('Toto pole je vyžadované'),
      remove: boolean(),
    })
  ),
});

import { object, string } from 'yup';

export const signinSchema = object({
  email: string().email().required(),
  password: string().required(),
});

export const signupSchema = object({
  username: string().required(),
  email: string().email().required(),
  password: string().min(8).required(),
  confirmPassword: string().min(8).required(),
}).test('passwords-match', ({ password, confirmPassword }, { createError }) => {
  if (password == null || confirmPassword == null) {
    return true;
  }
  if (password.length < 8 || confirmPassword.length < 8) {
    return true;
  }
  if (password !== confirmPassword) {
    // TODO: translation
    return createError({ message: 'Passwords must match' });
  }
  return true;
});

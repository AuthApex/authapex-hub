'use server';

import { mapValidationErrorToValidationResult, signinSchema, signupSchema, ValidationResult } from '@/lib/validations';
import { redirect } from 'next/navigation';
import { createSession, deleteSession, getRawSession } from '@/lib/server/session';
import { getAuthorizeData } from '@/lib/server/authorizeData';
import * as bcrypt from 'bcrypt';
import { CredentialResponse } from '@react-oauth/google';
import {
  createUser,
  getUserByEmail,
  getUserByGoogleId,
  getUserBySession,
  insertSession,
  invalidateSession,
  setProfileImageUrl,
} from '@/lib/server/mongodb';
import { getGoogleSessionFromToken } from '@/lib/server/googleClient';
import { User } from '@authapex/core';
import { notifyUserUpdate } from '@/lib/server/websockets';

export async function signinWithGoogle(credentials: CredentialResponse): Promise<void> {
  if (!credentials.credential) {
    return;
  }
  const googleSession = await getGoogleSessionFromToken({
    token: credentials.credential,
  });
  if (!googleSession) {
    return;
  }
  let user = await getUserByGoogleId(googleSession.googleId);
  if (!user) {
    user = await createUser({
      googleId: googleSession.googleId,
      username: googleSession.name,
      password: null,
      email: googleSession.email,
      emailVerified: !!googleSession.emailVerified,
      profileImageUrl: googleSession.profileImageUrl,
    });
    if (!user) {
      return;
    }
  } else {
    await setProfileImageUrl(user.userId, googleSession.profileImageUrl);
    await notifyUserUpdate(user);
  }
  const session = await createSession();
  await insertSession({
    sessionId: session.sessionId,
    userId: user.userId,
    expiresAt: session.expiresAt,
  });
  await handleAuthorizeRedirect();
}

export async function signin(formData: FormData): Promise<ValidationResult> {
  const values = await signinSchema
    .validate(
      {
        email: formData.get('email'),
        password: formData.get('password'),
      },
      {
        abortEarly: false,
      }
    )
    .catch(mapValidationErrorToValidationResult);

  if ('success' in values) {
    return values;
  }

  const user = await getUserByEmail(values.email);
  if (!user) {
    return {
      success: false,
      errors: [
        {
          path: 'general',
          message: 'Špatný email nebo heslo',
        },
      ],
    };
  }
  const isMatch = await bcrypt.compare(values.password, user.password);
  if (!isMatch) {
    return {
      success: false,
      errors: [
        {
          path: 'general',
          message: 'Špatný email nebo heslo',
        },
      ],
    };
  }
  const session = await createSession();

  const result = await insertSession({
    sessionId: session.sessionId,
    userId: user.userId,
    expiresAt: session.expiresAt,
  });
  if (result.success) {
    await handleAuthorizeRedirect();
    return { success: true, errors: [] };
  } else {
    return { success: false, errors: [] };
  }
}

export async function signup(formData: FormData): Promise<ValidationResult> {
  const values = await signupSchema
    .validate(
      {
        username: formData.get('username'),
        email: formData.get('email'),
        password: formData.get('password'),
        confirmPassword: formData.get('confirmPassword'),
      },
      {
        abortEarly: false,
      }
    )
    .catch(mapValidationErrorToValidationResult);

  if ('success' in values) {
    return values;
  }

  const salt = await bcrypt.genSalt();
  const hash = await bcrypt.hash(values.password, salt);
  const user = await createUser({
    username: values.username,
    email: values.email,
    password: hash,
    emailVerified: false,
  });

  if (!user) {
    return {
      success: false,
      errors: [
        {
          path: 'general',
          message: 'Toto uživatelské jméno nebo email již existuje',
        },
      ],
    };
  }

  const session = await createSession();
  const result = await insertSession({
    sessionId: session.sessionId,
    userId: user.userId,
    expiresAt: session.expiresAt,
  });

  if (result.success) {
    await handleAuthorizeRedirect();
    return { success: true, errors: [] };
  } else {
    return { success: false, errors: [] };
  }
}

export async function logout(): Promise<void> {
  const auth = await getAuth();
  if (auth.isAuth) {
    await invalidateSession({ sessionId: auth.sessionId });
  }
  await deleteSession();
  redirect('./signin');
}

type AuthResponse = AuthResponseLoggedOut | AuthResponseLoggedIn;

interface AuthResponseLoggedOut {
  isAuth: false;
  sessionId: null;
  expiresAt: null;
  user: null;
}

interface AuthResponseLoggedIn {
  isAuth: true;
  sessionId: string;
  expiresAt: Date;
  user: User;
}

export async function getAuth(): Promise<AuthResponse> {
  const session = await getRawSession();

  if (!session?.sessionId) {
    return { isAuth: false, sessionId: null, user: null, expiresAt: null };
  }

  const user = await getUserBySession(session.sessionId);
  if (!user) {
    return { isAuth: false, sessionId: null, user: null, expiresAt: null };
  }

  return {
    isAuth: true,
    sessionId: session.sessionId,
    expiresAt: new Date(session.expiresAt),
    user: {
      userId: user.userId,
      email: user.email,
      displayName: user.displayName,
      username: user.username,
      roles: user.roles,
      profileImageId: user.profileImageId,
      profileImageUrl: user.profileImageUrl,
    },
  };
}

// TODO: lang redirects dont seem to work
async function handleAuthorizeRedirect(): Promise<void> {
  const authorizeData = await getAuthorizeData();
  if (authorizeData) {
    redirect('../authorize');
  }

  redirect('../');
}

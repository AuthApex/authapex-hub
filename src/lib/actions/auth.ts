'use server';

import { signinSchema, signupSchema } from '@/lib/validations';
import { redirect } from 'next/navigation';
import { ValidationError } from 'yup';
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
} from '@/lib/server/mongodb';
import { getGoogleSessionFromToken } from '@/lib/server/googleClient';
import { User } from '@authapex/core';

const app = 'authapex-hub';

export async function signinWithGoogle(credentials: CredentialResponse) {
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
  }
  const session = await createSession();
  await insertSession({ sessionId: session.sessionId, userId: user.userId, expiresAt: session.expiresAt, app });
  await handleAuthorizeRedirect();
}

export async function signin(formData: FormData) {
  const values = await signinSchema
    .validate({
      email: formData.get('email'),
      password: formData.get('password'),
    })
    .catch((error) => {
      return {
        errors: (error as ValidationError).errors,
      };
    });

  if ('errors' in values) {
    console.log(values.errors);
    return;
  }
  const user = await getUserByEmail(values.email);
  if (!user) {
    console.log('user not found');
    return;
  }
  const isMatch = await bcrypt.compare(values.password, user.password);
  if (!isMatch) {
    console.log('password not match');
    return;
  }
  const session = await createSession();

  await insertSession({ sessionId: session.sessionId, userId: user.userId, expiresAt: session.expiresAt, app });
  await handleAuthorizeRedirect();
}

export async function signup(formData: FormData) {
  const values = await signupSchema
    .validate({
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password'),
      confirmPassword: formData.get('confirmPassword'),
    })
    .catch((error) => {
      return {
        errors: (error as ValidationError).errors,
      };
    });

  if ('errors' in values) {
    return;
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
    return;
  }

  const session = await createSession();
  await insertSession({ sessionId: session.sessionId, userId: user.userId, expiresAt: session.expiresAt, app });
  await handleAuthorizeRedirect();
}

export async function logout() {
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

  const user = await getUserBySession(session.sessionId, app);
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

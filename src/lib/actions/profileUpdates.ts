'use server';

import {
  mapValidationErrorToValidationResult,
  updateDisplayNameSchema,
  updateEmailSchema,
  ValidationResult,
} from '@/lib/validations';
import { getAuth } from '@/lib/actions/auth';
import { removeUserAppSession, setDisplayName, setEmail, setProfileImageId } from '@/lib/server/mongodb';
import { removeOidcGrant } from '@/lib/server/oidcMongodb';
import { notifySessionDelete, notifyUserUpdate } from '@/lib/server/websockets';

export async function updateDisplayName(formData: FormData): Promise<ValidationResult> {
  const values = await updateDisplayNameSchema
    .validate(
      {
        displayName: formData.get('displayName'),
      },
      {
        abortEarly: false,
      }
    )
    .catch(mapValidationErrorToValidationResult);

  if ('success' in values) {
    return values;
  }

  const auth = await getAuth();
  if (!auth.isAuth) {
    return { success: false, errors: [] };
  }

  const trimmedDisplayName = values.displayName.trim();
  if (auth.user.displayName === trimmedDisplayName) {
    return { success: true, errors: [] };
  }

  const result = await setDisplayName(auth.user.userId, trimmedDisplayName);
  if (result.success) {
    await notifyUserUpdate(auth.user);
    return { success: true, errors: [] };
  } else {
    return { success: false, errors: [] };
  }
}

export async function updateEmail(formData: FormData): Promise<ValidationResult> {
  const values = await updateEmailSchema
    .validate(
      {
        email: formData.get('email'),
      },
      {
        abortEarly: false,
      }
    )
    .catch(mapValidationErrorToValidationResult);

  if ('success' in values) {
    return values;
  }

  const auth = await getAuth();
  if (!auth.isAuth) {
    return { success: false, errors: [] };
  }

  const normalizedEmail = values.email.trim().toLowerCase();
  if (auth.user.email === normalizedEmail) {
    return { success: true, errors: [] };
  }

  const result = await setEmail(auth.user.userId, normalizedEmail);
  if (result.success) {
    await notifyUserUpdate(auth.user);
    return { success: true, errors: [] };
  } else {
    return { success: false, errors: [] };
  }
}

export async function removeProfileImage(): Promise<void> {
  const auth = await getAuth();
  if (!auth.isAuth) {
    return;
  }
  if (auth.user.profileImageId == null) {
    return;
  }

  await setProfileImageId(auth.user.userId, null);
  await notifyUserUpdate(auth.user);
}

export async function removeActiveSession(app: string, verified: boolean | null): Promise<void> {
  const auth = await getAuth();
  if (!auth.isAuth) {
    return;
  }
  await notifySessionDelete(auth.user.userId, app, verified);
  await removeUserAppSession(auth.user.userId, app, verified);
}

export async function removeOidcApp(clientId: string): Promise<void> {
  const auth = await getAuth();
  if (!auth.isAuth) {
    return;
  }
  await removeOidcGrant(clientId, auth.user.userId);
}

'use server';

import { mapValidationErrorToValidationResult, updateDisplayNameSchema, ValidationResult } from '@/lib/validations';
import { getAuth } from '@/lib/actions/auth';
import { removeUserAppSession, setDisplayName, setProfileImageId } from '@/lib/server/mongodb';
import { notifyUserUpdate } from '@/lib/server/websockets';

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
  await notifyUserUpdate(auth.user);
  if (result.success) {
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
  if (!auth.canChangeProfileImage) {
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
  await removeUserAppSession(auth.user.userId, app, verified);
}

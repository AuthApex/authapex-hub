'use server';

import {
  adminAddNewAppSchema,
  adminEditUserRoles,
  mapValidationErrorToValidationResult,
  ValidationResult,
} from '@/lib/validations';
import { addAuthorizedApp, deleteAuthorizedApp, setUserRoles } from '@/lib/server/mongodb';
import { getAuth } from '@/lib/actions/auth';
import { PERMISSION_SERVICE } from '@/lib/consts';
import { RoleModel } from '@authapex/core';

export async function createNewAuthorizedApp(formData: FormData): Promise<ValidationResult> {
  const auth = await getAuth();
  if (!auth.isAuth || !PERMISSION_SERVICE.hasPermission(auth.user, 'admin')) {
    return { success: false, errors: [] };
  }

  const values = await adminAddNewAppSchema
    .validate(
      {
        name: formData.get('name'),
        displayName: formData.get('displayName'),
        url: formData.get('url'),
      },
      {
        abortEarly: false,
      }
    )
    .catch(mapValidationErrorToValidationResult);

  if ('success' in values) {
    return values;
  }

  const result = await addAuthorizedApp(values.name, values.displayName, values.url);
  if (result.success) {
    return { success: true, errors: [] };
  } else {
    return { success: false, errors: [] };
  }
}

export async function removeAuthorizedApp(name: string): Promise<ValidationResult> {
  const auth = await getAuth();
  if (!auth.isAuth || !PERMISSION_SERVICE.hasPermission(auth.user, 'admin')) {
    return { success: false, errors: [] };
  }
  const result = await deleteAuthorizedApp(name);
  if (result.success) {
    return { success: true, errors: [] };
  } else {
    return { success: false, errors: [] };
  }
}

export async function updateUserRoles(userId: string, roles: RoleModel[]): Promise<ValidationResult> {
  const auth = await getAuth();
  if (!auth.isAuth || !PERMISSION_SERVICE.hasPermission(auth.user, 'admin')) {
    return { success: false, errors: [] };
  }
  const values = await adminEditUserRoles
    .validate(
      {
        roles: roles,
      },
      {
        abortEarly: false,
      }
    )
    .catch(mapValidationErrorToValidationResult);

  if ('success' in values) {
    return {
      success: false,
      errors: [
        {
          path: 'general',
          message: 'Nastala chyba ve validaci',
        },
      ],
    };
  }

  const result = await setUserRoles(userId, roles);
  if (result.success) {
    return { success: true, errors: [] };
  } else {
    return { success: false, errors: [] };
  }
}

'use server';

import {
  adminAddNewAppSchema,
  adminAddOidcClientSchema,
  adminEditUserRoles,
  mapValidationErrorToValidationResult,
  ValidationResult,
} from '@/lib/validations';
import { addAuthorizedApp, deleteAuthorizedApp, setUserRoles } from '@/lib/server/mongodb';
import { addOidcClient, deleteOidcClient, regenerateOidcClientSecret } from '@/lib/server/oidcMongodb';
import { isAllowedOidcRedirectUri } from '@/lib/server/oidc/redirectUri';
import { getAuth } from '@/lib/actions/auth';
import { PERMISSION_SERVICE } from '@/lib/consts';
import { RoleModel } from '@authapex/core';
import { notifyUserUpdate } from '@/lib/server/websockets';

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
        websocketEndpoint: formData.get('websocketEndpoint'),
      },
      {
        abortEarly: false,
      }
    )
    .catch(mapValidationErrorToValidationResult);

  if ('success' in values) {
    return values;
  }

  const result = await addAuthorizedApp(values.name, values.displayName, values.url, values.websocketEndpoint);
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

export interface OidcClientCredentials {
  clientId: string;
  clientSecret: string;
}

export interface OidcClientValidationResult extends ValidationResult {
  credentials?: OidcClientCredentials;
}

function parseUriList(value: string | null | undefined): string[] {
  return (value ?? '')
    .split(/\s+/)
    .map((uri) => uri.trim())
    .filter((uri) => uri.length > 0);
}

function getInvalidUriError(path: string, uris: string[]): ValidationResult['errors'][number] | null {
  const invalidUri = uris.find((uri) => !isAllowedOidcRedirectUri(uri));
  if (invalidUri == null) {
    return null;
  }
  return {
    path,
    message: `Neplatná URI ${invalidUri}: povoleno je https://, http:// pouze pro localhost a vlastní schéma aplikace s tečkou (např. app.example:/callback), bez #fragmentu`,
  };
}

export async function createNewOidcClient(formData: FormData): Promise<OidcClientValidationResult> {
  const auth = await getAuth();
  if (!auth.isAuth || !PERMISSION_SERVICE.hasPermission(auth.user, 'admin')) {
    return { success: false, errors: [] };
  }

  const values = await adminAddOidcClientSchema
    .validate(
      {
        displayName: formData.get('displayName'),
        redirectUris: formData.get('redirectUris'),
        scopes: formData.get('scopes'),
      },
      {
        abortEarly: false,
      }
    )
    .catch(mapValidationErrorToValidationResult);

  if ('success' in values) {
    return values;
  }

  const redirectUris = parseUriList(values.redirectUris);

  if (redirectUris.length === 0) {
    return {
      success: false,
      errors: [
        {
          path: 'redirectUris',
          message: 'Toto pole je vyžadované',
        },
      ],
    };
  }

  const uriErrors = [getInvalidUriError('redirectUris', redirectUris)].filter((error) => error != null);
  if (uriErrors.length > 0) {
    return { success: false, errors: uriErrors };
  }

  const parsedScopes = (values.scopes ?? '')
    .split(/\s+/)
    .map((scope) => scope.trim())
    .filter((scope) => scope.length > 0);
  const scopes = parsedScopes.length === 0 ? ['openid', 'profile', 'email'] : parsedScopes;
  const finalScopes = ['openid', ...scopes.filter((scope) => scope !== 'openid')];

  const result = await addOidcClient(values.displayName, redirectUris, finalScopes);
  if (result.success) {
    return {
      success: true,
      errors: [],
      credentials: { clientId: result.clientId, clientSecret: result.clientSecret },
    };
  } else {
    return { success: false, errors: [] };
  }
}

export async function regenerateOidcClientSecretAction(clientId: string): Promise<OidcClientValidationResult> {
  const auth = await getAuth();
  if (!auth.isAuth || !PERMISSION_SERVICE.hasPermission(auth.user, 'admin') || typeof clientId !== 'string') {
    return { success: false, errors: [] };
  }
  const result = await regenerateOidcClientSecret(clientId);
  if (result.success) {
    return {
      success: true,
      errors: [],
      credentials: { clientId: result.clientId, clientSecret: result.clientSecret },
    };
  } else {
    return { success: false, errors: [] };
  }
}

export async function removeOidcClient(clientId: string): Promise<ValidationResult> {
  const auth = await getAuth();
  if (!auth.isAuth || !PERMISSION_SERVICE.hasPermission(auth.user, 'admin') || typeof clientId !== 'string') {
    return { success: false, errors: [] };
  }
  const result = await deleteOidcClient(clientId);
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
    await notifyUserUpdate(auth.user);
    return { success: true, errors: [] };
  } else {
    return { success: false, errors: [] };
  }
}

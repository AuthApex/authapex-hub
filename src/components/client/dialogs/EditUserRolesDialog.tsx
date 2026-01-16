'use client';

import {
  BaseDialog,
  BaseDialogProps,
  Button,
  ButtonIcon,
  Checkbox,
  SelectInput,
  TextInput,
  Typography,
} from 'gtomy-lib';
import { PermRoles, RoleModel, User } from '@authapex/core';
import { Translations } from '@/locales/translation';
import { ChangeEvent, useState } from 'react';
import { getErrorMessageForName, ValidationResult } from '@/lib/validations';
import { updateUserRoles } from '@/lib/actions/admin';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { nanoid } from 'nanoid';

export interface EditUserRolesDialogProps extends BaseDialogProps {
  user: User;
  trans: Translations;
  verifiedApps: { name: string; displayName: string; url: string }[];
}

export function EditUserRolesDialog({ user, trans, verifiedApps, ...props }: EditUserRolesDialogProps) {
  const [errors, setErrors] = useState<ValidationResult['errors']>([]);
  const generalError = getErrorMessageForName('general', errors);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [roles, setRoles] = useState<(RoleModel & { id: string; isVerified: boolean })[]>(
    user.roles.map((role) => ({
      application: role.application,
      role: role.role,
      id: nanoid(),
      isVerified: verifiedApps.some((app) => app.name === role.application),
    }))
  );

  const onSubmit = async () => {
    setIsLoading(true);
    const result = await updateUserRoles(user.userId, roles);
    if (result.success) {
      props.onOpenChange?.(false);
    } else {
      setErrors(result.errors);
    }
    setIsLoading(false);
  };

  const onSelectRoleChange = (index: number, e: ChangeEvent<HTMLSelectElement>) => {
    setRoles((oldRoles) => {
      const newRoles = [...oldRoles];
      newRoles[index].role = e.target.value as PermRoles;
      return newRoles;
    });
  };

  const onNameChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    setRoles((oldRoles) => {
      const newRoles = [...oldRoles];
      newRoles[index].application = e.target.value;
      return newRoles;
    });
  };

  const onSelectAppChange = (index: number, e: ChangeEvent<HTMLSelectElement>) => {
    setRoles((oldRoles) => {
      const newRoles = [...oldRoles];
      newRoles[index].application = e.target.value;
      return newRoles;
    });
  };

  const onCheckboxChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    setRoles((oldRoles) => {
      const newRoles = [...oldRoles];
      newRoles[index].isVerified = e.target.checked;
      newRoles[index].application = '';
      return newRoles;
    });
  };

  return (
    <BaseDialog title={trans.admin.users.editUserRoles} maxWidth="sm" {...props}>
      <Typography size="2xl" weight="semibold">
        {trans.admin.users.editUserRoles}
      </Typography>
      <div className="flex flex-col gap-4">
        {roles.map((role, index) => (
          <div key={role.id} className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              {role.isVerified ? (
                <SelectInput
                  label={trans.admin.authorizedApps.name}
                  value={role.application}
                  onChange={(e) => onSelectAppChange(index, e)}
                  options={verifiedApps.map((app) => ({
                    label: app.displayName,
                    value: app.name,
                  }))}
                  allowEmpty
                />
              ) : (
                <TextInput
                  label={trans.admin.authorizedApps.name}
                  onChange={(e) => onNameChange(index, e)}
                  value={role.application}
                />
              )}
              <Checkbox
                checked={role.isVerified}
                label={trans.admin.users.isAutorizedAppInRole}
                onChange={(e) => onCheckboxChange(index, e)}
              />
            </div>
            <div className="flex items-start gap-4">
              <SelectInput
                label={trans.admin.users.roles}
                className="w-full"
                onChange={(e) => onSelectRoleChange(index, e)}
                value={role.role}
                options={[
                  {
                    label: 'User',
                    value: 'user',
                  },
                  {
                    label: 'Vip',
                    value: 'vip',
                  },
                  {
                    label: 'Moderator',
                    value: 'moderator',
                  },
                  {
                    label: 'Admin',
                    value: 'admin',
                  },
                  {
                    label: 'Owner',
                    value: 'owner',
                  },
                ]}
              />
              <ButtonIcon
                icon={XMarkIcon}
                color="error"
                title={trans.admin.users.removeRole}
                onClick={() => setRoles((oldRoles) => oldRoles.filter((_, i) => i !== index))}
                className="self-center"
              />
            </div>
          </div>
        ))}
        {generalError && <div className="alert alert-error">{generalError}</div>}
        <div className="flex gap-4 mt-4">
          <Button
            startIcon={PlusIcon}
            disabled={isLoading}
            onClick={() =>
              setRoles((oldRoles) => [...oldRoles, { application: '', role: 'user', id: nanoid(), isVerified: true }])
            }
          >
            {trans.admin.users.addNewRole}
          </Button>
          <Button color="primary" onClick={onSubmit} disabled={isLoading}>
            {trans.home.save}
          </Button>
        </div>
      </div>
    </BaseDialog>
  );
}

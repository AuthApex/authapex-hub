'use client';

import { BaseDialog, BaseDialogProps, Button, ButtonIcon, SelectInput, TextInput, Typography } from 'gtomy-lib';
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
}

export function EditUserRolesDialog({ user, trans, ...props }: EditUserRolesDialogProps) {
  const [errors, setErrors] = useState<ValidationResult['errors']>([]);
  const generalError = getErrorMessageForName('general', errors);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [roles, setRoles] = useState<(RoleModel & { id: string })[]>(
    user.roles.map((role) => ({ application: role.application, role: role.role, id: nanoid() }))
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

  const onSelectChange = (index: number, e: ChangeEvent<HTMLSelectElement>) => {
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

  return (
    <BaseDialog title={trans.admin.users.editUserRoles} maxWidth="sm" {...props}>
      <Typography size="2xl" weight="semibold">
        {trans.admin.users.editUserRoles}
      </Typography>
      <div className="flex flex-col gap-4">
        {roles.map((role, index) => (
          <div key={role.id} className="grid grid-cols-2 gap-4">
            <TextInput
              label={trans.admin.authorizedApps.name}
              onChange={(e) => onNameChange(index, e)}
              value={role.application}
            />
            <div className="flex items-end gap-4">
              <SelectInput
                label={trans.admin.users.roles}
                className="w-full"
                onChange={(e) => onSelectChange(index, e)}
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
              />
            </div>
          </div>
        ))}
        {generalError && <div className="alert alert-error">{generalError}</div>}
        <div className="flex gap-4 mt-4">
          <Button
            startIcon={PlusIcon}
            disabled={isLoading}
            onClick={() => setRoles((oldRoles) => [...oldRoles, { application: '', role: 'user', id: nanoid() }])}
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

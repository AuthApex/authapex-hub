'use client';

import { BaseDialog, BaseDialogProps, Button, SelectInput, TextInput, Typography } from 'gtomy-lib';
import { FormEvent, useState } from 'react';
import { Translations } from '@/locales/translation';
import {
  AdminUsersFilters,
  EMPTY_ADMIN_USERS_FILTERS,
  USER_PROVIDERS,
  USER_ROLES,
  USER_VERIFICATION_VALUES,
} from '@/lib/userFilters';
import { FunnelIcon } from '@heroicons/react/24/outline';

export interface AdminUsersFiltersDialogProps extends BaseDialogProps {
  trans: Translations;
  initialFilters: AdminUsersFilters;
  applications: { value: string; label: string }[];
  onApply: (filters: AdminUsersFilters) => void;
}

export function AdminUsersFiltersDialog({
  trans,
  initialFilters,
  applications,
  onApply,
  ...props
}: AdminUsersFiltersDialogProps) {
  const [filters, setFilters] = useState<AdminUsersFilters>(initialFilters);

  const updateFilter = <K extends keyof AdminUsersFilters>(key: K, value: AdminUsersFilters[K]) => {
    setFilters((oldFilters) => ({ ...oldFilters, [key]: value }));
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onApply(filters);
  };

  const onClear = () => {
    const clearedFilters = { ...EMPTY_ADMIN_USERS_FILTERS };
    setFilters(clearedFilters);
    onApply(clearedFilters);
  };

  const providerLabels: Record<(typeof USER_PROVIDERS)[number], string> = {
    google: trans.admin.users.providerGoogle,
    native: trans.admin.users.providerNative,
  };

  const verificationLabels: Record<(typeof USER_VERIFICATION_VALUES)[number], string> = {
    true: trans.admin.users.verificationVerified,
    false: trans.admin.users.verificationUnverified,
  };

  return (
    <BaseDialog title={trans.admin.users.filtersTitle} maxWidth="md" {...props}>
      <Typography size="2xl" weight="semibold">
        {trans.admin.users.filtersTitle}
      </Typography>
      <form className="flex flex-col gap-4" onSubmit={onSubmit}>
        <TextInput
          label={trans.admin.users.queryInput}
          value={filters.query}
          onChange={(event) => updateFilter('query', event.target.value)}
        />
        <TextInput
          label={trans.admin.users.emailContains}
          value={filters.email}
          onChange={(event) => updateFilter('email', event.target.value)}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectInput
            label={trans.admin.users.accountProvider}
            value={filters.provider}
            onChange={(event) => updateFilter('provider', event.target.value as AdminUsersFilters['provider'])}
            options={[
              { value: '', label: trans.admin.users.providerAny },
              ...USER_PROVIDERS.map((provider) => ({ value: provider, label: providerLabels[provider] })),
            ]}
          />
          <SelectInput
            label={trans.admin.users.emailVerification}
            value={filters.verified}
            onChange={(event) => updateFilter('verified', event.target.value as AdminUsersFilters['verified'])}
            options={[
              { value: '', label: trans.admin.users.verificationAny },
              ...USER_VERIFICATION_VALUES.map((value) => ({
                value,
                label: verificationLabels[value],
              })),
            ]}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SelectInput
            label={trans.admin.users.applicationFilter}
            value={filters.application}
            onChange={(event) => updateFilter('application', event.target.value)}
            options={[
              { value: '', label: trans.admin.users.applicationAny },
              ...applications.map((application) => ({
                value: application.value,
                label: application.label,
              })),
            ]}
          />
          <SelectInput
            label={trans.admin.users.roleFilter}
            value={filters.role}
            onChange={(event) => updateFilter('role', event.target.value as AdminUsersFilters['role'])}
            options={[
              { value: '', label: trans.admin.users.roleAny },
              ...USER_ROLES.map((role) => ({
                value: role,
                label: role.charAt(0).toUpperCase() + role.slice(1),
              })),
            ]}
          />
        </div>
        <div className="flex flex-col-reverse md:flex-row gap-2 mt-4">
          <Button type="submit" color="primary" startIcon={FunnelIcon}>
            {trans.admin.users.applyFilters}
          </Button>
          <Button type="button" color="error" onClick={onClear}>
            {trans.admin.users.clearFilters}
          </Button>
        </div>
      </form>
    </BaseDialog>
  );
}

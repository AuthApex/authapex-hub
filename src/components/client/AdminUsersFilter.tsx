'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button, DialogElement, SelectInput, TextInput, Typography, useDialog } from 'gtomy-lib';
import { ChangeEvent, useEffect, useState } from 'react';
import { Translations } from '@/locales/translation';
import {
  AdminUsersFilters,
  clearAdminUsersFilters,
  countActiveAdminUsersFilters,
  setAdminUsersFilters,
  USER_PROVIDERS,
  USER_VERIFICATION_VALUES,
} from '@/lib/userFilters';
import { AdminUsersFiltersDialog } from '@/components/client/dialogs/AdminUsersFiltersDialog';
import { FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';

export interface AdminUsersFilterProps {
  filters: AdminUsersFilters;
  applications: { value: string; label: string }[];
  trans: Translations;
  sortBy: string;
  sortOrder: string;
  usersPerPage: string;
}

export function AdminUsersFilter({
  filters,
  applications,
  usersPerPage,
  trans,
  sortOrder,
  sortBy,
}: AdminUsersFilterProps) {
  const [queryValue, setQueryValue] = useState<string>(() => filters.query);
  const { push } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    setQueryValue(filters.query);
  }, [filters.query]);

  const pushParams = (params: URLSearchParams) => {
    push(`${pathname}?${params.toString()}`);
  };

  const pushFilters = (nextFilters: AdminUsersFilters) => {
    const params = new URLSearchParams(searchParams.toString());
    setAdminUsersFilters(params, nextFilters);
    pushParams(params);
  };

  const onQuickSearch = () => {
    pushFilters({ ...filters, query: queryValue.trim() });
  };

  const onClearFilters = () => {
    setQueryValue('');
    const params = new URLSearchParams(searchParams.toString());
    clearAdminUsersFilters(params);
    pushParams(params);
  };

  const onRemoveFilter = (key: keyof AdminUsersFilters) => {
    if (key === 'query') {
      setQueryValue('');
    }
    pushFilters({ ...filters, [key]: '' });
  };

  const onParamChange = (name: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(name, value);
    } else {
      params.delete(name);
    }
    params.delete('page');
    pushParams(params);
  };

  const { dialogElementProps, openDialog } = useDialog(({ onOpenChange, ...props }) => (
    <AdminUsersFiltersDialog
      trans={trans}
      initialFilters={filters}
      applications={applications}
      onApply={(nextFilters) => {
        pushFilters(nextFilters);
        onOpenChange?.(false);
      }}
      onOpenChange={onOpenChange}
      {...props}
    />
  ));

  const activeFiltersCount = countActiveAdminUsersFilters(filters);

  const providerLabels: Record<(typeof USER_PROVIDERS)[number], string> = {
    google: trans.admin.users.providerGoogle,
    native: trans.admin.users.providerNative,
  };

  const verificationLabels: Record<(typeof USER_VERIFICATION_VALUES)[number], string> = {
    true: trans.admin.users.verificationVerified,
    false: trans.admin.users.verificationUnverified,
  };

  const activeFilters: { key: keyof AdminUsersFilters; label: string }[] = [];
  if (filters.query) {
    activeFilters.push({ key: 'query', label: `${trans.admin.users.queryInput}: ${filters.query}` });
  }
  if (filters.email) {
    activeFilters.push({ key: 'email', label: `${trans.admin.users.email}: ${filters.email}` });
  }
  if (filters.provider) {
    activeFilters.push({
      key: 'provider',
      label: `${trans.admin.users.accountProvider}: ${providerLabels[filters.provider]}`,
    });
  }
  if (filters.verified) {
    activeFilters.push({
      key: 'verified',
      label: `${trans.admin.users.emailVerification}: ${verificationLabels[filters.verified]}`,
    });
  }
  if (filters.application) {
    const applicationLabel =
      applications.find((application) => application.value === filters.application)?.label ?? filters.application;
    activeFilters.push({
      key: 'application',
      label: `${trans.admin.users.applicationFilter}: ${applicationLabel}`,
    });
  }
  if (filters.role) {
    activeFilters.push({
      key: 'role',
      label: `${trans.admin.users.roleFilter}: ${filters.role.charAt(0).toUpperCase() + filters.role.slice(1)}`,
    });
  }

  return (
    <>
      <DialogElement {...dialogElementProps} />
      <div className="flex flex-col gap-3">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          <div className="flex flex-col lg:flex-row gap-2 lg:items-center">
            <TextInput
              className="lg:w-64"
              value={queryValue}
              placeholder={trans.admin.users.queryInput}
              onChange={(event) => setQueryValue(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  onQuickSearch();
                }
              }}
            />
            <Button onClick={onQuickSearch}>{trans.admin.users.search}</Button>
            <Button outline startIcon={FunnelIcon} onClick={openDialog}>
              {trans.admin.users.filters}
              {activeFiltersCount > 0 && <span className="badge badge-primary badge-sm">{activeFiltersCount}</span>}
            </Button>
            {activeFiltersCount > 0 && (
              <Button color="error" onClick={onClearFilters}>
                {trans.admin.users.clearFilters}
              </Button>
            )}
          </div>
          <div className="flex flex-col lg:flex-row gap-2 lg:items-center">
            <SelectInput
              value={sortBy}
              options={[
                {
                  value: '_id',
                  label: trans.admin.users.sortById,
                },
                {
                  value: 'username',
                  label: trans.admin.users.sortByUsername,
                },
                {
                  value: 'displayName',
                  label: trans.admin.users.sortByDisplayName,
                },
                {
                  value: 'email',
                  label: trans.admin.users.sortByEmail,
                },
              ]}
              onChange={(event: ChangeEvent<HTMLSelectElement>) => onParamChange('sortBy', event.target.value)}
            />
            <div className="flex gap-2 items-center">
              <SelectInput
                value={sortOrder}
                options={[
                  {
                    value: 'asc',
                    label: trans.admin.users.sortOrderAsc,
                  },
                  {
                    value: 'desc',
                    label: trans.admin.users.sortOrderDesc,
                  },
                ]}
                onChange={(event: ChangeEvent<HTMLSelectElement>) => onParamChange('sortOrder', event.target.value)}
              />
              <SelectInput
                value={usersPerPage}
                options={[
                  {
                    value: '5',
                    label: '5',
                  },
                  {
                    value: '10',
                    label: '10',
                  },
                  {
                    value: '25',
                    label: '25',
                  },
                  {
                    value: '100',
                    label: '100',
                  },
                ]}
                onChange={(event: ChangeEvent<HTMLSelectElement>) => onParamChange('size', event.target.value)}
              />
            </div>
          </div>
        </div>
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <Typography size="xs" className="opacity-70">
              {trans.admin.users.activeFilters}:
            </Typography>
            {activeFilters.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className="badge badge-outline gap-1 cursor-pointer"
                title={trans.admin.users.clearFilters}
                onClick={() => onRemoveFilter(key)}
              >
                {label}
                <XMarkIcon className="size-3" />
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

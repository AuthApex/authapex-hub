'use client';

import { ReadonlyURLSearchParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button, SelectInput, TextInput } from 'gtomy-lib';
import { ChangeEvent, useEffect, useState } from 'react';
import { Translations } from '@/locales/translation';
import { createQueryString } from '@/lib/createQueryString';

export interface AdminUsersFilterProps {
  query: string;
  trans: Translations;
  sortBy: string;
  sortOrder: string;
  usersPerPage: string;
}

export function AdminUsersFilter({ query, usersPerPage, trans, sortOrder, sortBy }: AdminUsersFilterProps) {
  const [queryValue, setQueryValue] = useState<string>(() => query);
  const { push } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onSearch = () => {
    const queryStr = createQueryString(new ReadonlyURLSearchParams(), 'q', queryValue.trim());
    push(`${pathname}?${queryStr}`);
  };

  const onNumberOfUsersPerPageChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const queryStr = createQueryString(searchParams, 'size', e.target.value);
    push(`${pathname}?${queryStr}`);
  };

  const onSortByChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const queryStr = createQueryString(searchParams, 'sortBy', e.target.value);
    push(`${pathname}?${queryStr}`);
  };

  const onSortOrderChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const queryStr = createQueryString(searchParams, 'sortOrder', e.target.value);
    push(`${pathname}?${queryStr}`);
  };

  useEffect(() => {
    setQueryValue(query);
  }, [query]);

  return (
    <div className="flex flex-col lg:flex-row gap-2 lg:items-center lg:justify-between">
      <div className="flex flex-col lg:flex-row gap-2 lg:items-center">
        <TextInput
          className="lg:w-64"
          value={queryValue}
          placeholder={trans.admin.users.queryInput}
          onChange={(e) => setQueryValue(e.target.value)}
        />
        <Button onClick={onSearch}>{trans.admin.users.search}</Button>
        {query && (
          <Button color="error" onClick={() => push(pathname)}>
            {trans.admin.users.clearQuery}
          </Button>
        )}
      </div>
      {!query && (
        <div className="flex flex-col lg:flex-row gap-2 lg:items-center">
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
            onChange={onNumberOfUsersPerPageChange}
          />
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
            onChange={onSortByChange}
          />
          <SelectInput
            value={sortOrder}
            options={[
              {
                value: 'desc',
                label: trans.admin.users.sortOrderDesc,
              },
              {
                value: 'asc',
                label: trans.admin.users.sortOrderAsc,
              },
            ]}
            onChange={onSortOrderChange}
          />
        </div>
      )}
    </div>
  );
}

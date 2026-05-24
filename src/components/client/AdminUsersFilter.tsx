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
  usersPerPage: number;
}

export function AdminUsersFilter({ query, usersPerPage, trans, sortOrder, sortBy }: AdminUsersFilterProps) {
  const [queryValue, setQueryValue] = useState<string>(() => query);
  const [usersPerPageValue, setUsersPerPageValue] = useState<string>(() => String(usersPerPage));
  const { push } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onSearch = () => {
    const queryStr1 = createQueryString(new ReadonlyURLSearchParams(), 'q', queryValue.trim());
    const size = +usersPerPageValue;
    const queryStr2 = createQueryString(
      new ReadonlyURLSearchParams(queryStr1),
      'size',
      isNaN(size) || size === 5 ? '' : String(size)
    );
    push(`${pathname}?${queryStr2}`);
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

  useEffect(() => {
    setUsersPerPageValue(String(usersPerPage));
  }, [usersPerPage]);

  return (
    <div className="flex flex-col lg:flex-row gap-2 lg:items-center lg:justify-between">
      <div className="flex flex-col lg:flex-row gap-2 lg:items-center">
        <TextInput
          className="lg:w-64"
          value={queryValue}
          placeholder={trans.admin.users.queryInput}
          onChange={(e) => setQueryValue(e.target.value)}
        />
        <TextInput
          className="lg:w-64"
          type="number"
          step="1"
          value={usersPerPageValue}
          placeholder={trans.admin.users.usersPerPageInput}
          onChange={(e) => setUsersPerPageValue(e.target.value)}
        />
        <Button onClick={onSearch}>{trans.admin.users.search}</Button>
        {(query != null || usersPerPage !== 5) && (
          <Button color="error" onClick={() => push(pathname)}>
            {trans.admin.users.clearQuery}
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
    </div>
  );
}

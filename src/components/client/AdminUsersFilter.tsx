'use client';

import { useRouter } from 'next/navigation';
import { Button, TextInput } from 'gtomy-lib';
import { useEffect, useState } from 'react';
import { Translations } from '@/locales/translation';

export interface AdminUsersFilterProps {
  query?: string;
  trans: Translations;
}

export function AdminUsersFilter({ query, trans }: AdminUsersFilterProps) {
  const [value, setValue] = useState<string>(() => query ?? '');
  const { push } = useRouter();

  const onSearch = () => {
    if (value.trim() === '') {
      push('/admin/users');
    } else {
      push('/admin/users?q=' + value);
    }
  };

  useEffect(() => {
    setValue(query ?? '');
  }, [query]);

  return (
    <div className="flex flex-col lg:flex-row gap-2 lg:items-center">
      <TextInput
        className="lg:w-64"
        value={value}
        placeholder={trans.admin.users.queryInput}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button onClick={onSearch}>{trans.admin.users.search}</Button>
      {query != null && (
        <Button color="error" onClick={() => push('/admin/users')}>
          {trans.admin.users.clearQuery}
        </Button>
      )}
    </div>
  );
}

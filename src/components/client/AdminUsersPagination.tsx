'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { createQueryString } from '@/lib/createQueryString';

export function AdminUsersPagination({ page, isLast }: { page: number; isLast: boolean }) {
  const { push } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const onPreviousPage = () => {
    const queryStr = createQueryString(searchParams, 'page', page - 1);
    push(`${pathname}?${queryStr}`);
  };

  const onNextPage = () => {
    const queryStr = createQueryString(searchParams, 'page', page + 1);
    push(`${pathname}?${queryStr}`);
  };

  return (
    <div className="w-full flex justify-center">
      <div className="join">
        <button type="button" className="join-item btn" onClick={onPreviousPage} disabled={page === 0}>
          «
        </button>
        <div className="join-item btn">Page {page + 1}</div>
        <button type="button" className="join-item btn" onClick={onNextPage} disabled={isLast}>
          »
        </button>
      </div>
    </div>
  );
}

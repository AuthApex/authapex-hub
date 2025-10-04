'use client';

import { useRouter } from 'next/navigation';

export function AdminUsersPagination({ page }: { page: number }) {
  const { push } = useRouter();

  const onPreviousPage = () => {
    if (page > 1) {
      push('/admin/users?page=' + (page - 1));
    } else {
      push('/admin/users');
    }
  };

  const onNextPage = () => {
    push('/admin/users?page=' + (page + 1));
  };

  return (
    <div className="w-full flex justify-center">
      <div className="join">
        <button type="button" className="join-item btn" onClick={onPreviousPage} disabled={page === 0}>
          «
        </button>
        <div className="join-item btn">Page {page + 1}</div>
        <button type="button" className="join-item btn" onClick={onNextPage}>
          »
        </button>
      </div>
    </div>
  );
}

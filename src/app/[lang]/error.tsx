'use client';

import { useEffect } from 'react';
import { captureClientException } from '@/lib/monitoring/client';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    captureClientException(error, { tags: { area: 'app-error' } });
  }, [error]);

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6">
      <div className="card w-sm max-w-screen">
        <div className="card-body flex flex-col items-center gap-4 text-center">
          <h1 className="text-2xl font-bold">Něco se pokazilo</h1>
          <p>Omlouváme se, ale stránku se nepodařilo načíst.</p>
          <button type="button" className="btn btn-primary" onClick={() => reset()}>
            Zkusit znovu
          </button>
        </div>
      </div>
    </div>
  );
}

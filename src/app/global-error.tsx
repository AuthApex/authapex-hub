'use client';

import { useEffect } from 'react';
import { captureClientException } from '@/lib/monitoring/client';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    captureClientException(error, { tags: { area: 'global-error' } });
  }, [error]);

  return (
    <html lang="cs">
      <body>
        <main
          style={{
            display: 'flex',
            minHeight: '100vh',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '1rem',
            padding: '1.5rem',
            fontFamily: 'system-ui, sans-serif',
            textAlign: 'center',
          }}
        >
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Něco se pokazilo</h1>
          <p>Omlouváme se, ale aplikace narazila na neočekávanou chybu.</p>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              cursor: 'pointer',
              borderRadius: '0.5rem',
              border: '1px solid currentColor',
              padding: '0.5rem 1rem',
              background: 'transparent',
              color: 'inherit',
            }}
          >
            Zkusit znovu
          </button>
        </main>
      </body>
    </html>
  );
}

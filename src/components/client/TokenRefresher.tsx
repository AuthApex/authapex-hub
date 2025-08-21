'use client';

import { useEffect, useRef } from 'react';

export function TokenRefresher() {
  const refreshRef = useRef<boolean>(false);

  useEffect(() => {
    if (refreshRef.current) {
      return;
    }
    refreshRef.current = true;
    fetch('/api/refresh').catch(console.error);
  }, []);

  return null;
}

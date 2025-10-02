'use client';

import { useEffect, useRef } from 'react';
import axios from 'axios';

export function TokenRefresher() {
  const refreshRef = useRef<boolean>(false);

  useEffect(() => {
    if (refreshRef.current) {
      return;
    }
    refreshRef.current = true;
    axios.get('/api/refresh', { withCredentials: true }).catch(console.error);
  }, []);

  return null;
}

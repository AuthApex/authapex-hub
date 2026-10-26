import { initClientMonitoring, loadClientMonitoringConfig } from '@/lib/monitoring/client';

// Try the optional NEXT_PUBLIC_* fallback immediately, then fetch the runtime configuration from the server. The
// listener covers the case where the first request is still in flight while the document is parsed.
initClientMonitoring();
void loadClientMonitoringConfig();
if (typeof window !== 'undefined') {
  window.addEventListener(
    'DOMContentLoaded',
    () => {
      initClientMonitoring();
      void loadClientMonitoringConfig();
    },
    { once: true }
  );
}

import { initClientMonitoring, loadClientMonitoringConfig } from '@/lib/monitoring/client';

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

import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

const srcDir = fileURLToPath(new URL('./src', import.meta.url));
const serverOnlyStub = fileURLToPath(new URL('./test/serverOnly.ts', import.meta.url));

export default defineConfig({
  resolve: {
    alias: [
      { find: /^@\//, replacement: `${srcDir}/` },
      // Next.js aliases the `server-only` marker package during its build, so Vitest needs a stub as well.
      { find: /^server-only$/, replacement: serverOnlyStub },
    ],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    clearMocks: true,
    restoreMocks: true,
  },
});

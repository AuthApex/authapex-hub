// Vitest replacement for the `server-only` marker package. Next.js resolves it while building, but the package itself
// throws when it is loaded outside of a React Server Component environment.
export {};

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    reactCompiler: true,
  },
  async headers() {
    return [
      {
        // The hub is never embedded, so framing is blocked to prevent clickjacking of the sign in and consent pages.
        source: '/:path*',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Content-Security-Policy', value: "frame-ancestors 'none'" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/.well-known/openid-configuration',
        destination: '/api/oidc/discovery',
      },
      {
        source: '/.well-known/oauth-authorization-server',
        destination: '/api/oidc/discovery',
      },
      {
        source: '/.well-known/jwks.json',
        destination: '/api/oidc/jwks',
      },
    ];
  },
};

export default nextConfig;

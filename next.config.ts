import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    reactCompiler: true,
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

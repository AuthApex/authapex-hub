import { NextResponse } from 'next/server';
import { getOidcEndpoints, OIDC_SUPPORTED_SCOPES } from '@/lib/server/oidc/config';
import { getOidcSigningKey } from '@/lib/server/oidc/keys';
import { logError } from '@/lib/server/logger';

export const dynamic = 'force-dynamic';

export async function GET() {
  let endpoints: ReturnType<typeof getOidcEndpoints>;
  try {
    endpoints = getOidcEndpoints();
  } catch (error) {
    logError(error, 'OIDC discovery is not configured', { area: 'oidc-discovery' });
    return NextResponse.json(
      { error: 'server_error', error_description: 'The OIDC issuer is not configured.' },
      { status: 500 }
    );
  }

  let signingAlgorithms = ['RS256'];
  try {
    signingAlgorithms = [(await getOidcSigningKey()).alg];
  } catch (error) {
    // Discovery stays available without a key so clients can still read the endpoints, but the misconfiguration is
    // reported because the token endpoint cannot work until it is fixed.
    logError(error, 'OIDC signing key is not configured', { area: 'oidc-discovery' });
    signingAlgorithms = ['RS256'];
  }

  return NextResponse.json(
    {
      issuer: endpoints.issuer,
      authorization_endpoint: endpoints.authorizationEndpoint,
      token_endpoint: endpoints.tokenEndpoint,
      userinfo_endpoint: endpoints.userinfoEndpoint,
      jwks_uri: endpoints.jwksUri,
      scopes_supported: OIDC_SUPPORTED_SCOPES,
      response_types_supported: ['code'],
      response_modes_supported: ['query'],
      grant_types_supported: ['authorization_code', 'refresh_token'],
      subject_types_supported: ['public'],
      id_token_signing_alg_values_supported: signingAlgorithms,
      token_endpoint_auth_methods_supported: ['client_secret_basic', 'client_secret_post'],
      code_challenge_methods_supported: ['S256'],
      claims_supported: [
        'iss',
        'sub',
        'aud',
        'exp',
        'iat',
        'auth_time',
        'nonce',
        'at_hash',
        'name',
        'nickname',
        'preferred_username',
        'picture',
        'email',
        'email_verified',
        'groups',
        'roles',
      ],
    },
    { headers: { 'Cache-Control': 'public, max-age=600' } }
  );
}

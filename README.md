# AuthApex HUB

## Environment variables

No `.env.example` is committed (`.env*` is gitignored). Next.js loads `.env.local` automatically in development; in
production, set the variables in the deployment environment (Docker, Coolify, ...). The app throws at request time if a
required variable is missing.

### Required

| Variable          | Description                                                                                               |
| ----------------- | --------------------------------------------------------------------------------------------------------- |
| `MONGODB_URI`     | MongoDB connection string, e.g. `mongodb://localhost:27017`.                                              |
| `MONGODB_DB_NAME` | Database name, e.g. `authapex`.                                                                           |
| `SESSION_SECRET`  | Secret used to sign the session cookie JWT. Use a long random value, e.g. from `openssl rand -base64 32`. |

### Optional

| Variable                                                                          | Description                                                                                                                           |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `APP_URL`                                                                         | Public base URL of the hub. Defaults to `https://id.authapex.net`. Read at runtime from the container environment.                    |
| `DEVELOPMENT`                                                                     | Any truthy value disables secure cookies and allows a non-`https` OIDC issuer.                                                        |
| `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`                                        | Enable Google sign-in. Both are read at runtime; the client id is passed to the browser by the sign-in page.                          |
| `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_API_KEY`                                     | Enable profile image uploads through Cloudflare Images.                                                                               |
| `OIDC_PRIVATE_KEY`                                                                | PKCS#8 PEM private key used to sign ID tokens and access tokens. Required for the OIDC provider. `\n`-escaped newlines are supported. |
| `OIDC_ISSUER`                                                                     | Public OIDC issuer URL. Defaults to `APP_URL`. Must use `https` outside development.                                                  |
| `OIDC_KEY_ID`                                                                     | `kid` published in the JWKS. Defaults to the RFC 7638 thumbprint of the public key.                                                   |
| `GLITCHTIP_DSN`                                                                   | Enables optional GlitchTip error reporting. See [Error monitoring](#error-monitoring-glitchtip).                                      |
| `GLITCHTIP_ENVIRONMENT`                                                           | Environment name attached to reports. Defaults to `NODE_ENV`.                                                                         |
| `GLITCHTIP_RELEASE`                                                               | Release/version attached to reports.                                                                                                  |
| `GLITCHTIP_TRACES_SAMPLE_RATE`                                                    | Performance/tracing sample rate between `0` and `1`. Defaults to `0` (tracing disabled; errors are still reported).                   |
| `GLITCHTIP_ENABLED`                                                               | Set to `false` to disable monitoring even when a DSN is configured.                                                                   |
| `SENTRY_DSN`, `SENTRY_ENVIRONMENT`, `SENTRY_RELEASE`, `SENTRY_TRACES_SAMPLE_RATE` | Aliases for the corresponding `GLITCHTIP_*` variables. `GLITCHTIP_*` takes precedence.                                                |

Google sign-in and profile image uploads are fully optional. Google sign-in requires both `GOOGLE_CLIENT_ID` and
`GOOGLE_CLIENT_SECRET`; profile uploads require both `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_KEY`. When a pair is
missing, only that feature is unavailable — the rest of the hub works normally, and upload attempts return `503`.

### Setting variables

For local development, create `.env.local` in the project root:

```dotenv
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=authapex
SESSION_SECRET=replace-with-a-long-random-value
APP_URL=http://localhost:3000
DEVELOPMENT=true

# Google sign-in (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Profile images (optional)
CLOUDFLARE_ACCOUNT_ID=your-cloudflare-account-id
CLOUDFLARE_API_KEY=your-cloudflare-api-key

# OIDC provider (optional)
OIDC_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"
OIDC_ISSUER=http://localhost:3000

# Error monitoring (optional)
GLITCHTIP_DSN=https://your-public-key@glitchtip.example.com/1
GLITCHTIP_ENVIRONMENT=development
```

In production, pass runtime variables to the container:

```bash
docker run \
  -e MONGODB_URI="mongodb://..." \
  -e MONGODB_DB_NAME="authapex" \
  -e SESSION_SECRET="..." \
  -e APP_URL="https://id.example.com" \
  -e GOOGLE_CLIENT_ID="..." \
  -e GOOGLE_CLIENT_SECRET="..." \
  -e OIDC_PRIVATE_KEY="$(cat oidc.pem)" \
  -e GLITCHTIP_DSN="https://your-public-key@glitchtip.example.com/1" \
  authapex-hub
```

All variables are read at runtime from the container environment, so changing any of them only requires restarting the
container — no rebuild and no Docker build arguments are needed.

### Error monitoring (GlitchTip)

GlitchTip is optional and uses the Sentry-compatible `@sentry/nextjs` SDK. Create a project in GlitchTip, copy its DSN
into `GLITCHTIP_DSN`, and restart the app. When no DSN is set, or when `GLITCHTIP_ENABLED=false`, monitoring is disabled
and the app only writes to the container log.

- The DSN must be an `http(s)` URL in the form `https://<public-key>@<host>/<project-id>`. A DSN is public by design, so
  it is also safe to expose it to the browser. Invalid DSNs are logged and reporting stays disabled.
- Server errors, route-handler/server-action failures, unhandled render errors and browser errors are reported.
  Credentials, cookies, request bodies, query strings and user details are filtered before an event is sent.
- The browser reads its runtime configuration from the public `GET /api/monitoring/config` endpoint. It returns `204`
  when monitoring is disabled. This means changing `GLITCHTIP_DSN` at runtime does not require a rebuild.
- Source-map upload is not configured, because it would require a build-time Sentry/GlitchTip auth token. Runtime error
  reports still include stack traces.

## OAuth2 / OpenID Connect provider

Next to the built in AuthApex authorization flow (`/api/authorize`), the hub also acts as a standard OpenID Connect
provider, so third party applications such as Immich, Gitea, Grafana or Nextcloud can use it as a login provider.

### OIDC configuration

| Variable           | Required | Description                                                                                                             |
| ------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| `OIDC_PRIVATE_KEY` | yes      | PKCS#8 PEM private key used to sign ID tokens and access tokens. `\n` escaped newlines are allowed.                     |
| `OIDC_ISSUER`      | no       | Public base URL of the hub, e.g. `https://id.authapex.net`. Must use `https` outside development. Defaults to `APP_URL` |
| `OIDC_KEY_ID`      | no       | `kid` published in the JWKS. Defaults to the RFC 7638 thumbprint of the public key.                                     |

An RSA key can be generated with:

```bash
openssl genpkey -algorithm RSA -pkcs8 -out oidc.pem -pkeyopt rsa_keygen_bits:2048
```

RSA keys are signed with `RS256`, EC keys (`P-256`, `P-384`, `P-521`) with `ES256`, `ES384` and `ES512`.

### Endpoints

| Purpose       | URL                                 |
| ------------- | ----------------------------------- |
| Discovery     | `/.well-known/openid-configuration` |
| JWKS          | `/.well-known/jwks.json`            |
| Authorization | `/api/oidc/authorize`               |
| Token         | `/api/oidc/token`                   |
| UserInfo      | `/api/oidc/userinfo`                |

Supported: the authorization code flow with optional PKCE (`S256` only), the refresh token grant (requires the
`offline_access` scope), `client_secret_basic` / `client_secret_post` client authentication.

- `prompt` supports `none`, `login`, `consent` and `select_account`. `login`, `select_account`.
- `auth_time` is the time the user actually signed in, it is kept when the hub session is rotated.
- Refresh tokens rotate on every use. Reusing an already used refresh token or authorization code revokes all refresh
  tokens issued from the same authorization. A refresh request may narrow the scope, the new refresh token keeps the
  original one.
- Logging out of the hub does not revoke refresh tokens, users revoke applications on the **Authorized applications**
  page.

### Scopes and claims

| Scope            | Claims                                              |
| ---------------- | --------------------------------------------------- |
| `openid`         | `sub`, `auth_time`, `nonce`, `at_hash`              |
| `profile`        | `name`, `nickname`, `preferred_username`, `picture` |
| `email`          | `email`, `email_verified`                           |
| `groups`         | `groups` (`<application>:<role>`), `roles`          |
| `offline_access` | issues a rotating refresh token                     |

### Registering a client

Clients are managed in the admin section under **OAuth2 / OIDC clients** (`/admin/oidc-clients`). Every client has a
generated `client_id` and `client_secret`, an explicit list of allowed redirect URIs and the scopes it may request.
The client secret is stored only as a SHA-256 hash and is shown once, when the client is created. If it gets lost, it
can be regenerated in the admin section (the application then has to be updated with the new secret). Authorization
codes and refresh tokens are stored hashed as well.

Redirect URIs must be `https://`, `http://` only for `localhost`, `127.0.0.1` or `[::1]`, or a private-use scheme of a
native app containing a dot (e.g. `app.immich:///oauth-callback`). URIs with a `#fragment` or credentials are rejected.

Used authorization codes and refresh tokens are kept (with a `usedAt` field) to detect replays. Documents in
`oidcAuthCodes` and `oidcRefreshTokens` can be removed once `expiresAt` is in the past.

Users see a consent screen the first time an application asks for access and can revoke it later on the
**Authorized applications** page.

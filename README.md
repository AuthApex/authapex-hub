# AuthApex HUB

## OAuth2 / OpenID Connect provider

Next to the built in AuthApex authorization flow (`/api/authorize`), the hub also acts as a standard OpenID Connect
provider, so third party applications such as Immich, Gitea, Grafana or Nextcloud can use it as a login provider.

### Configuration

| Variable            | Required | Description                                                                                         |
| ------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| `OIDC_PRIVATE_KEY`  | yes      | PKCS#8 PEM private key used to sign ID tokens and access tokens. `\n` escaped newlines are allowed. |
| `OIDC_KEY_ID`       | no       | `kid` published in the JWKS. Defaults to the RFC 7638 thumbprint of the public key.                 |

An RSA key can be generated with:

```bash
openssl genpkey -algorithm RSA -pkcs8 -out oidc.pem -pkeyopt rsa_keygen_bits:2048
```

RSA keys are signed with `RS256`, EC keys (`P-256`, `P-384`, `P-521`) with `ES256`, `ES384` and `ES512`.

### Endpoints

| Purpose       | URL                                     |
| ------------- | --------------------------------------- |
| Discovery     | `/.well-known/openid-configuration`     |
| JWKS          | `/.well-known/jwks.json`                |
| Authorization | `/api/oidc/authorize`                   |
| Token         | `/api/oidc/token`                       |
| UserInfo      | `/api/oidc/userinfo`                    |
| End session   | `/api/oidc/logout`                      |

Supported: the authorization code flow, the refresh token grant (requires the `offline_access` scope),
`client_secret_basic` and `client_secret_post` client authentication and RP initiated logout. PKCE is not implemented.

### Scopes and claims

| Scope            | Claims                                                  |
| ---------------- | ------------------------------------------------------- |
| `openid`         | `sub`, `auth_time`, `nonce`, `at_hash`                  |
| `profile`        | `name`, `nickname`, `preferred_username`, `picture`     |
| `email`          | `email`, `email_verified`                               |
| `groups`         | `groups` (`<application>:<role>`), `roles`              |
| `offline_access` | issues a rotating refresh token                         |

### Registering a client

Clients are managed in the admin section under **OAuth2 / OIDC clients** (`/admin/oidc-clients`). Every client has a
generated `client_id` and `client_secret`, an explicit list of allowed redirect URIs and the scopes it may request.
Users see a consent screen the first time an application asks for access and can revoke it later on the
**Authorized applications** page.

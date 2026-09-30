# AuthApex HUB

## OAuth2 / OpenID Connect provider

Next to the built in AuthApex authorization flow (`/api/authorize`), the hub also acts as a standard OpenID Connect
provider, so third party applications such as Immich, Gitea, Grafana or Nextcloud can use it as a login provider.

### Configuration

| Variable            | Required | Description                                                                                         |
| ------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| `OIDC_ISSUER`       | yes      | Public base URL of the hub, e.g. `https://id.authapex.net`. Must use `https` outside development.    |
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

Supported: the authorization code flow with optional PKCE (`S256` only), the refresh token grant (requires the
`offline_access` scope), `client_secret_basic` / `client_secret_post` client authentication and RP-Initiated Logout.

- `prompt` supports `none`, `login`, `consent` and `select_account`. `login`, `select_account` and an exceeded
  `max_age` end the current hub session and ask the user to sign in again.
- `auth_time` is the time the user actually signed in, it is kept when the hub session is rotated.
- Refresh tokens rotate on every use. Reusing an already used refresh token or authorization code revokes all refresh
  tokens issued from the same authorization. A refresh request may narrow the scope, the new refresh token keeps the
  original one.
- Logging out of the hub does not revoke refresh tokens, users revoke applications on the **Authorized applications**
  page.

### Logout

Applications log users out by sending them to the end session endpoint (GET or POST) with the parameters
`id_token_hint`, `client_id`, `post_logout_redirect_uri` and `state`, all optional. The hub session is ended, the
consent and refresh tokens of the application are kept.

- With a valid `id_token_hint` (expired tokens are accepted) of the signed in user, the user is logged out right away.
  Otherwise the user has to confirm the logout, so other sites can not log users out by linking to the endpoint.
- `post_logout_redirect_uri` must exactly match one of the client's registered post logout redirect URIs, the client
  is identified by `client_id` or the `id_token_hint`. `state` is passed back. Without a redirect URI the user ends on
  the hub sign in page.
- Other applications are not notified (no front or back channel logout), they keep their own sessions.

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
generated `client_id` and `client_secret`, an explicit list of allowed redirect URIs, optional post logout redirect URIs
and the scopes it may request.
The client secret is stored only as a SHA-256 hash and is shown once, when the client is created. If it gets lost, it
can be regenerated in the admin section (the application then has to be updated with the new secret). Authorization
codes and refresh tokens are stored hashed as well.

Redirect URIs must be `https://`, `http://` only for `localhost`, `127.0.0.1` or `[::1]`, or a private-use scheme of a
native app containing a dot (e.g. `app.immich:///oauth-callback`). URIs with a `#fragment` or credentials are rejected.

Used authorization codes and refresh tokens are kept (with a `usedAt` field) to detect replays. Documents in
`oidcAuthCodes` and `oidcRefreshTokens` can be removed once `expiresAt` is in the past.

Users see a consent screen the first time an application asks for access and can revoke it later on the
**Authorized applications** page.

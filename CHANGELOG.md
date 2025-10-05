# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

### [0.3.3](https://github.com/AuthApex/authapex-hub/compare/v0.3.2...v0.3.3) (2025-10-04)


### Bug Fixes

* simplify user session verification logic in `mongodb.ts` ([0928d4a](https://github.com/AuthApex/authapex-hub/commit/0928d4ab4d84d42c8f0a1a20f559b52083a472b5))

### [0.3.2](https://github.com/AuthApex/authapex-hub/compare/v0.3.1...v0.3.2) (2025-10-04)


### Bug Fixes

* handle errors in `notifyUserUpdate` and clean up promise logic ([30099f7](https://github.com/AuthApex/authapex-hub/commit/30099f7fd8cb2045091ef6af931cad73e4156407))
* use `getUserAppSessions` in `notifyUserUpdate` and refine websocket logic ([02c5879](https://github.com/AuthApex/authapex-hub/commit/02c58795659eda7c6e8b6f82951987961d78bae4))

### [0.3.1](https://github.com/AuthApex/authapex-hub/compare/v0.3.0...v0.3.1) (2025-10-04)


### Bug Fixes

* normalize username and email in user creation, adjust session lookup collection ([f7a54e2](https://github.com/AuthApex/authapex-hub/commit/f7a54e24ed22058c744eac02b714edd79d94ac59))

## [0.3.0](https://github.com/AuthApex/authapex-hub/compare/v0.2.1...v0.3.0) (2025-10-04)


### Features

* add pagination to admin users list with `AdminUsersPagination` component and backend handling in `getUsers` ([9cd155c](https://github.com/AuthApex/authapex-hub/commit/9cd155ca6f37fd4e9f5a5e44ad5f166edbe92ad7))
* add websocket notifications for user updates and integrate `websocketEndpoint` handling in authorized apps ([3737895](https://github.com/AuthApex/authapex-hub/commit/373789556ddfe735f6dc21d7b3ad0fe24d7101e8))
* introduce admin panel with authorized apps and users management ([c4f5a64](https://github.com/AuthApex/authapex-hub/commit/c4f5a64655da44a4ee33a37fc13f714f79cc0781))


### Bug Fixes

* correct `notifyUserUpdate` parameter in `auth` actions ([33d253d](https://github.com/AuthApex/authapex-hub/commit/33d253d816015260b2eb16a3767f109ff00e63ab))
* remove unused `VerifiedStatus` enum from `AuthorizeCard` component ([5d39a95](https://github.com/AuthApex/authapex-hub/commit/5d39a95c530337cb93c441ff7acefcf6ec1ba607))

### [0.2.1](https://github.com/AuthApex/authapex-hub/compare/v0.2.0...v0.2.1) (2025-10-03)


### Features

* add user lookup API route and upgrade @authapex/core to v0.2.1 ([150915d](https://github.com/AuthApex/authapex-hub/commit/150915df6d1063541b4ede41d7d62cd4af2c2ebb))

## [0.2.0](https://github.com/AuthApex/authapex-hub/compare/v0.1.3...v0.2.0) (2025-10-03)


### Features

* update profile picture API endpoint in route and action buttons ([5d6b1a3](https://github.com/AuthApex/authapex-hub/commit/5d6b1a3d66a7810011b1632d963f21bb1380ce54))


### Bug Fixes

* adjust app display logic in `AuthorizeCard` to enhance verified name handling ([829e248](https://github.com/AuthApex/authapex-hub/commit/829e248fa5395b3371666b1b09d2c27d2924a114))
* remove unused `app` field from session handling functions and actions ([28aec29](https://github.com/AuthApex/authapex-hub/commit/28aec29891ed149daa621c1cfbea3c4badcc3538))

### [0.1.3](https://github.com/AuthApex/authapex-hub/compare/v0.1.2...v0.1.3) (2025-10-02)


### Features

* add viewport metadata configuration to layout.tsx ([0a48ae3](https://github.com/AuthApex/authapex-hub/commit/0a48ae34a235344a6ecd48e67e1d8ee100a67094))


### Bug Fixes

* adjust role display structure and improve typography usage in Home page ([286ac60](https://github.com/AuthApex/authapex-hub/commit/286ac60d594411e7341f28f4c379feb2164a5035))
* enhance app verification logic and optimize verified app display names ([afa8ff5](https://github.com/AuthApex/authapex-hub/commit/afa8ff5d8b700b4112a0055a72918174aa573f75))
* update localization titles and descriptions to remove 'Hub' from app name ([17aaa83](https://github.com/AuthApex/authapex-hub/commit/17aaa83c4a173e1d5da4631e789b974a94204b2d))
* use constant for app name in session creation ([5f5f86a](https://github.com/AuthApex/authapex-hub/commit/5f5f86a8bd31967d0433b716b1491d1c4f873b30))

### [0.1.2](https://github.com/AuthApex/authapex-hub/compare/v0.1.1...v0.1.2) (2025-10-02)


### Features

* user management, authorization, and profile image functionalities. ([9c123dc](https://github.com/AuthApex/authapex-hub/commit/9c123dca276409caad6331ce5cef7dd7f32f8287))

### 0.1.1 (2025-09-03)


### Bug Fixes

* update localization content and contact information for AuthApex Hub ([84c9d24](https://github.com/AuthApex/authapex-hub/commit/84c9d24b18157b997b7a7169f29c8e075cd2506f))

### 0.1.0 (2025-08-22)

### Features
* Initialize project

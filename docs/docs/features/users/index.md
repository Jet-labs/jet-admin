# Users

The user system in Jet Admin combines **Firebase-based authentication** with backend-managed user and tenant records.

This page focuses on the current implementation rather than older session/cookie-based descriptions.

## What the user system covers

The broader user feature set spans:

- sign-in and sign-up through Firebase,
- backend verification of Firebase bearer tokens,
- user profile retrieval in the backend,
- tenant membership and role assignment,
- tenant-scoped user administration,
- per-tenant user configuration endpoints.

## Authentication architecture

The current auth flow is:

1. the frontend authenticates with Firebase,
2. Firebase returns an ID token,
3. the frontend sends that token as `Authorization: Bearer ...`,
4. the backend verifies the token with Firebase Admin,
5. the backend resolves the corresponding application user,
6. protected tenant routes continue with RBAC checks.

This is the central identity flow used by the frontend application today.

## Frontend responsibilities

On the frontend, the auth layer is centered around `AuthContextProvider` and the Firebase client SDK.

It is responsible for behavior such as:

- tracking the authenticated user,
- retrieving fresh ID tokens for API calls,
- exposing auth state to the route tree,
- supporting socket authentication through the current Firebase token.

## Backend responsibilities

On the backend, the auth module handles:

- token verification,
- current-user resolution,
- current-user info retrieval,
- get/update user configuration by tenant.

Separately, tenant user-management routes handle administrative user actions.

## Current backend capabilities

The user-management area currently supports operations such as:

- list users,
- get user,
- add user,
- assign roles,
- delete user.

These capabilities are tenant-scoped and work together with the roles/permissions subsystem.

## Important clarification about sessions

Older docs may describe access tokens, refresh tokens, or cookie-based session handling as the primary runtime model. That is not the main architecture reflected in the current codebase.

The active flow is centered on Firebase-issued bearer tokens verified by the backend.

## User records vs identity provider

It helps to separate two concepts:

- **Firebase** is the identity provider,
- **Jet Admin database records** store platform-specific user metadata, tenant relationships, and authorization mappings.

That distinction explains why a valid Firebase identity is necessary but not sufficient for full access: the backend still needs to understand the user's tenant relationships and roles.

## Realtime behavior

Socket connections reuse the authenticated user context by supplying the Firebase token during the socket handshake.

This is especially important for features that depend on live execution status, such as workflow runs.

## Related docs

- [Roles & Permissions](/docs/features/roles)
- [Frontend local development](/docs/setup/setup-frontend)
- [Backend architecture](/docs/architecture/backend-architecture)
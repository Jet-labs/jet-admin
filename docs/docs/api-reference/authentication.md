---
id: authentication
title: Authentication & Session Management
sidebar_label: Authentication
sidebar_position: 1
description: How Jet Admin authenticates users and manages sessions.
---

# Authentication & Session Management

Jet Admin relies on industry-standard stateless authentication mechanisms to verify user identity securely while allowing horizontal scaling of the backend API.

## Authentication Model

Jet Admin primarily uses **JSON Web Tokens (JWT)** for authentication.

### Token Issuance Lifecycle
1. **Login Request:** A user submits their credentials (e.g., email and password) to the `/api/v1/auth/login` endpoint.
2. **Verification:** The backend verifies the password hash against the `tblUsers` record.
3. **Token Generation:** Upon success, the backend generates a signed JWT. The token payload typically includes the `userID` and basic claims.
4. **Delivery:** The token is returned to the client. *[VERIFY: Jet Admin may store this in `localStorage`, or in a secure `HttpOnly` cookie depending on environment configuration. Assume standard bearer token logic for APIs.]*
5. **Subsequent Requests:** The client includes the token in the `Authorization: Bearer <token>` header of every subsequent API request.

### Session Management & Expiry
- **Statelessness:** Because JWTs are self-contained and cryptographically signed, the backend does not need to look up a session ID in a database or Redis cache for every request.
- **Expiry:** Tokens have a built-in TTL (Time To Live). When a token expires, the client must obtain a new one.
- **Invalidation:** *[VERIFY: To truly revoke JWTs before expiry, Jet Admin might implement a token blocklist or rely on short TTLs combined with refresh tokens.]*

## Onboarding & Invite Flow

Adding new users to a Jet Admin Tenant follows an invite-based onboarding flow.

1. **Invitation:** An existing Tenant Admin uses the UI to invite a new user via email.
2. **Token Creation:** The backend generates a secure, single-use, time-bound invite token and stores its hash in the database, associating it with the target email and `tenantID`.
3. **Email Delivery:** An email is sent to the user containing a magic link with the invite token.
4. **Registration:** The user clicks the link, bringing them to a registration page. They provide their name and establish a password.
5. **Consumption:** The backend validates the invite token, creates the `tblUsers` record, assigns the default role in `tblTenantUsers`, invalidates the invite token, and issues a standard JWT to log the user in immediately.

## API Key Authentication (Machine-to-Machine)

For integrations that require external systems to trigger Jet Admin processes (e.g., triggering a Workflow via webhook, or an external script triggering a Query), User JWTs are inappropriate.

Jet Admin utilizes **API Keys** (`tblAPIKeys`) for this purpose.
- API Keys are generated via the dashboard and assigned specific permissions or roles.
- The raw key is shown only once upon creation; the backend stores a cryptographic hash.
- External systems pass the API Key in a designated header (e.g., `X-Jet-Admin-Api-Key` or standard `Authorization`).
- The backend middleware identifies the API key, looks up the associated tenant and permissions, and authorizes the request.

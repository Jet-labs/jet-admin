---
sidebar_position: 2
title: Authentication
description: Authentication and Authorization guide
---

# Authentication

The Jet Admin API mainly uses **Firebase Authentication** for user identity and **API Keys** for programmatic access.

## Firebase Authentication (Bearer Token)

Most endpoints require a valid Firebase ID token passed in the `Authorization` header.

### Header Format

```http
Authorization: Bearer <FIREBASE_ID_TOKEN>
```

### How to obtain a token

1.  Sign in using the client SDK (Frontend).
2.  Retrieve the ID Token:
    ```javascript
    const token = await auth().currentUser.getIdToken();
    ```
3.  Include this token in all API requests.

### Permissions

The user represented by the token must be a member of the target Tenant. Permissions are enforced by role-based access control (RBAC) within the tenant.

---

## API Key Authentication

For server-to-server communication or external integrations, you can use an API Key.

### Header Format

```http
x-api-key: <YOUR_API_KEY>
```

### Managing API Keys

You can generate and manage API Keys via the **Tenant Settings > API Keys** section in the Jet Admin dashboard and then use those keys for supported backend endpoints.

> **Note**: API Keys have specific permissions scopes assigned to them. Ensure your key has the necessary permissions for the endpoints you are calling.

---

## Common Errors

| Code | Status | Description |
|------|--------|-------------|
| `USER_AUTH_TOKEN_NOT_FOUND` | 401 | Missing Authorization header |
| `USER_AUTH_TOKEN_EXPIRED` | 401 | Token has expired |
| `INVALID_API_KEY` | 401 | Invalid or inactive API key |
| `PERMISSION_DENIED` | 403 | User/Key does not have required permissions |

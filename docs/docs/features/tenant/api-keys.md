---
id: api-keys
title: API Keys
sidebar_label: API Keys
sidebar_position: 2
description: Generate and manage API keys for programmatic access to Jet Admin.
---

# API Keys Management

![API Keys Demo](/img/placeholder-api-keys.png)

API Keys allow external systems and scripts to programmatically interact with your Jet Admin tenant without requiring an interactive user login.

## Creating an API Key

1. Navigate to **Settings** > **API Keys**.
2. Click **Generate New Key**.
3. Provide a descriptive name for the key.
4. Specify the expiration date and required permissions.
5. Copy the generated key. **Note:** This is the only time the full key will be displayed.

## Using API Keys

Pass the API Key in the `Authorization` header of your HTTP requests:

```bash
curl -X GET "https://your-jet-admin-instance/api/v1/some-endpoint" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "x-tenant-id: YOUR_TENANT_ID"
```

## Security Best Practices

- **Least Privilege**: Only grant the permissions absolutely necessary for the key's intended use case.
- **Expiration**: Set an expiration date for all keys.
- **Rotation**: Rotate production API keys periodically.

### API Reference Stub
- `GET /api/v1/tenants/:tenantID/api-keys` - List API keys
- `POST /api/v1/tenants/:tenantID/api-keys` - Generate a new key

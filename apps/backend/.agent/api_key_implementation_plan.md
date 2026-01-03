# API Key Authentication - Implementation Plan

## Overview

This document outlines the implementation plan for proper API Key authentication with role-based permission checking. The goal is to ensure API keys use their own assigned roles (from `tblAPIKeyRoleMappings`) instead of inheriting the creator's permissions.

## Current Issues

1. **Permission Bypass**: When an API key is used, `req.user` is set to the API key creator. The `checkUserPermissions` middleware then checks the creator's roles instead of the API key's assigned roles.

2. **Missing Auth Context**: Controllers and services only receive `userID` context. When an API key is used, there's no way to distinguish between a direct user action vs an API key action.

3. **Resource Ownership**: Resources created via API keys are attributed to the key's creator, which may or may not be desired behavior.

---

## Implementation Steps

### Phase 1: Add Auth Context Type

#### 1.1 Create Auth Context Type Definitions

**File**: `apps/backend/types/auth.types.js` (NEW)

```javascript
/**
 * @typedef {'USER' | 'API_KEY'} AuthType
 */

/**
 * @typedef {Object} AuthContext
 * @property {AuthType} authType - Type of authentication used
 * @property {Object} user - User object (creator for API keys)
 * @property {string} user.userID - User ID
 * @property {Object|null} apiKey - API key data (null for user auth)
 * @property {string|null} apiKey.apiKeyID - API key ID
 * @property {string|null} apiKey.tenantID - Tenant ID the key belongs to
 */
```

#### 1.2 Modify Auth Middleware

**File**: `apps/backend/modules/auth/auth.middleware.js`

Changes:
- Add `req.authContext` object that contains:
  - `authType`: 'USER' | 'API_KEY'
  - `user`: User object
  - `apiKey`: API key data (when applicable)
- Keep `req.user` for backward compatibility

### Phase 2: API Key Permission Checking

#### 2.1 Add API Key Role/Permission Fetching

**File**: `apps/backend/modules/auth/auth.service.js`

New functions:
- `fetchAPIKeyRolesAndPermissions(apiKeyID)` - Fetches roles from `tblAPIKeyRoleMappings`
- `checkAPIKeyPermissions({ apiKeyID, tenantID, requiredPermissions, requireAll })`

#### 2.2 Modify Permission Middleware

**File**: `apps/backend/modules/auth/auth.middleware.js`

Modify `checkUserPermissions` to:
1. Check `req.authContext.authType`
2. If `'API_KEY'`, call `authService.checkAPIKeyPermissions()`
3. If `'USER'`, use existing `authService.checkUserPermissions()`

---

## Modules Using User Context

### Controllers Passing userID to Services

| Module | Controller File | Methods | Context Usage |
|--------|-----------------|---------|---------------|
| **apiKey** | apiKey.controller.js | getAllAPIKeys, createAPIKey, getAPIKeyByID, updateAPIKeyByID, deleteAPIKeyByID | Logging, service calls |
| **audit** | audit.middleware.js | audit | userID for audit logs |
| **auth** | auth.middleware.js | checkUserPermissions | Permission checking |
| **cronJob** | cronJob.controller.js | All methods | Logging, service calls |
| **dashboard** | dashboard.controller.js | All methods | Logging, service calls, creatorID |
| **dataQuery** | dataQuery.controller.js | All methods | Logging, service calls, creatorID |
| **database** | database.controller.js | All methods | Logging, service calls |
| **databaseNotification** | databaseNotification.controller.js | All methods | Logging, service calls |
| **databaseTable** | databaseTable.controller.js | All methods | Logging, service calls |
| **databaseTrigger** | databaseTrigger.controller.js | All methods | Logging, service calls |
| **datasource** | datasource.controller.js | All methods | Logging, service calls, creatorID |
| **notification** | notification.service.js | getAllUserNotifications, createNotification | userID for notification targeting |
| **tenant** | tenant.controller.js | All methods | Logging, service calls, creatorID |
| **tenantRole** | tenantRole.controller.js | All methods | Logging, service calls |
| **userManagement** | userManagement.controller.js | All methods | Logging, service calls |
| **widget** | widget.controller.js | All methods | Logging, service calls, creatorID |
| **workflow** | workflow.controller.js | All methods | Logging, service calls, creatorID |

### Services Using creatorID (for resource ownership)

| Service File | Functions | Description |
|--------------|-----------|-------------|
| `apiKey.service.js` | createAPIKey | Sets creatorID on new API keys |
| `dashboard.service.js` | createDashboard, cloneDashboard | Sets creatorID on dashboards |
| `dataQuery.service.js` | createDataQuery, createBulkDataQuery, cloneDataQueryByID | Sets creatorID on queries |
| `datasource.service.js` | createDatasource, cloneDatasource | Sets creatorID on datasources |
| `tenant.service.js` | createTenant, joinTenant | Sets creatorID on tenants |
| `widget.service.js` | createWidget, cloneWidgetByID | Sets creatorID on widgets |
| `workflow.service.js` | createWorkflow | Sets creatorID on workflows |

---

## Phase 3: Update Controllers and Services

### 3.1 Create Helper Function for Auth Context

**File**: `apps/backend/utils/auth.context.utils.js` (NEW)

```javascript
/**
 * Extracts auth context from request for use in services
 * @param {import('express').Request} req
 * @returns {import('../types/auth.types').AuthContext}
 */
function getAuthContext(req) {
  return {
    authType: req.authContext?.authType || 'USER',
    userID: req.user?.userID,
    apiKeyID: req.authContext?.apiKey?.apiKeyID || null,
    // For logging purposes
    actorType: req.authContext?.authType || 'USER',
    actorID: req.authContext?.authType === 'API_KEY' 
      ? req.authContext.apiKey.apiKeyID 
      : req.user?.userID,
  };
}

/**
 * Gets the userID to use as creatorID for new resources
 * For API keys, this returns the creator of the API key
 * @param {import('express').Request} req
 * @returns {string}
 */
function getCreatorID(req) {
  // Always use the human user's ID for resource ownership
  return req.user?.userID;
}
```

### 3.2 Update Audit Middleware

**File**: `apps/backend/modules/audit/audit.middleware.js`

Add:
- `apiKeyID` field to log events when API key is used
- `authType` field to distinguish auth method

### 3.3 Service Updates (Optional Enhancement)

Services can optionally accept an `authContext` parameter for enhanced logging:

```javascript
// Before
dataQueryService.createDataQuery({ userID, tenantID, ... })

// After (backward compatible)
dataQueryService.createDataQuery({ 
  userID, 
  tenantID, 
  authContext, // Optional, for enhanced logging
  ... 
})
```

---

## Implementation Checklist

### Core Changes (Required)

- [x] 1. Create `types/auth.types.js` with type definitions
- [x] 2. Create `utils/auth.context.utils.js` with helper functions
- [x] 3. Modify `auth.middleware.js`:
  - [x] 3a. Add `req.authContext` in `authProvider` for both User and API key auth
  - [x] 3b. Update `checkUserPermissions` to handle API key auth
- [x] 4. Add to `auth.service.js`:
  - [x] 4a. `fetchAPIKeyRolesAndPermissions(apiKeyID)`
  - [x] 4b. `checkAPIKeyPermissions()`
- [x] 5. Update `audit.middleware.js` to log auth type and API key ID

### Optional Enhancements

- [x] 6. Update controllers to pass `authContext` to services (for enhanced logging)
  - [x] workflowController
  - [x] dataQueryController
  - [x] datasourceController
  - [x] widgetController
  - [x] dashboardController
  - [x] apiKeyController
  - [x] tenantController
  - [x] cronJobController
  - [x] userManagementController
  - [x] databaseTableController
  - [x] databaseController
  - [x] databaseTriggerController
  - [x] databaseNotificationController
  - [x] tenantRoleController
- [x] 7. Update services to accept and log `authContext`
  - [x] workflowService (with formatAuthContextForLog and createdByApiKeyID)
  - [x] dataQueryService (with createdByApiKeyID)
  - [x] datasourceService (with createdByApiKeyID)
  - [x] widgetService (with createdByApiKeyID)
  - [x] dashboardService (with createdByApiKeyID)
  - [x] tenantService (with createdByApiKeyID)
  - [x] apiKeyService (with createdByApiKeyID)
- [x] 8. Add `createdByApiKeyID` schema field
  - [x] Created SQL migration: `prisma/migrations/add_created_by_api_key_id.sql`
  - [x] Updated Prisma schema with `createdByApiKeyID` on 7 tables:
    - tblDashboards
    - tblDataQueries
    - tblDatasources
    - tblWidgets
    - tblWorkflows
    - tblTenants
    - tblAPIKeys
- [ ] 9. Add API key scope validation (restrict which endpoints accept API keys)

---

## Files to Modify

### New Files
1. `apps/backend/types/auth.types.js`
2. `apps/backend/utils/auth.context.utils.js`

### Modified Files
1. `apps/backend/modules/auth/auth.middleware.js` - Core auth changes
2. `apps/backend/modules/auth/auth.service.js` - API key permission functions
3. `apps/backend/modules/audit/audit.middleware.js` - Enhanced logging

### Files Affected (but no changes needed for MVP)
All controller and service files will continue to work with backward compatibility.

---

## Testing Considerations

1. **API Key with restricted roles**: Create an API key with limited roles, verify it cannot access admin-only endpoints
2. **API Key CRUD operations**: Verify API keys can still perform operations their roles allow
3. **Audit logs**: Verify logs correctly show API key ID when API auth is used
4. **Backward compatibility**: Verify Bearer token auth still works correctly

---

## Migration Notes

- No database changes required
- No breaking changes to existing API contracts
- `req.user` remains available for backward compatibility
- Existing API keys will start using their assigned roles (may change behavior if roles weren't properly configured)


---
id: rbac
title: Role-Based Access Control (RBAC)
sidebar_label: RBAC
sidebar_position: 9
description: How permissions and data visibility are gated within Jet Admin.
---

# Role-Based Access Control (RBAC)

Security is paramount in internal tools. Jet Admin utilizes a robust Role-Based Access Control (RBAC) model to ensure users can only see and execute what they are explicitly authorized to.

## RBAC Model

The RBAC system governs access to resources based on a user's assigned role within a specific Tenant context.

### Entities
Access control applies to the following entities:
- **Tenant:** The top-level workspace or organization.
- **App:** The logical container of tools.
- **Page:** Specific views within an app.
- **Datasource:** The connections to external systems.
- **Query:** The specific executable commands against datasources.
- **Workflow:** Automated backend processes.

### Role Types
By default, Jet Admin implements standard roles, but the system is designed to allow custom role definitions via the `tblTenantRoles` table. Common base roles include:
- **Owner / Admin:** Full read/write access to all resources within the tenant. Can manage users, billing, and global settings.
- **Editor / Developer:** Can create and edit Apps, Pages, Queries, and Workflows. Usually cannot manage billing or tenant settings.
- **Viewer / User:** Read-only access to published Apps. Can view pages and execute authorized queries (e.g., clicking a button to run a query), but cannot edit the query definitions or app layouts.

### Storage
Roles and permissions are stored relationally in the operational PostgreSQL database:
- `tblTenantRoles`: Defines the available roles for a tenant.
- `tblTenantUsers`: Maps a `userID` to a `roleID` within a specific `tenantID`.

## Permission Enforcement

Enforcement happens securely on the backend, with the frontend acting as an immediate, optimistic gatekeeper for UX purposes.

### Server-Side Enforcement (Middleware)
This is the true source of security. Every request to the `/api/v1/*` Express routers passes through authentication and authorization middleware.

1. **Authentication:** Validates the incoming JWT or session cookie to identify the user.
2. **Context Resolution:** Determines the `tenantID` the user is attempting to operate within.
3. **Role Check:** The middleware (`apps/backend/modules/tenantRole/`) checks if the user's role grants permission for the specific HTTP method and resource path.
4. **Datasource Validation:** When a query execution is requested, the engine explicitly checks if the user's role permits executing queries against that specific datasource.

### Client-Side Enforcement
The frontend reads the user's permissions from the global Zustand store (`useAuthStore`). Based on these permissions, it conditionally renders UI elements.
- **Hide Builder:** If a user is a Viewer, the drag-and-drop builder interface, property panels, and code editors are completely hidden.
- **Disable Widgets:** Specific widgets can be configured to be disabled or hidden based on the user's role, preventing them from attempting unauthorized actions.

### Data Visibility & Auditing
- **Filtering:** Prisma queries in the backend are inherently scoped by `tenantID`. Users cannot query metadata for apps or datasources belonging to other tenants.
- **Auditing:** Sensitive actions (like modifying a datasource or deleting a workflow) are logged by the Audit module (`apps/backend/modules/audit`), recording *who* did *what* and *when*. The audit middleware automatically masks sensitive keys (like passwords or tokens) before logging payloads.

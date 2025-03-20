-- Seed Permissions
INSERT INTO "tblPermissions" ("permissionName", "permissionDescription") VALUES
('user:read', 'Read user profile'),
('tenant:list', 'List accessible tenants'),
('tenant:create', 'Create new tenants'),
('tenant:read', 'View tenant details'),
('tenant:update', 'Modify tenant properties'),
('member:list', 'List tenant members'),
('member:add', 'Add new members'),
('member:promote', 'Change member roles'),
('member:remove', 'Remove members'),
('metadata:read', 'View database metadata'),
('schema:create', 'Create new schemas'),
('table:list', 'List tables'),
('table:create', 'Create tables'),
('table:read', 'View table structure'),
('table:update', 'Modify table structure'),
('row:read', 'Read table data'),
('row:update', 'Modify table data'),
('stats:read', 'View table statistics'),
('trigger:list', 'List triggers'),
('trigger:create', 'Create triggers'),
('trigger:read', 'View trigger details'),
('trigger:delete', 'Delete triggers'),
('query:list', 'List saved queries'),
('query:create', 'Create new queries'),
('query:test', 'Test/validate queries'),
('query:read', 'View query details'),
('query:update', 'Modify queries'),
('query:delete', 'Delete queries');

-- Seed Roles
WITH inserted_roles AS (
  INSERT INTO "tblRoles" ("roleName", "roleDescription") VALUES
  ('ADMIN', 'Full access to all tenant operations'),
  ('DATABASE_DEVELOPER', 'Can manage database structure and data'),
  ('DATA_ANALYST', 'Read-only access to data and statistics'),
  ('QUERY_MANAGER', 'Can create and manage saved queries'),
  ('SUPPORT_AGENT', 'Limited access for customer support')
  RETURNING "roleID", "roleName"
)

-- Assign Permissions to Roles
INSERT INTO "tblRolePermissionMappings" ("roleID", "permissionID")
SELECT 
  r."roleID",
  p."permissionID"
FROM 
  inserted_roles r
CROSS JOIN "tblPermissions" p
WHERE r."roleName" = 'ADMIN'

UNION ALL

SELECT
  r."roleID",
  p."permissionID"
FROM 
  inserted_roles r
CROSS JOIN "tblPermissions" p
WHERE r."roleName" = 'DATABASE_DEVELOPER'
  AND p."permissionName" IN (
    'metadata:read',
    'schema:create',
    'table:create',
    'table:read',
    'table:update',
    'row:read',
    'row:update',
    'trigger:create',
    'trigger:read',
    'trigger:delete'
  )

UNION ALL

SELECT
  r."roleID",
  p."permissionID"
FROM 
  inserted_roles r
CROSS JOIN "tblPermissions" p
WHERE r."roleName" = 'DATA_ANALYST'
  AND p."permissionName" IN (
    'metadata:read',
    'table:read',
    'row:read',
    'stats:read',
    'query:read'
  )

UNION ALL

SELECT
  r."roleID",
  p."permissionID"
FROM 
  inserted_roles r
CROSS JOIN "tblPermissions" p
WHERE r."roleName" = 'QUERY_MANAGER'
  AND p."permissionName" IN (
    'query:list',
    'query:create',
    'query:test',
    'query:read',
    'query:update',
    'query:delete'
  )

UNION ALL

SELECT
  r."roleID",
  p."permissionID"
FROM 
  inserted_roles r
CROSS JOIN "tblPermissions" p
WHERE r."roleName" = 'SUPPORT_AGENT'
  AND p."permissionName" IN (
    'tenant:read',
    'member:list',
    'metadata:read',
    'table:read',
    'row:read'
  );
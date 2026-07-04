/**
 * Single source of truth for all permissions in the backend.
 *
 * Derives three artifacts from config/permissions.json:
 *   - P              : frozen {resource, action} descriptors for use in route files
 *   - PERMISSION_MAP : { permissionTitle -> {resource, action} } for Casbin policy sync
 *   - PERMISSIONS_LIST : flat [{ permissionTitle, permissionDescription }] for DB seeding
 *
 * Routes should import { P } and call authorize(P.dataquery.list) etc.
 * tenantRole.service.js imports { PERMISSION_MAP }.
 * seed.js / collect-and-seed-permissions.js import { PERMISSIONS_LIST }.
 */
const permissionsData = require("./permissions.json");

const P = {};
const PERMISSION_MAP = {};
const PERMISSIONS_LIST = [];

for (const [resource, actions] of Object.entries(permissionsData)) {
  P[resource] = {};
  for (const [action, meta] of Object.entries(actions)) {
    P[resource][action] = Object.freeze({ resource, action, title: meta.title });
    PERMISSION_MAP[meta.title] = { resource, action };
    PERMISSIONS_LIST.push({
      permissionTitle: meta.title,
      permissionDescription: meta.description,
    });
  }
  Object.freeze(P[resource]);
}

Object.freeze(P);
Object.freeze(PERMISSION_MAP);
Object.freeze(PERMISSIONS_LIST);

module.exports = { P, PERMISSION_MAP, PERMISSIONS_LIST };

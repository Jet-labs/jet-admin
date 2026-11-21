// File: packages/mcp-server/src/tools/admin.tools.js
/**
 * admin.tools.js — tenant admin resources missing from the original 52 tools.
 *
 * Backend routes (apps/backend/modules):
 *   folders  → tenant.v1.routes.js "/:tenantID/folders" (folder.v1.routes.js)
 *   cronjobs → "/:tenantID/cronjobs" lowercase (cronJob.v1.routes.js)
 *   audit    → "/:tenantID/audit" read-only (audit.v1.routes.js)
 *   apikeys  → "/:tenantID/apikeys" lowercase (apiKey.v1.routes.js)
 *   users    → "/:tenantID/users" (userManagement.v1.routes.js)
 *   roles    → "/:tenantID/roles" + /permissions + /sync-policies (tenantRole.v1.routes.js)
 *   import   → "/:tenantID/import/preview|execute" (bundle.v1.routes.js)
 *   library  → "/:tenantID/widget-library" (widgetLibrary.tenant.v1.routes.js)
 *   tenant   → "/api/v1/tenants/:tenantID" + /ai-config (tenant.v1.routes.js)
 */

import { createApiClient } from "../client.js";
import { safeArray, trimId } from "../utils.js";

export const adminTools = [
  // ─── Folders (5) ──────────────────────────────────────────────────────
  {
    name: "list_folders",
    description:
      "List folders for an entity type.\n\n" +
      "entityType: widget, workflow, dataQuery, cronJob, appPage, listener, datasource.\n" +
      "NOTE: datasource filing requires backend migration 004-add-datasource-folders.sql to be applied; " +
      "if the backend predates it, datasource entityType returns a DB error — file under tags instead.\n\n" +
      "Example: { \"entityType\": \"dataQuery\" }\n\nRelated: create_folder, move_entities_to_folder.",
    inputSchema: {
      type: "object",
      properties: {
        entityType: {
          type: "string",
          enum: ["widget", "workflow", "dataQuery", "cronJob", "appPage", "listener", "datasource"],
          description: "Entity type to list folders for.",
        },
      },
      required: ["entityType"],
    },
    handler: async ({ entityType }, context) => {
      const { folderAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const data = await folderAPI.list({ entityType });
      const folders = safeArray(data, "folders");
      return { folders, totalCount: data?.totalCount ?? folders.length };
    },
  },
  {
    name: "create_folder",
    description: "Create a folder for organizing tenant entities.\n\nExample: { \"entityType\": \"widget\", \"folderTitle\": \"Dashboards\" }\n\nRelated: list_folders, move_entities_to_folder.",
    inputSchema: {
      type: "object",
      properties: {
        entityType: { type: "string", enum: ["widget", "workflow", "dataQuery", "cronJob", "appPage", "listener", "datasource"] },
        folderTitle: { type: "string", description: "Folder name." },
        parentFolderID: { type: "string", description: "Optional parent folder UUID." },
      },
      required: ["entityType", "folderTitle"],
    },
    handler: async ({ entityType, folderTitle, parentFolderID }, context) => {
      const { folderAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return folderAPI.create({ entityType, folderTitle, parentFolderID: parentFolderID ?? null });
    },
  },
  {
    name: "update_folder",
    description: "Rename or re-parent a folder.\n\nRelated: list_folders.",
    inputSchema: {
      type: "object",
      properties: {
        folderID: { type: "string", description: "Folder UUID." },
        folderTitle: { type: "string", description: "Optional new name." },
        parentFolderID: { type: "string", description: "Optional new parent (null = root)." },
      },
      required: ["folderID"],
    },
    handler: async ({ folderID, ...updates }, context) => {
      const { folderAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const id = trimId(folderID, "folderID");
      await folderAPI.update(id, updates);
      return { success: true, folderID: id };
    },
  },
  {
    name: "delete_folder",
    description: "Delete a folder (children promoted, items un-filed).\n\nRelated: list_folders.",
    inputSchema: {
      type: "object",
      properties: { folderID: { type: "string", description: "Folder UUID." } },
      required: ["folderID"],
    },
    handler: async ({ folderID }, context) => {
      const { folderAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      await folderAPI.delete(trimId(folderID, "folderID"));
      return { success: true, deleted: { folderID } };
    },
  },
  {
    name: "move_entities_to_folder",
    description:
      "Move entities into a folder (or root via folderID null).\n\n" +
      "PERMISSIONS: backend requires folder.update PLUS per-entity update (e.g. moving dataQueries needs\n" +
      "dataquery.update on each ID). If a key that created folders gets 403 on move, grant the FolderManager\n" +
      "role (or folder.update + the entity update) to the key's role in Roles, then retry.\n\n" +
      "Example: { \"entityType\": \"dataQuery\", \"entityIDs\": [\"<uuid>\"], \"folderID\": \"<uuid>\" }\n\nRelated: list_folders.",
    inputSchema: {
      type: "object",
      properties: {
        entityType: { type: "string", enum: ["widget", "workflow", "dataQuery", "cronJob", "appPage", "listener", "datasource"] },
        entityIDs: { type: "array", items: { type: "string" }, description: "Entity UUIDs to move." },
        folderID: { type: "string", description: "Target folder UUID (omit/null = root)." },
      },
      required: ["entityType", "entityIDs"],
    },
    handler: async ({ entityType, entityIDs, folderID }, context) => {
      const { folderAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      try {
        return await folderAPI.move({ entityType, entityIDs, folderID: folderID ?? null });
      } catch (err) {
        if (err?.status === 403) {
          err.message = `${err.message} — move requires folder.update + ${entityType}.update on every entityID. ` +
            "Grant both to the API-key role in Roles, then retry. Creating the folder only proves folder.create.";
        }
        throw err;
      }
    },
  },

  // ─── CronJobs (8) ─────────────────────────────────────────────────────
  {
    name: "list_cronJobs",
    description: "List scheduled cron jobs.\n\nExample: { \"search\": \"nightly\" }\n\nRelated: get_cronJob, create_cronJob.",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string", description: "Optional filter." },
        folderID: { type: "string", description: "Optional folder UUID." },
        page: { type: "number", description: "Page (1-based)." },
        pageSize: { type: "number", description: "Results per page (max 100)." },
      },
    },
    handler: async ({ search, folderID, page, pageSize } = {}, context) => {
      const { cronJobAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const data = await cronJobAPI.list({ search, folderID, page, pageSize });
      const cronJobs = safeArray(data, "cronJobs");
      return { cronJobs, totalCount: data?.totalCount ?? cronJobs.length };
    },
  },
  {
    name: "get_cronJob",
    description: "Get a cron job by ID.\n\nRelated: list_cronJobs, update_cronJob.",
    inputSchema: {
      type: "object",
      properties: { cronJobID: { type: "string", description: "Cron job UUID." } },
      required: ["cronJobID"],
    },
    handler: async ({ cronJobID }, context) => {
      const { cronJobAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return cronJobAPI.getById(trimId(cronJobID, "cronJobID"));
    },
  },
  {
    name: "create_cronJob",
    description:
      "Create a scheduled job that runs a workflow on a cron schedule.\n\n" +
      "cronJobSchedule must be a valid cron expression (e.g. '0 2 * * *'). workflowID must exist.\n\n" +
      "Example: { \"cronJobTitle\": \"Nightly digest\", \"cronJobSchedule\": \"0 2 * * *\", \"workflowID\": \"<uuid>\" }\n\n" +
      "Related: list_cronJobs, get_cronJob_history.",
    inputSchema: {
      type: "object",
      properties: {
        cronJobTitle: { type: "string", description: "Job name." },
        cronJobDescription: { type: "string", description: "Optional description." },
        cronJobSchedule: { type: "string", description: "Cron expression." },
        workflowID: { type: "string", description: "Workflow UUID to run." },
        workflowConfig: { type: "object", description: "Optional workflow input config." },
        isDisabled: { type: "boolean", description: "Create disabled." },
      },
      required: ["cronJobTitle", "cronJobSchedule", "workflowID"],
    },
    handler: async ({ cronJobTitle, cronJobDescription, cronJobSchedule, workflowID, workflowConfig, isDisabled }, context) => {
      const { cronJobAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return cronJobAPI.create({
        cronJobTitle, cronJobDescription, cronJobSchedule,
        workflowID: trimId(workflowID, "workflowID"),
        workflowConfig, isDisabled,
      });
    },
  },
  {
    name: "update_cronJob",
    description: "Update a cron job (title, schedule, workflow, disabled flag).\n\nRelated: get_cronJob.",
    inputSchema: {
      type: "object",
      properties: {
        cronJobID: { type: "string", description: "Cron job UUID." },
        cronJobTitle: { type: "string", description: "Optional new title." },
        cronJobSchedule: { type: "string", description: "Optional new cron expression." },
        workflowID: { type: "string", description: "Optional new workflow UUID." },
        isDisabled: { type: "boolean", description: "Enable/disable." },
      },
      required: ["cronJobID"],
    },
    handler: async ({ cronJobID, ...updates }, context) => {
      const { cronJobAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const id = trimId(cronJobID, "cronJobID");
      await cronJobAPI.update(id, updates);
      return { success: true, cronJobID: id };
    },
  },
  {
    name: "delete_cronJob",
    description: "Permanently delete a cron job.\n\nRelated: list_cronJobs.",
    inputSchema: {
      type: "object",
      properties: { cronJobID: { type: "string", description: "Cron job UUID." } },
      required: ["cronJobID"],
    },
    handler: async ({ cronJobID }, context) => {
      const { cronJobAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      await cronJobAPI.delete(trimId(cronJobID, "cronJobID"));
      return { success: true, deleted: { cronJobID } };
    },
  },
  {
    name: "clone_cronJob",
    description: "Clone a cron job with a fresh ID.\n\nRelated: list_cronJobs.",
    inputSchema: {
      type: "object",
      properties: { cronJobID: { type: "string", description: "Cron job UUID." } },
      required: ["cronJobID"],
    },
    handler: async ({ cronJobID }, context) => {
      const { cronJobAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return cronJobAPI.clone(trimId(cronJobID, "cronJobID"));
    },
  },
  {
    name: "get_cronJob_history",
    description: "Get run history for a cron job (paginated).\n\nRelated: list_cronJobs.",
    inputSchema: {
      type: "object",
      properties: {
        cronJobID: { type: "string", description: "Cron job UUID." },
        page: { type: "number", description: "Page (1-based)." },
        pageSize: { type: "number", description: "Results per page." },
      },
      required: ["cronJobID"],
    },
    handler: async ({ cronJobID, page, pageSize }, context) => {
      const { cronJobAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return cronJobAPI.history(trimId(cronJobID, "cronJobID"), { page, pageSize });
    },
  },
  {
    name: "get_cronJob_connection_status",
    description: "Get scheduler connection statuses.\n\nRelated: list_cronJobs.",
    inputSchema: { type: "object", properties: {} },
    handler: async (_args, context) => {
      const { cronJobAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return cronJobAPI.connectionStatus();
    },
  },

  // ─── Audit (2, read-only) ─────────────────────────────────────────────
  {
    name: "list_audit_logs",
    description: "List audit logs (paginated, read-only).\n\nRelated: export_audit_logs.",
    inputSchema: {
      type: "object",
      properties: {
        page: { type: "number", description: "Page (1-based)." },
        pageSize: { type: "number", description: "Results per page." },
      },
    },
    handler: async ({ page, pageSize } = {}, context) => {
      const { auditAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const data = await auditAPI.list({ page, pageSize });
      const logs = safeArray(data, "auditLogs");
      return logs.length || data?.totalCount !== undefined
        ? { auditLogs: logs, totalCount: data?.totalCount ?? logs.length }
        : data;
    },
  },
  {
    name: "export_audit_logs",
    description: "Export audit logs as CSV (full range, no pagination).\n\nRelated: list_audit_logs.",
    inputSchema: { type: "object", properties: {} },
    handler: async (_args, context) => {
      const { auditAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return auditAPI.exportCSV();
    },
  },

  // ─── API Keys (6) ─────────────────────────────────────────────────────
  {
    name: "list_apiKeys",
    description: "List API keys.\n\nRelated: get_apiKey, create_apiKey.",
    inputSchema: { type: "object", properties: {} },
    handler: async (_args, context) => {
      const { apiKeyAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const data = await apiKeyAPI.list();
      const apiKeys = safeArray(data, "apiKeys");
      return { apiKeys, totalCount: data?.totalCount ?? apiKeys.length };
    },
  },
  {
    name: "get_apiKey",
    description: "Get an API key by ID.\n\nRelated: list_apiKeys.",
    inputSchema: {
      type: "object",
      properties: { apiKeyID: { type: "string", description: "API key UUID." } },
      required: ["apiKeyID"],
    },
    handler: async ({ apiKeyID }, context) => {
      const { apiKeyAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return apiKeyAPI.getById(trimId(apiKeyID, "apiKeyID"));
    },
  },
  {
    name: "create_apiKey",
    description: "Create an API key. Pass roleIDs to scope permissions.\n\nRelated: list_apiKeys.",
    inputSchema: {
      type: "object",
      properties: {
        apiKeyTitle: { type: "string", description: "Key name." },
        roleIDs: { type: "array", items: { type: "string" }, description: "Optional role UUIDs." },
      },
      required: ["apiKeyTitle"],
    },
    handler: async ({ apiKeyTitle, roleIDs }, context) => {
      const { apiKeyAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return apiKeyAPI.create({ apiKeyTitle, roleIDs });
    },
  },
  {
    name: "update_apiKey",
    description: "Update an API key (title, roles, disabled flag).\n\nRelated: get_apiKey.",
    inputSchema: {
      type: "object",
      properties: {
        apiKeyID: { type: "string", description: "API key UUID." },
        apiKeyTitle: { type: "string", description: "Optional new name." },
        roleIDs: { type: "array", items: { type: "string" }, description: "Optional role UUIDs." },
        isDisabled: { type: "boolean", description: "Disable/enable." },
      },
      required: ["apiKeyID"],
    },
    handler: async ({ apiKeyID, ...updates }, context) => {
      const { apiKeyAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const id = trimId(apiKeyID, "apiKeyID");
      await apiKeyAPI.update(id, updates);
      return { success: true, apiKeyID: id };
    },
  },
  {
    name: "delete_apiKey",
    description: "Permanently delete an API key.\n\nRelated: list_apiKeys.",
    inputSchema: {
      type: "object",
      properties: { apiKeyID: { type: "string", description: "API key UUID." } },
      required: ["apiKeyID"],
    },
    handler: async ({ apiKeyID }, context) => {
      const { apiKeyAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      await apiKeyAPI.delete(trimId(apiKeyID, "apiKeyID"));
      return { success: true, deleted: { apiKeyID } };
    },
  },
  {
    name: "clone_apiKey",
    description: "Clone an API key.\n\nRelated: list_apiKeys.",
    inputSchema: {
      type: "object",
      properties: { apiKeyID: { type: "string", description: "API key UUID." } },
      required: ["apiKeyID"],
    },
    handler: async ({ apiKeyID }, context) => {
      const { apiKeyAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return apiKeyAPI.clone(trimId(apiKeyID, "apiKeyID"));
    },
  },

  // ─── Users extended (4) — list_tenant_members already exists ───────────
  {
    name: "get_tenant_user",
    description: "Get a tenant user by ID.\n\nRelated: list_tenant_members.",
    inputSchema: {
      type: "object",
      properties: { tenantUserID: { type: "string", description: "Tenant-user UUID." } },
      required: ["tenantUserID"],
    },
    handler: async ({ tenantUserID }, context) => {
      const { userAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return userAPI.getById(trimId(tenantUserID, "tenantUserID"));
    },
  },
  {
    name: "add_user_to_tenant",
    description: "Add a user to the tenant (email invite).\n\nRelated: list_tenant_members.",
    inputSchema: {
      type: "object",
      properties: {
        email: { type: "string", description: "User email." },
        roleIDs: { type: "array", items: { type: "string" }, description: "Optional role UUIDs." },
      },
      required: ["email"],
    },
    handler: async ({ email, roleIDs }, context) => {
      const { userAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return userAPI.add({ email, roleIDs });
    },
  },
  {
    name: "remove_user_from_tenant",
    description: "Remove a user from the tenant.\n\nRelated: list_tenant_members.",
    inputSchema: {
      type: "object",
      properties: { tenantUserID: { type: "string", description: "Tenant-user UUID." } },
      required: ["tenantUserID"],
    },
    handler: async ({ tenantUserID }, context) => {
      const { userAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      await userAPI.remove(trimId(tenantUserID, "tenantUserID"));
      return { success: true, removed: { tenantUserID } };
    },
  },
  {
    name: "update_user_roles",
    description: "Set a tenant user's roles.\n\nRelated: list_tenant_roles, get_tenant_user.",
    inputSchema: {
      type: "object",
      properties: {
        tenantUserID: { type: "string", description: "Tenant-user UUID." },
        roleIDs: { type: "array", items: { type: "string" }, description: "Role UUIDs." },
      },
      required: ["tenantUserID", "roleIDs"],
    },
    handler: async ({ tenantUserID, roleIDs }, context) => {
      const { userAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return userAPI.updateRoles(trimId(tenantUserID, "tenantUserID"), { roleIDs });
    },
  },

  // ─── Roles extended (6) — list_tenant_roles already exists ─────────────
  {
    name: "get_role",
    description: "Get a role by ID.\n\nRelated: list_tenant_roles.",
    inputSchema: {
      type: "object",
      properties: { roleID: { type: "string", description: "Role UUID." } },
      required: ["roleID"],
    },
    handler: async ({ roleID }, context) => {
      const { roleAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return roleAPI.getById(trimId(roleID, "roleID"));
    },
  },
  {
    name: "create_role",
    description: "Create a custom role.\n\nRelated: list_tenant_roles.",
    inputSchema: {
      type: "object",
      properties: {
        roleTitle: { type: "string", description: "Role name." },
        roleDescription: { type: "string", description: "Optional description." },
        permissionIDs: { type: "array", items: { type: "string" }, description: "Optional permission IDs." },
      },
      required: ["roleTitle"],
    },
    handler: async ({ roleTitle, roleDescription, permissionIDs }, context) => {
      const { roleAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return roleAPI.create({ roleTitle, roleDescription, permissionIDs });
    },
  },
  {
    name: "update_role",
    description: "Update a custom role.\n\nRelated: get_role.",
    inputSchema: {
      type: "object",
      properties: {
        roleID: { type: "string", description: "Role UUID." },
        roleTitle: { type: "string", description: "Optional new name." },
        roleDescription: { type: "string", description: "Optional new description." },
        permissionIDs: { type: "array", items: { type: "string" }, description: "Optional permission IDs." },
      },
      required: ["roleID"],
    },
    handler: async ({ roleID, ...updates }, context) => {
      const { roleAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const id = trimId(roleID, "roleID");
      await roleAPI.update(id, updates);
      return { success: true, roleID: id };
    },
  },
  {
    name: "delete_role",
    description: "Delete a custom role.\n\nRelated: list_tenant_roles.",
    inputSchema: {
      type: "object",
      properties: { roleID: { type: "string", description: "Role UUID." } },
      required: ["roleID"],
    },
    handler: async ({ roleID }, context) => {
      const { roleAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      await roleAPI.delete(trimId(roleID, "roleID"));
      return { success: true, deleted: { roleID } };
    },
  },
  {
    name: "list_permissions",
    description: "List all tenant permissions (for role assignment).\n\nRelated: create_role, update_role.",
    inputSchema: { type: "object", properties: {} },
    handler: async (_args, context) => {
      const { roleAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const data = await roleAPI.listPermissions();
      const permissions = safeArray(data, "permissions");
      return { permissions, totalCount: data?.totalCount ?? permissions.length };
    },
  },
  {
    name: "sync_role_policies",
    description: "Re-sync Casbin policies from DB (after PERMISSION_MAP changes).\n\nRelated: list_permissions.",
    inputSchema: { type: "object", properties: {} },
    handler: async (_args, context) => {
      const { roleAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return roleAPI.syncPolicies();
    },
  },

  // ─── Bundle import (2) ────────────────────────────────────────────────
  {
    name: "preview_bundle_import",
    description: "Dry-run a bundle import against the tenant (no writes).\n\nRelated: execute_bundle_import.",
    inputSchema: {
      type: "object",
      properties: { bundle: { type: "object", description: "Export bundle object." } },
      required: ["bundle"],
    },
    handler: async ({ bundle }, context) => {
      const { bundleAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return bundleAPI.previewImport({ bundle });
    },
  },
  {
    name: "execute_bundle_import",
    description: "Execute a bundle import (creates all items with fresh IDs).\n\nRelated: preview_bundle_import.",
    inputSchema: {
      type: "object",
      properties: { bundle: { type: "object", description: "Export bundle object." } },
      required: ["bundle"],
    },
    handler: async ({ bundle }, context) => {
      const { bundleAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return bundleAPI.executeImport({ bundle });
    },
  },

  // ─── Widget Library (5) ───────────────────────────────────────────────
  {
    name: "list_library_widgets",
    description: "List published widget-library entries.\n\nRelated: install_library_widget.",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string", description: "Optional filter." },
        page: { type: "number", description: "Page (1-based)." },
        pageSize: { type: "number", description: "Results per page." },
      },
    },
    handler: async ({ search, page, pageSize } = {}, context) => {
      const { libraryAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const data = await libraryAPI.list({ search, page, pageSize });
      const entries = safeArray(data, "library") ;
      return entries.length || data?.totalCount !== undefined
        ? { entries, totalCount: data?.totalCount ?? entries.length }
        : data;
    },
  },
  {
    name: "publish_widget_to_library",
    description: "Publish a widget bundle to the shared library.\n\nRelated: list_library_widgets.",
    inputSchema: {
      type: "object",
      properties: {
        widgetID: { type: "string", description: "Widget UUID to publish." },
        libraryTitle: { type: "string", description: "Published title." },
        libraryDescription: { type: "string", description: "Optional description." },
      },
      required: ["widgetID"],
    },
    handler: async ({ widgetID, libraryTitle, libraryDescription }, context) => {
      const { libraryAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return libraryAPI.publish({ widgetID: trimId(widgetID, "widgetID"), libraryTitle, libraryDescription });
    },
  },
  {
    name: "preview_library_install",
    description: "Dry-run a library install.\n\nRelated: install_library_widget.",
    inputSchema: {
      type: "object",
      properties: { libraryEntryID: { type: "string", description: "Library entry UUID." } },
      required: ["libraryEntryID"],
    },
    handler: async ({ libraryEntryID }, context) => {
      const { libraryAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return libraryAPI.previewInstall(trimId(libraryEntryID, "libraryEntryID"));
    },
  },
  {
    name: "install_library_widget",
    description: "Install (clone) a published widget bundle into this tenant.\n\nRelated: list_library_widgets.",
    inputSchema: {
      type: "object",
      properties: { libraryEntryID: { type: "string", description: "Library entry UUID." } },
      required: ["libraryEntryID"],
    },
    handler: async ({ libraryEntryID }, context) => {
      const { libraryAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return libraryAPI.install(trimId(libraryEntryID, "libraryEntryID"));
    },
  },
  {
    name: "unpublish_library_widget",
    description: "Unpublish a library entry.\n\nRelated: list_library_widgets.",
    inputSchema: {
      type: "object",
      properties: { libraryEntryID: { type: "string", description: "Library entry UUID." } },
      required: ["libraryEntryID"],
    },
    handler: async ({ libraryEntryID }, context) => {
      const { libraryAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      await libraryAPI.unpublish(trimId(libraryEntryID, "libraryEntryID"));
      return { success: true, unpublished: { libraryEntryID } };
    },
  },

  // ─── Tenant AI config (2) ─────────────────────────────────────────────
  {
    name: "get_tenant_ai_config",
    description: "Get tenant AI config.\n\nRelated: update_tenant_ai_config, get_tenant_info.",
    inputSchema: { type: "object", properties: {} },
    handler: async (_args, context) => {
      const { tenantAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return tenantAPI.getAiConfig();
    },
  },
  {
    name: "update_tenant_ai_config",
    description: "Update tenant AI config.\n\nRelated: get_tenant_ai_config.",
    inputSchema: {
      type: "object",
      properties: { aiConfig: { type: "object", description: "AI config object." } },
      required: ["aiConfig"],
    },
    handler: async ({ aiConfig }, context) => {
      const { tenantAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return tenantAPI.updateAiConfig({ aiConfig });
    },
  },
];

// File: packages/mcp-server/src/tools/iam.tools.js (javascript)
/**
 * iam.tools.js — context-aware, multi-tenant ready
 * Handler signature: async (args, context) where context = { tenantId, apiKey }
 * These are read-only tools — write operations intentionally excluded.
 */

import { createApiClient } from "../client.js";
import { safeArray } from "../utils.js";

export const iamTools = [
  {
    name: "list_tenant_members",
    description:
      "List all members of this Jet Admin tenant.\n\n" +
      "Returns: { members: [{ userID, email, username, role, joinedAt }], totalCount } where role is\n" +
      "'ADMIN', 'MEMBER', or a custom role title.\n\n" +
      "Use this to answer questions like 'who has access to this tenant?', to check whether a specific\n" +
      "user is a member before discussing permissions, or to see who holds ADMIN. Read-only — this tool\n" +
      "cannot modify members or roles; invite/role changes happen in the Jet Admin UI.\n\n" +
      "Example call: {} (no arguments)\n\n" +
      "Related: list_tenant_roles, get_tenant_info.",
    inputSchema: { type: "object", properties: {} },
    handler: async (_args, context) => {
      const { iamAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const data = await iamAPI.listMembers();
      const members = safeArray(data, "users");
      return {
        members: members.map((m) => ({
          userID: m.tblUsers?.userID || m.userID,
          email: m.tblUsers?.email || m.email,
          username: m.tblUsers?.username || m.username,
          role: m.role,
          joinedAt: m.createdAt,
        })),
        totalCount: members.length,
      };
    },
  },

  {
    name: "list_tenant_roles",
    description:
      "List all custom roles defined in this Jet Admin tenant.\n\n" +
      "Returns: { roles: [{ roleID, title, description, createdAt }], totalCount }. Built-in roles\n" +
      "(ADMIN, MEMBER) may not appear here — this lists the tenant's CUSTOM roles with their permission\n" +
      "summaries.\n\n" +
      "Use this before discussing access changes, to check whether a suitable custom role exists, or to\n" +
      "understand the tenant's permission model. Read-only — role creation/assignment happens in the\n" +
      "Jet Admin UI.\n\n" +
      "Example call: {} (no arguments)\n\n" +
      "Related: list_tenant_members, get_tenant_info.",
    inputSchema: { type: "object", properties: {} },
    handler: async (_args, context) => {
      const { iamAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const data = await iamAPI.listRoles();
      const roles = safeArray(data, "roles");
      return {
        roles: roles.map((r) => ({
          roleID: r.roleID,
          title: r.roleTitle,
          description: r.roleDescription,
          createdAt: r.createdAt,
        })),
        totalCount: roles.length,
      };
    },
  },

  {
    name: "get_tenant_info",
    description:
      "Get metadata about this Jet Admin tenant: title, logo, member count, and resource counts.\n\n" +
      "Returns: { tenantID, title, logoUrl, memberCount,\n" +
      "  resourceCounts: { datasources, dataQueries, widgets, appPages, workflows, listeners, cronJobs,\n" +
      "  apiKeys } }.\n\n" +
      "Use this for a fast, cheap orientation at the start of a session — it tells you the tenant's name\n" +
      "and roughly how much is in it WITHOUT fetching full resource lists. When you need actual resource\n" +
      "IDs and titles, follow up with get_tenant_resource_summary (heavier but complete).\n" +
      "This tool also confirms authentication works — a 401 here means the API key is invalid.\n\n" +
      "Example call: {} (no arguments)\n\n" +
      "Related: get_tenant_resource_summary, list_tenant_members.",
    inputSchema: { type: "object", properties: {} },
    handler: async (_args, context) => {
      const { iamAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const data = await iamAPI.getTenant();
      const tenant = data?.tenant || data;
      if (!tenant) throw new Error("Failed to retrieve tenant information.");

      // relationships can be an array or null — guard both cases
      const memberCount = Array.isArray(tenant.relationships)
        ? tenant.relationships.length
        : (tenant.memberCount ?? 0);

      return {
        tenantID: tenant.tenantID,
        title: tenant.tenantTitle,
        logoUrl: tenant.tenantLogoURL,
        memberCount,
        resourceCounts: {
          datasources: tenant.tenantDatasourceCount ?? 0,
          dataQueries: tenant.tenantDataQueryCount ?? 0,
          widgets: tenant.tenantWidgetCount ?? 0,
          appPages: tenant.tenantAppPageCount ?? 0,
          workflows: tenant.tenantWorkflowCount ?? 0,
          listeners: tenant.tenantListenerCount ?? 0,
          cronJobs: tenant.tenantCronJobCount ?? 0,
          apiKeys: tenant.tenantAPIKeyCount ?? 0,
        },
      };
    },
  },
];

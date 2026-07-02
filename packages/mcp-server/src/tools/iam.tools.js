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
      "List all members of this Jet Admin tenant. " +
      "Returns user IDs, emails, primary roles (ADMIN/MEMBER), and custom role assignments. " +
      "Useful for understanding who has access and what permissions they hold.",
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
      "List all custom roles defined in this Jet Admin tenant. " +
      "Each role has a set of permissions that control what resources members can access. " +
      "Use this to understand the permission model before suggesting access changes.",
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
      "Get metadata about this Jet Admin tenant including its title, logo, member count, " +
      "and counts of all resources (datasources, queries, widgets, pages, workflows, listeners). " +
      "Use this to understand the scope of the tenant at the start of a session.",
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
          appPages: tenant.tenantAppPageCount ?? 0,
          dataQueries: tenant.tenantDataQueryCount ?? 0,
          widgets: tenant.tenantWidgetCount ?? 0,
          cronJobs: tenant.tenantCronJobCount ?? 0,
          apiKeys: tenant.tenantAPIKeyCount ?? 0,
        },
      };
    },
  },
];

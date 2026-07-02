/**
 * listener.tools.js — context-aware, multi-tenant ready
 * Handler signature: async (args, context) where context = { tenantId, apiKey }
 */

import { createApiClient } from "../client.js";
import { safeArray, trimId } from "../utils.js";

export const listenerTools = [
  {
    name: "list_listeners",
    description:
      "List all real-time listeners configured in this Jet Admin tenant. " +
      "Listeners enable live data streaming (WebSocket, Kafka, MQTT, SSE, Webhook). " +
      "Use listeners instead of polled queries when the user asks for 'real-time', 'live', or 'streaming' data.",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string", description: "Filter by title." },
        page: { type: "number" },
        pageSize: { type: "number" },
      },
    },
    handler: async ({ search, page, pageSize } = {}, context) => {
      const { listenerAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const data = await listenerAPI.list({ search, page, pageSize });
      const listeners = safeArray(data, "listeners");
      return {
        listeners: listeners.map((l) => ({
          listenerID: l.listenerID,
          title: l.listenerTitle,
          type: l.listenerType,
          datasourceID: l.datasourceID,
          status: l.status,
          createdAt: l.createdAt,
        })),
        totalCount: data?.totalCount ?? listeners.length,
      };
    },
  },

  {
    name: "get_listener",
    description:
      "Get the full configuration of a listener including its pipeline steps (transform, filter, push).",
    inputSchema: {
      type: "object",
      properties: {
        listenerID: { type: "string", description: "The UUID of the listener to retrieve." },
      },
      required: ["listenerID"],
    },
    handler: async ({ listenerID }, context) => {
      const { listenerAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const result = await listenerAPI.getById(trimId(listenerID, "listenerID"));
      if (!result) throw new Error(`Listener not found: ${listenerID}`);
      return result;
    },
  },

  {
    name: "create_listener",
    description:
      "Create a new real-time listener. " +
      "Choose this when the user mentions 'real-time', 'live updates', 'streaming', or 'as it happens'. " +
      "The listener config shape depends on the type:\n" +
      "  websocket: { url, headers? }\n" +
      "  webhook: { path } (Jet Admin generates the inbound URL)\n" +
      "  sse: { url, headers? }",
    inputSchema: {
      type: "object",
      properties: {
        listenerTitle: { type: "string", description: "Human-readable name for the listener." },
        listenerType: {
          type: "string",
          enum: ["websocket", "webhook", "sse", "kafka", "mqtt"],
          description: "Protocol type for the listener.",
        },
        datasourceID: { type: "string", description: "UUID of the associated datasource (if applicable)." },
        listenerConfig: { type: "object", description: "Type-specific connection configuration." },
        pipelineSteps: {
          type: "array",
          description: "Optional list of pipeline transformation/action steps.",
          items: { type: "object" },
        },
      },
      required: ["listenerTitle", "listenerType"],
    },
    handler: async ({ listenerTitle, listenerType, datasourceID, listenerConfig, pipelineSteps }, context) => {
      const { listenerAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return listenerAPI.create({
        listenerTitle,
        listenerType,
        datasourceID: datasourceID ? trimId(datasourceID, "datasourceID") : undefined,
        listenerConfig,
        pipelineSteps: pipelineSteps || [],
      });
    },
  },

  {
    name: "update_listener",
    description: "Update a listener's configuration or pipeline steps.",
    inputSchema: {
      type: "object",
      properties: {
        listenerID: { type: "string", description: "UUID of the listener to update." },
        listenerTitle: { type: "string" },
        listenerConfig: { type: "object" },
        pipelineSteps: { type: "array", items: { type: "object" } },
      },
      required: ["listenerID"],
    },
    handler: async ({ listenerID, ...updates }, context) => {
      const { listenerAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const id = trimId(listenerID, "listenerID");
      const result = await listenerAPI.update(id, updates);
      // Guard: result may be null/undefined depending on API response shape
      return { success: true, listenerID: id, ...(result && typeof result === "object" ? result : {}) };
    },
  },

  {
    name: "delete_listener",
    description: "Delete a listener. The listener will be deactivated first if it is running.",
    inputSchema: {
      type: "object",
      properties: {
        listenerID: { type: "string", description: "UUID of the listener to delete." },
      },
      required: ["listenerID"],
    },
    handler: async ({ listenerID }, context) => {
      const { listenerAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      await listenerAPI.delete(trimId(listenerID, "listenerID"));
      return { success: true, deleted: { listenerID } };
    },
  },

  {
    name: "activate_listener",
    description: "Activate (start) a listener so it begins receiving and processing events.",
    inputSchema: {
      type: "object",
      properties: {
        listenerID: { type: "string", description: "UUID of the listener to activate." },
      },
      required: ["listenerID"],
    },
    handler: async ({ listenerID }, context) => {
      const { listenerAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const id = trimId(listenerID, "listenerID");
      const result = await listenerAPI.activate(id);
      // Guard: result may be null/undefined
      return { success: true, listenerID: id, status: "active", ...(result && typeof result === "object" ? result : {}) };
    },
  },

  {
    name: "deactivate_listener",
    description: "Deactivate (stop) a running listener.",
    inputSchema: {
      type: "object",
      properties: {
        listenerID: { type: "string", description: "UUID of the listener to deactivate." },
      },
      required: ["listenerID"],
    },
    handler: async ({ listenerID }, context) => {
      const { listenerAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const id = trimId(listenerID, "listenerID");
      const result = await listenerAPI.deactivate(id);
      // Guard: result may be null/undefined
      return { success: true, listenerID: id, status: "inactive", ...(result && typeof result === "object" ? result : {}) };
    },
  },
];

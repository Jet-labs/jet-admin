// File: packages/mcp-server/src/tools/listener.tools.js (javascript)
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
      "List real-time listeners configured in this Jet Admin tenant.\n\n" +
      "Returns: { listeners: [{ listenerID, title, type, datasourceID, status, createdAt }], totalCount }.\n" +
      "type is one of: websocket | webhook | sse | kafka | mqtt; status shows whether it is running.\n\n" +
      "Use listeners INSTEAD of polled queries when the user asks for 'real-time', 'live', 'streaming',\n" +
      "or 'as it happens' data. Call this to find an existing listener's ID, check what is running, or\n" +
      "avoid creating duplicates. Prefer get_tenant_resource_summary as the first call of a session.\n\n" +
      "Example call:\n" +
      '  { "search": "payment", "pageSize": 20 }\n\n' +
      "Related: get_listener, create_listener, activate_listener, search_resources.",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string", description: "Optional. Filter by title. Example: 'payment'." },
        page: { type: "number", description: "Page number (1-based). Default 1. Example: 1." },
        pageSize: { type: "number", description: "Results per page (max 100). Default 20. Example: 20." },
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
      "Get the FULL configuration of a listener, including its pipeline steps.\n\n" +
      "Returns: the raw listener object — listenerConfig (connection settings for its type) and\n" +
      "pipelineSteps (the ordered transform/filter/push steps applied to each incoming event).\n\n" +
      "Use this before update_listener so you can send the complete modified config, or as a working\n" +
      "example of pipeline step structure when building a new listener.\n\n" +
      "Example call:\n" +
      '  { "listenerID": "5c6d7e8f-9a0b-4c1d-2e3f-4a5b6c7d8e9f" }\n\n' +
      "Related: update_listener, get_listener_schemas (authoritative config shape).",
    inputSchema: {
      type: "object",
      properties: {
        listenerID: {
          type: "string",
          description: "UUID of the listener. Get it from list_listeners or get_tenant_resource_summary. " +
            "Example: '5c6d7e8f-9a0b-4c1d-2e3f-4a5b6c7d8e9f'.",
        },
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
      "Create a NEW real-time listener.\n\n" +
      "Returns: the created listener object including its new listenerID.\n" +
      "Creation does NOT start the listener — call activate_listener afterwards. The pipeline runs only\n" +
      "while the listener is active.\n\n" +
      "listenerConfig shape by listenerType:\n" +
      "  websocket: { url: 'wss://...', headers?: {...} }\n" +
      "  webhook:   { path: '/my-hook' } — Jet Admin generates the inbound URL; get it from get_listener\n" +
      "             after creation to give to the event source\n" +
      "  sse:       { url: 'https://...', headers?: {...} }\n" +
      "  kafka / mqtt: call get_listener_schemas for the authoritative required fields.\n" +
      "If unsure of any config shape, call get_listener_schemas FIRST.\n\n" +
      "Example call — WebSocket listener with a transform pipeline:\n" +
      '  { "listenerTitle": "Live payments stream",\n' +
      '    "listenerType": "websocket",\n' +
      '    "listenerConfig": { "url": "wss://payments.example.com/feed",\n' +
      '                        "headers": { "Authorization": "Bearer xyz" } },\n' +
      '    "pipelineSteps": [\n' +
      '      { "type": "filter", "config": { "condition": "event.type == \'payment.succeeded\'" } },\n' +
      '      { "type": "transform", "config": { "mapping": { "amount": "event.amount", "id": "event.charge_id" } } } ] }\n' +
      "Example call — inbound webhook:\n" +
      '  { "listenerTitle": "Stripe events", "listenerType": "webhook",\n' +
      '    "listenerConfig": { "path": "/stripe-events" } }\n\n' +
      "After creating: activate_listener → get_listener (to read the generated webhook URL if applicable).\n\n" +
      "Related: get_listener_schemas, activate_listener, update_listener, get_listener.",
    inputSchema: {
      type: "object",
      properties: {
        listenerTitle: {
          type: "string",
          description: "Human-readable name. Example: 'Live payments stream'.",
        },
        listenerType: {
          type: "string",
          enum: ["websocket", "webhook", "sse", "kafka", "mqtt"],
          description: "Protocol type. Pick 'webhook' for event sources that call you (Stripe, GitHub...), " +
            "'websocket'/'sse' to consume an upstream stream. Example: 'websocket'.",
        },
        datasourceID: {
          type: "string",
          description: "Optional. UUID of an associated datasource if the listener feeds one. " +
            "Example: 'd7a1c3e2-4b5f-4c6a-9e8d-1f2a3b4c5d6e'.",
        },
        listenerConfig: {
          type: "object",
          description: "Type-specific connection configuration (see tool description for shapes). " +
            "Example: { url: 'wss://payments.example.com/feed' }.",
        },
        pipelineSteps: {
          type: "array",
          items: { type: "object" },
          description: "Optional ordered steps applied to each event (filter, transform, push...). " +
            "Each step: { type, config }. Use get_listener_schemas / get_listener for the exact step schema.",
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
    description:
      "Update a listener's title, config, or pipeline steps.\n\n" +
      "Returns: { success: true, listenerID, ... }.\n\n" +
      "Send the COMPLETE listenerConfig / pipelineSteps you want — read the current values with\n" +
      "get_listener first and modify them, rather than sending a partial guess. Changes may require\n" +
      "deactivate_listener + activate_listener to take effect on a running listener.\n\n" +
      "Example call — change the upstream URL:\n" +
      '  { "listenerID": "5c6d7e8f-9a0b-4c1d-2e3f-4a5b6c7d8e9f",\n' +
      '    "listenerConfig": { "url": "wss://payments-v2.example.com/feed" } }\n\n' +
      "Related: get_listener, activate_listener, deactivate_listener.",
    inputSchema: {
      type: "object",
      properties: {
        listenerID: {
          type: "string",
          description: "UUID of the listener to update. Example: '5c6d7e8f-9a0b-4c1d-2e3f-4a5b6c7d8e9f'.",
        },
        listenerTitle: { type: "string", description: "Optional. New title. Example: 'Live payments stream v2'." },
        listenerConfig: {
          type: "object",
          description: "Optional. Replacement connection config — complete object, not a partial one.",
        },
        pipelineSteps: {
          type: "array",
          items: { type: "object" },
          description: "Optional. Replacement ordered pipeline steps — complete list, not a partial one.",
        },
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
    description:
      "PERMANENTLY delete a listener. If it is running, it is deactivated first, then removed.\n\n" +
      "Returns: { success: true, deleted: { listenerID } }.\n\n" +
      "The event source will stop receiving events — if a third party (e.g. Stripe) posts to this\n" +
      "listener's webhook URL, that endpoint will stop working. Confirm with the user before deleting.\n\n" +
      "Example call:\n" +
      '  { "listenerID": "5c6d7e8f-9a0b-4c1d-2e3f-4a5b6c7d8e9f" }\n\n' +
      "Related: deactivate_listener (temporary stop without deletion).",
    inputSchema: {
      type: "object",
      properties: {
        listenerID: {
          type: "string",
          description: "UUID of the listener to delete. Example: '5c6d7e8f-9a0b-4c1d-2e3f-4a5b6c7d8e9f'.",
        },
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
    description:
      "START a listener so it begins receiving and processing events.\n\n" +
      "Returns: { success: true, listenerID, status: 'active', ... }.\n\n" +
      "Call this right after create_listener — a newly created listener is NOT running. Use it also to\n" +
      "resume a listener that was stopped with deactivate_listener or that appears 'inactive' in\n" +
      "list_listeners output.\n\n" +
      "Example call:\n" +
      '  { "listenerID": "5c6d7e8f-9a0b-4c1d-2e3f-4a5b6c7d8e9f" }\n\n' +
      "Related: create_listener, deactivate_listener, list_listeners (check status).",
    inputSchema: {
      type: "object",
      properties: {
        listenerID: {
          type: "string",
          description: "UUID of the listener to activate. Example: '5c6d7e8f-9a0b-4c1d-2e3f-4a5b6c7d8e9f'.",
        },
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
    description:
      "STOP a running listener without deleting it.\n\n" +
      "Returns: { success: true, listenerID, status: 'inactive', ... }.\n\n" +
      "Use this for maintenance (e.g. before update_listener changes take effect) or to temporarily stop\n" +
      "event processing. The listener keeps its config and pipeline — resume with activate_listener.\n\n" +
      "Example call:\n" +
      '  { "listenerID": "5c6d7e8f-9a0b-4c1d-2e3f-4a5b6c7d8e9f" }\n\n' +
      "Related: activate_listener, update_listener, delete_listener (permanent removal).",
    inputSchema: {
      type: "object",
      properties: {
        listenerID: {
          type: "string",
          description: "UUID of the listener to deactivate. Example: '5c6d7e8f-9a0b-4c1d-2e3f-4a5b6c7d8e9f'.",
        },
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

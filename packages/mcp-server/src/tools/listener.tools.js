// File: packages/mcp-server/src/tools/listener.tools.js (javascript)
/**
 * listener.tools.js — context-aware, multi-tenant ready
 * Handler signature: async (args, context) where context = { tenantId, apiKey }
 */

import { createApiClient } from "../client.js";
import { safeArray, trimId } from "../utils.js";
import { normalizeAction } from "../validation/listener.js";

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
      "Get a listener plus its normalized pipeline actions.\n\n" +
      "Returns: { listenerID, title, type, status, datasourceID, config, endpointPath, ingress,\n" +
      "  actions:[{actionID,actionType,actionConfig,isEnabled,orderIndex}], folderID }.\n" +
      "The backend raw relation is tblListenerActions; this tool maps it to actions for convenience.\n\n" +
      "Use this before update_listener, to read the generated webhook URL (ingress.webhookUrls), or as a working\n" +
      "example of action config. For action shapes call list_listener_action_types.\n\n" +
      "Example: { \"listenerID\": \"5c6d7e8f-9a0b-4c1d-2e3f-4a5b6c7d8e9f\" }\n\n" +
      "Related: update_listener, list_listener_action_types, validate_listener.",
    inputSchema: {
      type: "object",
      properties: {
        listenerID: {
          type: "string",
          description: "UUID of the listener. Get it from list_listeners or get_tenant_resource_summary.",
        },
      },
      required: ["listenerID"],
    },
    handler: async ({ listenerID }, context) => {
      const { listenerAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const result = await listenerAPI.getById(trimId(listenerID, "listenerID"));
      if (!result) throw new Error(`Listener not found: ${listenerID}`);
      const l = result?.listener || result;
      const actions = (l.tblListenerActions || l.actions || []).map((a) => ({
        actionID: a.actionID,
        actionType: a.actionType,
        actionConfig: a.actionConfig || {},
        isEnabled: a.isEnabled,
        orderIndex: a.orderIndex,
        createdAt: a.createdAt,
      }));
      const webhookUrls = l.ingress?.webhookUrls || [];
      let endpointPath = l.endpointPath ?? null;
      if (!endpointPath && webhookUrls[0]) {
        try { endpointPath = new URL(webhookUrls[0]).pathname; } catch {}
      }
      return {
        listenerID: l.listenerID,
        title: l.listenerTitle,
        description: l.listenerDescription ?? null,
        type: l.listenerType,
        status: l.status,
        datasourceID: l.datasourceID,
        folderID: l.folderID ?? null,
        config: l.listenerConfig || {},
        endpointPath,
        webhookUrls,
        ingress: l.ingress || null,
        actions,
        actionCount: actions.length,
      };
    },
  },

  {
    name: "create_listener",
    description:
      "Create a NEW real-time listener (inactive). A datasourceID of a listener-capable type is REQUIRED.\n\n" +
      "Returns: { success, listenerID, listener, actions, hint }. After creation, add actions with\n" +
      "add_listener_action or pass them in actions[] here (they are created after the listener).\n" +
      "Creation does NOT start the listener — call activate_listener afterwards.\n\n" +
      "listenerConfig by type (get_listener_schemas is authoritative):\n" +
      "  webhook:   { pathSuffix: '/my-hook' }   (ingress.webhookUrls is authoritative; endpointPath may be null)\n" +
      "  websocket: { parseAsJSON: true }         (URL lives on the datasource)\n" +
      "  sse:       { eventTypes?: '', parseAsJSON: true }\n" +
      "  mqtt:      { topics: 'sensors/#', qos: 0 } | kafka: { topic: '...', consumerGroup?: 'jet-listener' }\n\n" +
      "Example: { \"listenerTitle\":\"Stripe events\", \"listenerType\":\"webhook\", \"datasourceID\":\"<webhook-ds-uuid>\",\n" +
      "  \"listenerConfig\":{\"pathSuffix\":\"/stripe-events\"},\n" +
      "  \"actions\":[{\"actionType\":\"transform\",\"actionConfig\":{\"script\":\"return event;\"}}] }\n\n" +
      "Related: list_listener_types, validate_listener, add_listener_action, activate_listener.",
    inputSchema: {
      type: "object",
      properties: {
        listenerTitle: { type: "string", description: "Human-readable name." },
        listenerType: { type: "string", description: "Listener-capable type from list_listener_types (webhook, websocket, sse, kafka, mqtt, postgresql, ...)." },
        datasourceID: { type: "string", description: "REQUIRED. UUID of a datasource of matching type (e.g. webhook datasource)." },
        listenerConfig: { type: "object", description: "Type-specific connection config (prefer pathSuffix for webhook)." },
        transformScript: { type: "string", description: "Optional transform script; equivalent to a transform action with script." },
        actions: { type: "array", items: { type: "object" }, description: "Optional pipeline actions [{actionType,actionConfig}] created after the listener." },
        pipelineSteps: { type: "array", items: { type: "object" }, description: "Legacy alias for actions [{type,config}]." },
      },
      required: ["listenerTitle", "listenerType", "datasourceID"],
    },
    handler: async ({ listenerTitle, listenerType, datasourceID, listenerConfig, transformScript, actions, pipelineSteps }, context) => {
      const { listenerAPI, listenerExtraAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const created = await listenerAPI.create({
        listenerTitle,
        listenerType,
        datasourceID: trimId(datasourceID, "datasourceID"),
        listenerConfig,
        ...(transformScript ? { transformScript } : {}),
      });
      const listener = created?.listener || created;
      const listenerID = listener?.listenerID;
      const added = [];
      for (const raw of actions || pipelineSteps || []) {
        const action = normalizeAction(raw);
        if (!action?.actionType) continue;
        const res = await listenerExtraAPI.addAction(listenerID, {
          actionType: action.actionType,
          actionConfig: action.actionConfig || {},
          ...(action.isEnabled !== undefined ? { isEnabled: action.isEnabled } : {}),
          ...(action.orderIndex !== undefined ? { orderIndex: action.orderIndex } : {}),
        });
        added.push(res?.action || res);
      }
      return {
        success: true,
        listenerID,
        listener,
        actionCount: added.length,
        actions: added,
        hint: "Listener created inactive. Use add_listener_action for more actions, then activate_listener.",
      };
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

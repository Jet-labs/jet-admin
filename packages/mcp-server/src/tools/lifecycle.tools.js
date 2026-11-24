// File: packages/mcp-server/src/tools/lifecycle.tools.js
/**
 * lifecycle.tools.js — clone/export, versions, run history, pipeline actions.
 *
 * Covers backend capabilities the original 52 tools omitted:
 *   - bundle export/clone per resource (datasource, query, widget, appPage, listener, workflow)
 *   - appPage version history + restore
 *   - workflow instances list/test/stop/widget-data + data-collection (human-in-the-loop)
 *   - listener actions CRUD + connection status
 *   - datasource generic proxy (full ALLOWED_ACTIONS matrix, not just schema/sample)
 */

import { createApiClient } from "../client.js";
import { trimId, safeArray } from "../utils.js";
import { normalizeAction } from "../validation/listener.js";

export const lifecycleTools = [
  // ─── Clone / Export (12) ────────────────────────────────────────────
  {
    name: "clone_datasource",
    description: "Clone a datasource with a fresh ID.\n\nRelated: export_datasource, list_datasources.",
    inputSchema: { type: "object", properties: { datasourceID: { type: "string", description: "Datasource UUID." } }, required: ["datasourceID"] },
    handler: async ({ datasourceID }, context) => {
      const { bundleAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return bundleAPI.cloneDatasource(trimId(datasourceID, "datasourceID"));
    },
  },
  {
    name: "export_datasource",
    description: "Export a datasource as a bundle object.\n\nRelated: clone_datasource, preview_bundle_import.",
    inputSchema: { type: "object", properties: { datasourceID: { type: "string", description: "Datasource UUID." } }, required: ["datasourceID"] },
    handler: async ({ datasourceID }, context) => {
      const { bundleAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return bundleAPI.exportDatasource(trimId(datasourceID, "datasourceID"));
    },
  },
  {
    name: "clone_query",
    description:
      "Clone a saved query. Returns the new dataQueryID (the backend clone endpoint does not return it; this tool diffs the list).\n\nRelated: export_query, get_query.",
    inputSchema: { type: "object", properties: { dataQueryID: { type: "string", description: "Query UUID." } }, required: ["dataQueryID"] },
    handler: async ({ dataQueryID }, context) => {
      const { bundleAPI, queryAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const id = trimId(dataQueryID, "dataQueryID");
      const before = await queryAPI.list({ pageSize: 100 });
      const beforeIDs = new Set(safeArray(before, "dataQueries").map((q) => q.dataQueryID));
      const source = safeArray(before, "dataQueries").find((q) => q.dataQueryID === id);
      await bundleAPI.cloneQuery(id);
      const after = await queryAPI.list({ pageSize: 100 });
      const created = safeArray(after, "dataQueries").filter((q) => !beforeIDs.has(q.dataQueryID));
      const match = created.find((q) => source?.dataQueryTitle && String(q.dataQueryTitle || "").includes(source.dataQueryTitle)) || created[0];
      return {
        success: true,
        dataQueryID: match?.dataQueryID || null,
        dataQueryTitle: match?.dataQueryTitle || null,
        sourceDataQueryID: id,
        hint: match?.dataQueryID ? "Use get_query on the new ID to verify options." : "Clone succeeded but the new ID could not be identified; call list_queries.",
      };
    },
  },
  {
    name: "export_query",
    description: "Export a query as a bundle object.\n\nRelated: clone_query.",
    inputSchema: { type: "object", properties: { dataQueryID: { type: "string", description: "Query UUID." } }, required: ["dataQueryID"] },
    handler: async ({ dataQueryID }, context) => {
      const { bundleAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return bundleAPI.exportQuery(trimId(dataQueryID, "dataQueryID"));
    },
  },
  {
    name: "clone_widget",
    description: "Clone a widget.\n\nRelated: export_widget.",
    inputSchema: { type: "object", properties: { widgetID: { type: "string", description: "Widget UUID." } }, required: ["widgetID"] },
    handler: async ({ widgetID }, context) => {
      const { bundleAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return bundleAPI.cloneWidget(trimId(widgetID, "widgetID"));
    },
  },
  {
    name: "export_widget",
    description: "Export a widget as a bundle object.\n\nRelated: clone_widget.",
    inputSchema: { type: "object", properties: { widgetID: { type: "string", description: "Widget UUID." } }, required: ["widgetID"] },
    handler: async ({ widgetID }, context) => {
      const { bundleAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return bundleAPI.exportWidget(trimId(widgetID, "widgetID"));
    },
  },
  {
    name: "clone_app_page",
    description: "Clone an app page.\n\nRelated: export_app_page.",
    inputSchema: { type: "object", properties: { appPageID: { type: "string", description: "App page UUID." } }, required: ["appPageID"] },
    handler: async ({ appPageID }, context) => {
      const { bundleAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return bundleAPI.cloneAppPage(trimId(appPageID, "appPageID"));
    },
  },
  {
    name: "export_app_page",
    description: "Export an app page as a bundle object.\n\nRelated: clone_app_page.",
    inputSchema: { type: "object", properties: { appPageID: { type: "string", description: "App page UUID." } }, required: ["appPageID"] },
    handler: async ({ appPageID }, context) => {
      const { bundleAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return bundleAPI.exportAppPage(trimId(appPageID, "appPageID"));
    },
  },
  {
    name: "clone_listener",
    description: "Clone a listener.\n\nRelated: export_listener.",
    inputSchema: { type: "object", properties: { listenerID: { type: "string", description: "Listener UUID." } }, required: ["listenerID"] },
    handler: async ({ listenerID }, context) => {
      const { bundleAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return bundleAPI.cloneListener(trimId(listenerID, "listenerID"));
    },
  },
  {
    name: "export_listener",
    description: "Export a listener as a bundle object.\n\nRelated: clone_listener.",
    inputSchema: { type: "object", properties: { listenerID: { type: "string", description: "Listener UUID." } }, required: ["listenerID"] },
    handler: async ({ listenerID }, context) => {
      const { bundleAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return bundleAPI.exportListener(trimId(listenerID, "listenerID"));
    },
  },
  {
    name: "clone_workflow",
    description: "Clone a workflow.\n\nRelated: export_workflow.",
    inputSchema: { type: "object", properties: { workflowID: { type: "string", description: "Workflow UUID." } }, required: ["workflowID"] },
    handler: async ({ workflowID }, context) => {
      const { bundleAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return bundleAPI.cloneWorkflow(trimId(workflowID, "workflowID"));
    },
  },
  {
    name: "export_workflow",
    description: "Export a workflow as a bundle object.\n\nRelated: clone_workflow.",
    inputSchema: { type: "object", properties: { workflowID: { type: "string", description: "Workflow UUID." } }, required: ["workflowID"] },
    handler: async ({ workflowID }, context) => {
      const { bundleAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return bundleAPI.exportWorkflow(trimId(workflowID, "workflowID"));
    },
  },

  // ─── App page versions (3) ──────────────────────────────────────────
  {
    name: "list_app_page_versions",
    description: "List version history for an app page.\n\nRelated: get_app_page, restore_app_page_version.",
    inputSchema: {
      type: "object",
      properties: {
        appPageID: { type: "string", description: "App page UUID." },
        page: { type: "number", description: "Page (1-based)." },
        pageSize: { type: "number", description: "Results per page." },
      },
      required: ["appPageID"],
    },
    handler: async ({ appPageID, page, pageSize }, context) => {
      const { appPageVersionAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return appPageVersionAPI.list(trimId(appPageID, "appPageID"), { page, pageSize });
    },
  },
  {
    name: "get_app_page_version",
    description: "Get a single app page version.\n\nRelated: list_app_page_versions.",
    inputSchema: {
      type: "object",
      properties: {
        appPageID: { type: "string", description: "App page UUID." },
        versionID: { type: "string", description: "Version UUID." },
      },
      required: ["appPageID", "versionID"],
    },
    handler: async ({ appPageID, versionID }, context) => {
      const { appPageVersionAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return appPageVersionAPI.getById(trimId(appPageID, "appPageID"), trimId(versionID, "versionID"));
    },
  },
  {
    name: "restore_app_page_version",
    description: "Restore an app page to a prior version (update-gated).\n\nRelated: list_app_page_versions.",
    inputSchema: {
      type: "object",
      properties: {
        appPageID: { type: "string", description: "App page UUID." },
        versionID: { type: "string", description: "Version UUID." },
      },
      required: ["appPageID", "versionID"],
    },
    handler: async ({ appPageID, versionID }, context) => {
      const { appPageVersionAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return appPageVersionAPI.restore(trimId(appPageID, "appPageID"), trimId(versionID, "versionID"));
    },
  },

  // ─── Workflow runs extended (6) ─────────────────────────────────────
  {
    name: "list_workflow_instances",
    description:
      "List workflow run history for the tenant (filter by workflowID/status).\n\n" +
      "Example: { \"workflowID\": \"<uuid>\", \"pageSize\": 20 }\n\nRelated: get_workflow_instance, execute_workflow.",
    inputSchema: {
      type: "object",
      properties: {
        workflowID: { type: "string", description: "Optional workflow UUID filter." },
        status: { type: "string", description: "Optional status filter." },
        page: { type: "number", description: "Page (1-based)." },
        pageSize: { type: "number", description: "Results per page." },
      },
    },
    handler: async ({ workflowID, status, page, pageSize } = {}, context) => {
      const { workflowExtraAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return workflowExtraAPI.listInstances({ workflowID, status, page, pageSize });
    },
  },
  {
    name: "test_workflow",
    description:
      "Test-run a workflow WITHOUT saving (in-memory nodes/edges).\n\n" +
      "Pass full nodes/edges like create_workflow plus optional inputValues.\n\nRelated: execute_workflow, create_workflow.",
    inputSchema: {
      type: "object",
      properties: {
        nodes: { type: "array", items: { type: "object" }, description: "Workflow nodes." },
        edges: { type: "array", items: { type: "object" }, description: "Workflow edges." },
        inputValues: { type: "object", description: "Optional run inputs." },
      },
      required: ["nodes", "edges"],
    },
    handler: async ({ nodes, edges, inputValues }, context) => {
      const { workflowExtraAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return workflowExtraAPI.test({ nodes, edges, inputValues });
    },
  },
  {
    name: "stop_workflow_instance",
    description: "Stop and delete a test workflow instance.\n\nRelated: list_workflow_instances, test_workflow.",
    inputSchema: {
      type: "object",
      properties: { instanceID: { type: "string", description: "Instance UUID." } },
      required: ["instanceID"],
    },
    handler: async ({ instanceID }, context) => {
      const { workflowExtraAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return workflowExtraAPI.stopInstance(trimId(instanceID, "instanceID"));
    },
  },
  {
    name: "get_workflow_widget_data",
    description: "Get run status with processed widget data.\n\nRelated: get_workflow_instance.",
    inputSchema: {
      type: "object",
      properties: { instanceID: { type: "string", description: "Instance UUID." } },
      required: ["instanceID"],
    },
    handler: async ({ instanceID }, context) => {
      const { workflowExtraAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return workflowExtraAPI.widgetData(trimId(instanceID, "instanceID"));
    },
  },
  {
    name: "get_data_collection_request",
    description: "Get a human-in-the-loop data-collection request.\n\nRelated: submit_data_collection_request.",
    inputSchema: {
      type: "object",
      properties: { collectionRequestID: { type: "string", description: "Collection request UUID." } },
      required: ["collectionRequestID"],
    },
    handler: async ({ collectionRequestID }, context) => {
      const { workflowExtraAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return workflowExtraAPI.getDataCollection(trimId(collectionRequestID, "collectionRequestID"));
    },
  },
  {
    name: "submit_data_collection_request",
    description:
      "Submit (resume) a pending data-collection or approval request.\n\n" +
      "Pass the form values DIRECTLY in formData (e.g. { name:'Ada', age:36 } or { decision:'approve', comment:'ok' }).\n" +
      "The tool wraps them as { submittedData: ... } for the backend; do not pre-wrap. Required fields must match\n" +
      "the request's collectionConfig.formSchema (Ajv validation).\n\n" +
      "Returns: { success, collectionRequestID, driver, delivery }. Re-read the instance to confirm COMPLETED and\n" +
      "the output variable (e.g. ctx.collectedData or ctx.approval).\n\n" +
      "Related: get_data_collection_request, get_workflow_instance, validate_form_schema.",
    inputSchema: {
      type: "object",
      properties: {
        collectionRequestID: { type: "string", description: "Collection request UUID." },
        formData: { type: "object", description: "Raw submitted values, e.g. {name:'Ada',age:36}." },
      },
      required: ["collectionRequestID"],
    },
    handler: async ({ collectionRequestID, formData }, context) => {
      const { workflowExtraAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const raw = formData || {};
      // Accept both the documented raw formData and a legacy pre-wrapped
      // { submittedData: {...} } payload, then send exactly one wrapper.
      const submittedData = raw && typeof raw === "object" && raw.submittedData && Object.keys(raw).length === 1
        ? raw.submittedData
        : raw;
      return workflowExtraAPI.submitDataCollection(trimId(collectionRequestID, "collectionRequestID"), { submittedData });
    },
  },

  // ─── Listener actions + status (4) ──────────────────────────────────
  {
    name: "get_listener_connection_status",
    description: "Get listener connection statuses.\n\nRelated: list_listeners.",
    inputSchema: { type: "object", properties: {} },
    handler: async (_args, context) => {
      const { listenerExtraAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return listenerExtraAPI.connectionStatus();
    },
  },
  {
    name: "add_listener_action",
    description:
      "Add an action to a listener pipeline.\n\n" +
      "The backend shape is { actionType, actionConfig, isEnabled?, orderIndex? }. Do NOT send {type,config}:\n" +
      "it is rejected with actionType/actionConfig required. Valid actionType values and config keys:\n" +
      "  transform          { script }\n" +
      "  trigger_workflow   { workflowID, inputValues }\n" +
      "  trigger_query      { dataQueryID, inputValues }\n" +
      "  save_to_buffer     { bufferName, retentionPolicy, maxEvents, maxAgeHours }\n" +
      "  push_to_app_page   { appPageID, channelName, maxArrayLength }\n" +
      "You may pass them either nested under action:{...} or flat. Use list_listener_action_types and validate_listener first.\n\n" +
      "Example: { \"listenerID\":\"<uuid>\", \"actionType\":\"transform\", \"actionConfig\":{\"script\":\"return event;\"} }\n\n" +
      "Related: update_listener_action, delete_listener_action, validate_listener.",
    inputSchema: {
      type: "object",
      properties: {
        listenerID: { type: "string", description: "Listener UUID." },
        action: { type: "object", description: "Optional action object (nested form)." },
        actionType: { type: "string", description: "transform | trigger_workflow | trigger_query | save_to_buffer | push_to_app_page." },
        actionConfig: { type: "object", description: "Type-specific config." },
        isEnabled: { type: "boolean", description: "Default true." },
        orderIndex: { type: "number", description: "Execution order; default 0." },
      },
      required: ["listenerID"],
    },
    handler: async ({ listenerID, action, actionType, actionConfig, isEnabled, orderIndex }, context) => {
      const { listenerExtraAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const normalized = normalizeAction({
        ...(action || {}),
        ...(actionType !== undefined ? { actionType } : {}),
        ...(actionConfig !== undefined ? { actionConfig } : {}),
        ...(isEnabled !== undefined ? { isEnabled } : {}),
        ...(orderIndex !== undefined ? { orderIndex } : {}),
      });
      if (!normalized?.actionType) {
        throw Object.assign(new Error("actionType is required (or pass action:{actionType,actionConfig})."), { code: "ACTION_TYPE_REQUIRED" });
      }
      const res = await listenerExtraAPI.addAction(trimId(listenerID, "listenerID"), {
        actionType: normalized.actionType,
        actionConfig: normalized.actionConfig || {},
        ...(normalized.isEnabled !== undefined ? { isEnabled: normalized.isEnabled } : {}),
        ...(normalized.orderIndex !== undefined ? { orderIndex: normalized.orderIndex } : {}),
      });
      const created = res?.action || res;
      return {
        success: true,
        listenerID,
        actionID: created?.actionID || null,
        action: created,
        hint: "Use get_listener to verify the pipeline order/config.",
      };
    },
  },
  {
    name: "update_listener_action",
    description:
      "Update a listener pipeline action. Accepts the same {actionType,actionConfig} shape as add_listener_action,\n" +
      "either nested under action:{...} or flat. Returns {success,actionID,action}.\n\nRelated: add_listener_action, get_listener.",
    inputSchema: {
      type: "object",
      properties: {
        listenerID: { type: "string", description: "Listener UUID." },
        actionID: { type: "string", description: "Action UUID." },
        action: { type: "object", description: "Optional replacement action object (nested form)." },
        actionType: { type: "string", description: "Optional new actionType." },
        actionConfig: { type: "object", description: "Optional new config." },
        isEnabled: { type: "boolean", description: "Optional enabled flag." },
        orderIndex: { type: "number", description: "Optional order." },
      },
      required: ["listenerID", "actionID"],
    },
    handler: async ({ listenerID, actionID, action, actionType, actionConfig, isEnabled, orderIndex }, context) => {
      const { listenerExtraAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const normalized = normalizeAction({
        ...(action || {}),
        ...(actionType !== undefined ? { actionType } : {}),
        ...(actionConfig !== undefined ? { actionConfig } : {}),
        ...(isEnabled !== undefined ? { isEnabled } : {}),
        ...(orderIndex !== undefined ? { orderIndex } : {}),
      });
      const payload = {};
      if (normalized?.actionType !== undefined) payload.actionType = normalized.actionType;
      if (normalized?.actionConfig !== undefined) payload.actionConfig = normalized.actionConfig;
      if (normalized?.isEnabled !== undefined) payload.isEnabled = normalized.isEnabled;
      if (normalized?.orderIndex !== undefined) payload.orderIndex = normalized.orderIndex;
      const res = await listenerExtraAPI.updateAction(
        trimId(listenerID, "listenerID"), trimId(actionID, "actionID"), payload
      );
      const updated = res?.action || res;
      return { success: true, listenerID, actionID, action: updated, hint: "Use get_listener to verify." };
    },
  },
  {
    name: "delete_listener_action",
    description: "Delete a listener pipeline action.\n\nRelated: add_listener_action.",
    inputSchema: {
      type: "object",
      properties: {
        listenerID: { type: "string", description: "Listener UUID." },
        actionID: { type: "string", description: "Action UUID." },
      },
      required: ["listenerID", "actionID"],
    },
    handler: async ({ listenerID, actionID }, context) => {
      const { listenerExtraAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      await listenerExtraAPI.deleteAction(trimId(listenerID, "listenerID"), trimId(actionID, "actionID"));
      return { success: true, deleted: { listenerID, actionID } };
    },
  },

  // ─── Datasource generic proxy (1) ───────────────────────────────────
  {
    name: "datasource_proxy",
    description:
      "Invoke ANY allowed datasource proxy action (full ALLOWED_ACTIONS matrix).\n\n" +
      "SQL types support: getSchema, getSampleData, testConnection, runQuery, execute. " +
      "MongoDB: getSchema, getSampleData, testConnection, execute. " +
      "GoogleSheets: listSpreadsheets, listSheets, previewData, readSheet, testConnection. " +
      "ExcelCSV: previewData, getColumns, testConnection. REST: testConnection, execute.\n\n" +
      "Prefer typed wrappers (get_datasource_schema, get_datasource_sample_data, test_datasource_connection) " +
      "when they fit; use this for runQuery/execute and plugin-specific actions.\n\n" +
      "Example: { \"datasourceID\": \"<uuid>\", \"action\": \"runQuery\", \"params\": { \"sql\": \"SELECT 1\" } }",
    inputSchema: {
      type: "object",
      properties: {
        datasourceID: { type: "string", description: "Datasource UUID." },
        action: { type: "string", description: "Proxy action name." },
        params: { type: "object", description: "Action params." },
      },
      required: ["datasourceID", "action"],
    },
    handler: async ({ datasourceID, action, params }, context) => {
      const { datasourceProxyAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return datasourceProxyAPI.invoke(trimId(datasourceID, "datasourceID"), action, params || {});
    },
  },
];

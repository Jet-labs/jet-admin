// File: packages/mcp-server/src/tools/workflow.tools.js (javascript)
/**
 * workflow.tools.js — context-aware, multi-tenant ready
 * Handler signature: async (args, context) where context = { tenantId, apiKey }
 *
 * FIELD MAPPING NOTE:
 *   The Prisma model `tblWorkflows` uses:
 *     title       (NOT workflowTitle)
 *     isDisabled  (NOT workflowStatus — there is no workflowStatus column)
 *   The backend controller accepts: { title, nodes, edges, workflowOptions }
 *   Do NOT send workflowTitle/workflowDescription to the API.
 */

import { createApiClient } from "../client.js";
import { safeArray, trimId } from "../utils.js";

export const workflowTools = [
  {
    name: "list_workflows",
    description:
      "List workflows in this Jet Admin tenant.\n\n" +
      "Returns: { workflows: [{ workflowID, title, status, createdAt }], totalCount } where status is\n" +
      "'active' or 'inactive' (derived from the backend's isDisabled flag).\n\n" +
      "Use this to find an existing workflow's ID, check what exists before creating a new one, or to\n" +
      "find inactive workflows the user may want activated. Prefer get_tenant_resource_summary as the\n" +
      "first call of a session.\n\n" +
      "Example call:\n" +
      '  { "search": "refund", "pageSize": 20 }\n\n' +
      "Related: get_workflow, create_workflow, execute_workflow, search_resources.",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string", description: "Optional. Filter by title. Example: 'refund'." },
        page: { type: "number", description: "Page number (1-based). Default 1. Example: 1." },
        pageSize: { type: "number", description: "Results per page (max 100). Default 20. Example: 20." },
      },
    },
    handler: async ({ search, page, pageSize } = {}, context) => {
      const { workflowAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const data = await workflowAPI.list({ search, page, pageSize });
      // DB field is `title` (not `workflowTitle`); status derived from `isDisabled` boolean
      const workflows = safeArray(data, "workflows");
      return {
        workflows: workflows.map((w) => ({
          workflowID: w.workflowID,
          title: w.title ?? "(untitled)",
          status: w.isDisabled ? "inactive" : "active",
          createdAt: w.createdAt,
        })),
        totalCount: data?.totalCount ?? workflows.length,
      };
    },
  },

  {
    name: "get_workflow",
    description:
      "Get the FULL definition of a workflow — its nodes and edges (execution DAG).\n\n" +
      "Returns: the raw workflow object including nodes (each { id, type, data }) and edges\n" +
      "(each { id, source, target, ... }).\n\n" +
      "Use this when:\n" +
      "  - You need to modify a workflow — read nodes/edges here, modify, then send the complete arrays\n" +
      "    to update_workflow\n" +
      "  - You want a working example of node/edge structure before building a new workflow\n" +
      "  - Diagnosing why a workflow misbehaves (check node configs and branching conditions)\n\n" +
      "Example call:\n" +
      '  { "workflowID": "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d" }\n\n' +
      "Related: update_workflow, get_workflow_schema (authoritative node schema), get_workflow_instance.",
    inputSchema: {
      type: "object",
      properties: {
        workflowID: {
          type: "string",
          description: "UUID of the workflow. Get it from list_workflows or get_tenant_resource_summary. " +
            "Example: '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d'.",
        },
      },
      required: ["workflowID"],
    },
    handler: async ({ workflowID }, context) => {
      const { workflowAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const w = await workflowAPI.getById(trimId(workflowID, "workflowID"));
      if (!w) throw new Error(`Workflow not found: ${workflowID}`);
      return w;
    },
  },

  {
    name: "create_workflow",
    description:
      "Create a NEW workflow from a DAG definition.\n\n" +
      "Returns: the created workflow object including its new workflowID.\n" +
      "The workflow is saved but NOT executed — call execute_workflow to run it.\n\n" +
      "Structure:\n" +
      "  nodes: [{ id: 'n1', type: '<nodeType>', data: { ...typeSpecificConfig } }, ...]\n" +
      "  edges: [{ id: 'e1', source: 'n1', target: 'n2', ... }, ...] — execution flows source → target.\n\n" +
      "IMPORTANT:\n" +
      "  - Call get_workflow_schema FIRST to get the valid node types and each node's data shape —\n" +
      "    guessing node structures is the most common cause of validation errors.\n" +
      "  - To run a query as a step, a 'runQuery'-style node references a saved query's dataQueryID —\n" +
      "    create the query first with create_query.\n" +
      "  - A linear workflow needs one node plus edges chaining each node to the next.\n\n" +
      "Example call — run a saved query, then notify via HTTP:\n" +
      '  { "workflowTitle": "Notify on new refunds",\n' +
      '    "workflowDescription": "Runs hourly: fetches new refunds and posts to Slack.",\n' +
      '    "nodes": [\n' +
      '      { "id": "n1", "type": "runQuery",\n' +
      '        "data": { "dataQueryID": "9f8b7a6c-5d4e-4f3a-2b1c-0d9e8f7a6b5c",\n' +
      '                  "inputValues": { "status": "refunded" } } },\n' +
      '      { "id": "n2", "type": "httpRequest",\n' +
      '        "data": { "method": "POST", "url": "https://hooks.slack.com/services/XXX",\n' +
      '                  "body": { "text": "New refunds detected" } } } ],\n' +
      '    "edges": [ { "id": "e1", "source": "n1", "target": "n2" } ] }\n\n' +
      "Typical flow: create_query (if needed) → create_workflow → execute_workflow → get_workflow_instance.\n\n" +
      "Related: get_workflow_schema, execute_workflow, get_workflow, update_workflow, delete_workflow.",
    inputSchema: {
      type: "object",
      properties: {
        workflowTitle: {
          type: "string",
          description: "Human-readable workflow name. Example: 'Notify on new refunds'.",
        },
        workflowDescription: {
          type: "string",
          description: "Optional. What the workflow does and when it should run. " +
            "Example: 'Runs hourly: fetches new refunds and posts to Slack.'",
        },
        nodes: {
          type: "array",
          items: { type: "object" },
          description: "Workflow steps. Each node: { id, type, data }. Get valid types and data shapes from " +
            "get_workflow_schema. Example: [{ id: 'n1', type: 'runQuery', data: { dataQueryID: '...' } }].",
        },
        edges: {
          type: "array",
          items: { type: "object" },
          description: "Execution order between nodes. Each edge: { id, source, target }. " +
            "Example: [{ id: 'e1', source: 'n1', target: 'n2' }].",
        },
        inputParams: {
          type: "array",
          items: { type: "object" },
          description: "Optional. Parameters the workflow accepts at trigger time, exposed to App Pages " +
            "and execute_workflow. Example: [{ name: 'orderID', type: 'string' }].",
        },
      },
      required: ["workflowTitle", "nodes", "edges"],
    },
    handler: async ({ workflowTitle, workflowDescription, nodes, edges, inputParams }, context) => {
      const { workflowAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      // Backend expects `title` (not workflowTitle) and `workflowOptions` for extra metadata
      const result = await workflowAPI.create({
        title: workflowTitle,
        nodes: nodes || [],
        edges: edges || [],
        workflowOptions: {
          description: workflowDescription,
          inputParams: inputParams || [],
        },
      });
      return result;
    },
  },

  {
    name: "update_workflow",
    description:
      "Update a workflow's title, description, nodes, or edges.\n\n" +
      "Returns: { success: true, workflowID }.\n\n" +
      "When changing the DAG, send the COMPLETE nodes and edges arrays (modified version of what\n" +
      "get_workflow returns) — nodes/edges are replaced, not merged. Call get_workflow_schema for valid\n" +
      "node shapes before constructing new nodes.\n\n" +
      "Example call — append a second step:\n" +
      '  { "workflowID": "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d",\n' +
      '    "nodes": [ { "id": "n1", "type": "runQuery", "data": { "dataQueryID": "9f8b..." } },\n' +
      '               { "id": "n2", "type": "httpRequest", "data": { "method": "POST", "url": "..." } } ],\n' +
      '    "edges": [ { "id": "e1", "source": "n1", "target": "n2" } ] }\n\n' +
      "Related: get_workflow (read current definition first), get_workflow_schema, execute_workflow.",
    inputSchema: {
      type: "object",
      properties: {
        workflowID: {
          type: "string",
          description: "UUID of the workflow to update. Example: '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d'.",
        },
        workflowTitle: { type: "string", description: "Optional. New title. Example: 'Refund notifier v2'." },
        workflowDescription: {
          type: "string",
          description: "Optional. New description. Example: 'Runs on schedule: fetches refunds and posts to Slack.'",
        },
        nodes: {
          type: "array",
          items: { type: "object" },
          description: "Optional. Replacement node list — complete array, not a partial one.",
        },
        edges: {
          type: "array",
          items: { type: "object" },
          description: "Optional. Replacement edge list — complete array, not a partial one.",
        },
      },
      required: ["workflowID"],
    },
    handler: async ({ workflowID, workflowTitle, workflowDescription, nodes, edges }, context) => {
      const { workflowAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const id = trimId(workflowID, "workflowID");
      // Backend expects `title` (not workflowTitle)
      const updates = {};
      if (workflowTitle !== undefined)      updates.title = workflowTitle;
      if (workflowDescription !== undefined) updates.workflowOptions = { description: workflowDescription };
      if (nodes !== undefined)               updates.nodes = nodes;
      if (edges !== undefined)               updates.edges = edges;
      await workflowAPI.update(id, updates);
      return { success: true, workflowID: id };
    },
  },

  {
    name: "delete_workflow",
    description:
      "PERMANENTLY delete a workflow AND its entire execution history.\n\n" +
      "Returns: { success: true, deleted: { workflowID } }.\n\n" +
      "DESTRUCTIVE and irreversible — past runs and their logs are gone too. Any App Page button or\n" +
      "trigger referencing this workflow will break. Confirm with the user before deleting.\n\n" +
      "Example call:\n" +
      '  { "workflowID": "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d" }\n\n' +
      "Related: update_workflow, list_workflows.",
    inputSchema: {
      type: "object",
      properties: {
        workflowID: {
          type: "string",
          description: "UUID of the workflow to delete. Example: '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d'.",
        },
      },
      required: ["workflowID"],
    },
    handler: async ({ workflowID }, context) => {
      const { workflowAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      await workflowAPI.delete(trimId(workflowID, "workflowID"));
      return { success: true, deleted: { workflowID } };
    },
  },

  {
    name: "execute_workflow",
    description:
      "Trigger an ASYNC execution of a workflow and return immediately.\n\n" +
      "Returns: the execution instance info including instanceID (e.g. { instanceID: 'inst_...' }).\n" +
      "The workflow runs in the background — ALWAYS follow up with get_workflow_instance (poll until\n" +
      "status is 'COMPLETED' or 'FAILED') to learn the outcome and see the execution log on failure.\n\n" +
      "inputValues must provide a value for each inputParam the workflow declares (see create_workflow).\n\n" +
      "Example call:\n" +
      '  { "workflowID": "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d",\n' +
      '    "inputValues": { "orderID": "ord_12345" } }\n' +
      "Then poll:\n" +
      '  { "instanceID": "<instanceID from the response>" }\n\n' +
      "Related: get_workflow_instance, create_workflow, list_workflows.",
    inputSchema: {
      type: "object",
      properties: {
        workflowID: {
          type: "string",
          description: "UUID of the workflow to execute. Example: '1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d'.",
        },
        inputValues: {
          type: "object",
          description: "Values for the workflow's declared input params. Example: { orderID: 'ord_12345' }.",
        },
      },
      required: ["workflowID"],
    },
    handler: async ({ workflowID, inputValues = {} }, context) => {
      const { workflowAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      return workflowAPI.execute(trimId(workflowID, "workflowID"), { inputValues });
    },
  },

  {
    name: "get_workflow_instance",
    description:
      "Get the status and execution log of a workflow run.\n\n" +
      "Returns: { status: 'COMPLETED'|'FAILED'|'RUNNING'|..., log: [ ...per-step execution entries ] }.\n" +
      "On FAILED, the log entries show which node errored and why.\n\n" +
      "Poll this after execute_workflow: check the status; if 'RUNNING', wait briefly and call again.\n" +
      "Stop as soon as status is 'COMPLETED' or 'FAILED' — do not poll forever.\n\n" +
      "Example call:\n" +
      '  { "instanceID": "inst_9a8b7c6d5e4f" }\n\n' +
      "Related: execute_workflow (returns the instanceID).",
    inputSchema: {
      type: "object",
      properties: {
        instanceID: {
          type: "string",
          description: "Instance ID returned by execute_workflow. Example: 'inst_9a8b7c6d5e4f'.",
        },
      },
      required: ["instanceID"],
    },
    handler: async ({ instanceID }, context) => {
      const { workflowAPI } = createApiClient(context.tenantId, context.apiKey, context.bearerToken);
      const result = await workflowAPI.getInstance(trimId(instanceID, "instanceID"));
      if (!result) throw new Error(`Workflow instance not found: ${instanceID}`);
      return result;
    },
  },
];

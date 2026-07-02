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
      "List all workflows in this Jet Admin tenant. " +
      "Returns workflow IDs, titles, and statuses. " +
      "Check this before creating a new workflow — a suitable one may already exist.",
    inputSchema: {
      type: "object",
      properties: {
        search: { type: "string", description: "Optional title filter." },
        page: { type: "number" },
        pageSize: { type: "number" },
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
      "Get the full configuration of a workflow, including its nodes and edges (DAG). " +
      "Nodes represent steps (run query, send email, transform data, etc.). " +
      "Edges define execution order and branching conditions.",
    inputSchema: {
      type: "object",
      properties: {
        workflowID: { type: "string", description: "The UUID of the workflow to retrieve." },
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
      "Create a new workflow from a DAG definition. " +
      "Nodes are individual steps; edges define execution order. " +
      "Common node types: 'runQuery', 'condition', 'transform', 'sendEmail', 'httpRequest', 'setVariable'. " +
      "The workflow is saved but not executed — use execute_workflow to run it.",
    inputSchema: {
      type: "object",
      properties: {
        workflowTitle: { type: "string", description: "Human-readable workflow name." },
        workflowDescription: { type: "string", description: "Optional description (stored in workflowOptions)." },
        nodes: {
          type: "array",
          description: "Array of workflow node objects. Each node: { id, type, data: { config } }",
          items: { type: "object" },
        },
        edges: {
          type: "array",
          description: "Array of edge objects. Each edge: { id, source, target, condition? }",
          items: { type: "object" },
        },
        inputParams: {
          type: "array",
          description: "Input parameters the workflow accepts at trigger time.",
          items: { type: "object" },
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
      return {
        workflowID: result?.workflowID,
        title: result?.title ?? workflowTitle,
        createdAt: result?.createdAt,
      };
    },
  },

  {
    name: "update_workflow",
    description: "Update a workflow's title, description, nodes, or edges.",
    inputSchema: {
      type: "object",
      properties: {
        workflowID: { type: "string", description: "UUID of the workflow to update." },
        workflowTitle: { type: "string", description: "New title for the workflow." },
        workflowDescription: { type: "string", description: "New description (stored in workflowOptions)." },
        nodes: { type: "array", items: { type: "object" } },
        edges: { type: "array", items: { type: "object" } },
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
      "Permanently delete a workflow and all its execution history. " +
      "WARNING: Confirm with the user before deleting.",
    inputSchema: {
      type: "object",
      properties: {
        workflowID: { type: "string", description: "UUID of the workflow to delete." },
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
      "Trigger an async execution of a workflow and return the instanceID immediately. " +
      "Poll get_workflow_instance until status is 'COMPLETED' or 'FAILED'.",
    inputSchema: {
      type: "object",
      properties: {
        workflowID: { type: "string", description: "UUID of the workflow to execute." },
        inputValues: { type: "object", description: "Input parameter values for this execution run." },
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
      "Get the current status and execution log of a workflow run instance. " +
      "Poll this after execute_workflow until status is 'COMPLETED' or 'FAILED'.",
    inputSchema: {
      type: "object",
      properties: {
        instanceID: { type: "string", description: "The instance ID returned by execute_workflow." },
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

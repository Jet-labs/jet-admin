/**
 * Workflow graph validation performed at save/test time.
 *
 * Structural checks (node type, ID shape) live in the Zod validator, but
 * cross-resource ownership requires database access and therefore belongs in
 * the service layer.
 */

const { NODE_TYPE } = require("@jet-admin/workflow-nodes-logic");
const { prisma } = require("../../config/prisma.config");
const { assertTenantReferences } = require("../../utils/tenantReference.util");

const ALLOWED_NODE_TYPES = new Set(Object.values(NODE_TYPE));

function invalidGraph(message, details = {}) {
  const error = new Error(message);
  error.name = "InvalidWorkflowGraphError";
  error.code = "INVALID_WORKFLOW_GRAPH";
  error.statusCode = 400;
  error.details = details;
  return error;
}

/**
 * Validate node types and tenant ownership of query/sub-workflow references.
 *
 * @param {object} params
 * @param {string} params.tenantID
 * @param {Array<object>} params.nodes - React Flow nodes as accepted by the API
 * @throws {Error} with statusCode 400 on invalid input
 */
async function validateWorkflowGraph({ tenantID, nodes }) {
  if (nodes === undefined) return;
  if (!Array.isArray(nodes)) {
    throw invalidGraph("nodes must be an array");
  }

  const dataQueryIDs = [];
  const workflowIDs = [];

  nodes.forEach((node, index) => {
    if (!node || typeof node !== "object") {
      throw invalidGraph(`nodes[${index}] must be an object`);
    }

    const nodeType = node.type ?? node.nodeType;
    if (!ALLOWED_NODE_TYPES.has(nodeType)) {
      throw invalidGraph(
        `nodes[${index}].type "${nodeType}" is not a supported workflow node type`,
        { index, nodeType, allowed: [...ALLOWED_NODE_TYPES] }
      );
    }

    const nodeData = node.data ?? node.nodeConfig ?? {};

    if (nodeType === NODE_TYPE.DATA_QUERY && nodeData.dataQueryID) {
      dataQueryIDs.push(nodeData.dataQueryID);
    }
    if (nodeType === NODE_TYPE.SUB_WORKFLOW && nodeData.childWorkflowID) {
      workflowIDs.push(nodeData.childWorkflowID);
    }
  });

  await assertTenantReferences({ tenantID, dataQueryIDs, workflowIDs });
}

/**
 * Find tenant-owned resources that would be left dangling by deleting a
 * workflow. Used to turn an opaque Prisma FK error into a clear 409.
 */
async function findWorkflowReferences({ tenantID, workflowID }) {
  const [cronJobs, appPages, widgets, listenerActions, subWorkflowNodes] = await Promise.all([
    prisma.tblCronJobs.findMany({
      where: { tenantID, workflowID },
      select: { cronJobID: true, cronJobTitle: true },
    }),
    prisma.tblAppPages.findMany({
      where: { tenantID },
      select: { appPageID: true, appPageTitle: true, appPageConfig: true },
    }),
    prisma.tblWidgets.findMany({
      where: { tenantID },
      select: { widgetID: true, widgetTitle: true, widgetConfig: true },
    }),
    prisma.tblListenerActions.findMany({
      where: { actionType: "trigger_workflow", tblListeners: { tenantID } },
      select: {
        actionID: true,
        listenerID: true,
        actionConfig: true,
        tblListeners: { select: { listenerTitle: true } },
      },
    }),
    prisma.tblWorkflowNodes.findMany({
      where: { nodeType: "subWorkflow", tblWorkflows: { tenantID } },
      select: {
        nodeID: true,
        workflowID: true,
        nodeConfig: true,
        tblWorkflows: { select: { title: true } },
      },
    }),
  ]);

  const referencingAppPages = appPages.filter((page) => {
    const sources = Array.isArray(page.appPageConfig?.dataSources)
      ? page.appPageConfig.dataSources
      : [];
    return sources.some(
      (source) => source?.type === "workflow" && String(source.workflowID) === String(workflowID)
    );
  });

  const referencingWidgets = widgets.filter((widget) => {
    const events = widget.widgetConfig?.events;
    if (!events || typeof events !== "object") return false;
    return Object.values(events).some(
      (actions) =>
        Array.isArray(actions) &&
        actions.some(
          (action) =>
            action?.actionType === "TRIGGER_WORKFLOW" &&
            String(action.config?.workflowID) === String(workflowID)
        )
    );
  });

  const referencingListeners = listenerActions.filter(
    (action) => String(action.actionConfig?.workflowID) === String(workflowID)
  );

  const referencingWorkflows = subWorkflowNodes.filter(
    (node) => String(node.nodeConfig?.childWorkflowID) === String(workflowID)
  );

  return {
    cronJobs,
    appPages: referencingAppPages,
    widgets: referencingWidgets,
    listenerActions: referencingListeners,
    workflows: referencingWorkflows,
    total:
      cronJobs.length +
      referencingAppPages.length +
      referencingWidgets.length +
      referencingListeners.length +
      referencingWorkflows.length,
  };
}

module.exports = {
  validateWorkflowGraph,
  findWorkflowReferences,
  ALLOWED_NODE_TYPES,
};

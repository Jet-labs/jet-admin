/**
 * executeNode — Single abstraction for ALL node types
 * This is the ONLY entry point Temporal activities and tests should use.
 * Lives in @jet-admin/workflow-nodes-logic so both backend and worker share one implementation.
 *
 * @param {object} params
 * @param {object} params.node — { id, type, data } (React Flow node)
 * @param {object} params.context — workflow context (ctx)
 * @param {object} [params.helpers] — { resolveTemplate, tenantID, instanceID, workflowID, nodeID }
 * @param {object} [params.services] — injected backend services (required for dataQuery)
 * @returns {Promise<{output:object, nextHandle:string, suspended?:boolean, queueDelay?:number}>}
 */
import { NODE_TYPE } from '../constants.js';
import { executeStart } from '../handlers/start.js';
import { executeEnd } from '../handlers/end.js';
import { executeJavascript } from '../handlers/javascript.js';
import { executeCondition } from '../handlers/condition.js';
import { executeDelay } from '../handlers/delay.js';
import { executeDataCollection } from '../handlers/dataCollection.js';
import { executeDataQuery } from '../handlers/dataQuery.js';
import { executeLoop } from '../handlers/loop.js';
import { executeSubWorkflow } from '../handlers/subWorkflow.js';
import { executeSwitch } from '../handlers/switch.js';
import { executeApproval } from '../handlers/approval.js';
import { executeFanout } from '../handlers/fanout.js';
import { executeJoin } from '../handlers/join.js';

const HANDLER_MAP = {
  [NODE_TYPE.START]: executeStart,
  [NODE_TYPE.END]: executeEnd,
  [NODE_TYPE.JAVASCRIPT]: executeJavascript,
  [NODE_TYPE.CONDITION]: executeCondition,
  [NODE_TYPE.SWITCH]: executeSwitch,
  [NODE_TYPE.DELAY]: executeDelay,
  [NODE_TYPE.DATA_COLLECTION]: executeDataCollection,
  [NODE_TYPE.APPROVAL]: executeApproval,
  [NODE_TYPE.FANOUT]: executeFanout,
  [NODE_TYPE.JOIN]: executeJoin,
  [NODE_TYPE.DATA_QUERY]: executeDataQuery,
  [NODE_TYPE.LOOP]: executeLoop,
  [NODE_TYPE.SUB_WORKFLOW]: executeSubWorkflow,
};

export async function executeNode({ node, context = {}, helpers = {}, services = {} }) {
  if (!node || !node.type) throw new Error('executeNode: node.type is required');
  const handler = HANDLER_MAP[node.type];
  if (!handler) throw new Error(`No handler found for node type: ${node.type}`);

  const nodeConfig = node.data ?? {};
  // Normalize helpers.nodeID to node.id if not provided
  const enrichedHelpers = { ...helpers, nodeID: helpers.nodeID || node.id, workflowID: helpers.workflowID };

  // DataQuery and SubWorkflow need services injection
  if (node.type === NODE_TYPE.DATA_QUERY || node.type === NODE_TYPE.SUB_WORKFLOW) {
    return handler(nodeConfig, context, enrichedHelpers, services);
  }
  // All other handlers share (nodeConfig, context, helpers)
  return handler(nodeConfig, context, enrichedHelpers);
}

export { HANDLER_MAP };

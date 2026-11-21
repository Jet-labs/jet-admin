const path = require('path');
const vm = require('vm');
const { buildSync } = require('esbuild');
const { applyWorkflowConfigToNodes } = require('../../modules/workflow/temporal/workflowConfig');
const compiled = buildSync({
  entryPoints: [path.resolve(__dirname, '../../modules/workflow/temporal/workflows/dslWorkflow.js')],
  bundle: true, write: false, format: 'cjs', platform: 'node', external: ['@temporalio/workflow'],
}).outputFiles[0].text;
const logicBundle = buildSync({
  entryPoints: [path.resolve(__dirname, '../../../../packages/workflow-nodes-logic/src/index.js')],
  bundle: true, write: false, format: 'cjs', platform: 'node', packages: 'external',
}).outputFiles[0].text;
const logic = { exports: {} };
new Function('require', 'module', 'exports', logicBundle)(require, logic, logic.exports);

async function runGraph({ nodes, edges, initialContext = {}, repaired = true, onWait, onExecute, onProgress, onSleep, workflowConfig = {}, services = {}, helpers = {} }) {
  const handlers = new Map(), requests = new Map(), progress = [], terminal = [];
  let now = Date.now();
  class WorkflowDate extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  }
  const signal = (name, payload) => handlers.get(name)?.(payload);
  const activities = {
    emitProgressActivity: async data => { progress.push(data); await onProgress?.(data); },
    emitWorkflowCompletedActivity: async data => { terminal.push(data); },
    executeNodeActivity: async data => {
      const override = await onExecute?.({ ...data, signal });
      if (override !== undefined) return override;
      return logic.exports.executeNode({ node: data.node, context: data.context, services,
        helpers: { ...helpers, nodeID: data.node.id, workflowID: 'isolated-workflow', instanceID: 'isolated-instance', tenantID: 'isolated-tenant' } });
    },
    createDataCollectionRequestActivity: async data => {
      const collectionRequestID = `request-${requests.size + 1}`;
      requests.set(collectionRequestID, { ...data, collectionRequestID, status: 'PENDING' });
      return { collectionRequestID };
    },
    resolveDataCollectionRequestActivity: async ({ collectionRequestID, expire }) => {
      const request = requests.get(collectionRequestID);
      if (request.status === 'SUBMITTED') request.status = 'COMPLETED';
      else if (expire && request.status === 'PENDING') request.status = 'EXPIRED';
      return { status: request.status, submittedData: request.submittedData };
    },
  };
  const temporal = {
    proxyActivities: () => activities, patched: () => repaired,
    defineSignal: name => name, setHandler: (name, handler) => handlers.set(name, handler),
    condition: async (predicate, timeout) => {
      if (predicate()) return true;
      if (onWait) await onWait({ predicate, timeout, requests, signal, advance: ms => { now += ms; } });
      else if (timeout !== undefined) now += timeout;
      else throw new Error('Unbounded test wait has no submitter');
      return Boolean(predicate());
    },
    sleep: async ms => { now += ms; await onSleep?.({ ms, signal }); },
    ApplicationFailure: { nonRetryable: message => new Error(message) },
    CancellationScope: { nonCancellable: fn => fn() },
  };
  const module = { exports: {} };
  vm.runInNewContext(compiled, {
    module, exports: module.exports, require: name => name === '@temporalio/workflow' ? temporal : require(name),
    Date: WorkflowDate, console,
  });
  let result, error;
  try {
    result = await module.exports.dslInterpreterWorkflow({
      nodes: applyWorkflowConfigToNodes(nodes, workflowConfig), edges, initialContext,
      instanceID: 'isolated-instance', tenantID: 'isolated-tenant', workflowID: 'isolated-workflow', workflowConfig,
    });
  } catch (caught) { error = caught; }
  return { result, error, requests: [...requests.values()], progress, terminal };
}
module.exports = { runGraph, executeNode: logic.exports.executeNode };

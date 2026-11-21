/** Actual DSL + handlers + persistence/progress/finalization source.
 * Infrastructure is an isolated in-memory Prisma/socket/Temporal transport shim.
 * This is NOT live Postgres/Redis/Temporal verification and touches no app data.
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const { buildSync } = require('esbuild');
const root = path.resolve(__dirname, '../../..');
const quiet = { log() {} };

function load(relative, mocks = {}, bundle = false) {
  const filename = path.join(root, relative);
  const code = bundle
    ? buildSync({ entryPoints: [filename], bundle: true, packages: 'external', write: false, format: 'cjs', platform: 'node' }).outputFiles[0].text
    : fs.readFileSync(filename, 'utf8');
  const module = { exports: {} }, localRequire = createRequire(filename);
  vm.runInNewContext(code, {
    module, exports: module.exports, require: name => Object.hasOwn(mocks, name) ? mocks[name] : localRequire(name),
    console, Date, setTimeout, clearTimeout, Buffer,
  }, { filename });
  return module.exports;
}

const logic = load('packages/workflow-nodes-logic/src/index.js', {}, true);
const { applyWorkflowConfigToNodes } = require('../modules/workflow/temporal/workflowConfig');
const constants = require('../constants');
const N = (id, type, data = {}) => ({ id, type, data });
const E = (source, target, sourceHandle = 'output') => ({ source, target, sourceHandle });

async function scenario({ nodes, edges, services = {}, socketFailure = false }) {
  const logs = [], notifications = [], instances = new Map();
  let sequence = 0n;
  const append = async ({ data }) => {
    const row = { ...data, eventSequence: ++sequence, logID: String(999999 - Number(sequence)), createdAt: new Date() };
    logs.push(row);
    return row;
  };
  const prisma = {
    $transaction: async fn => fn(prisma),
    tblWorkflowInstances: {
      create: async ({ data }) => { const row = { ...data, instanceID: 'isolated-run', finalContext: null }; instances.set(row.instanceID, row); return row; },
      findUnique: async ({ where }) => instances.get(where.instanceID),
      updateMany: async ({ where, data }) => {
        const row = instances.get(where.instanceID);
        if (!row || !where.status.in.includes(row.status)) return { count: 0 };
        Object.assign(row, data);
        return { count: 1 };
      },
    },
    tblWorkflowInstanceLogs: {
      create: append,
      upsert: async ({ where, create }) => logs.find(row => row.instanceID === where.instanceID_eventKey.instanceID && row.eventKey === where.instanceID_eventKey.eventKey) || append({ data: create }),
      findMany: async ({ where, orderBy }) => {
        const rows = logs.filter(row => row.instanceID === where.instanceID && (!where.eventType?.in || where.eventType.in.includes(row.eventType)));
        assert.equal(orderBy.eventSequence, 'asc');
        return rows.sort((a, b) => a.eventSequence < b.eventSequence ? -1 : 1);
      },
    },
    tblWorkflowDataCollectionRequests: { updateMany: async () => ({ count: 0 }) },
  };
  const { stateManager } = load('apps/backend/modules/workflow/workflowEngine/stateManager.js', {
    '../../../config/prisma.config': { prisma }, '../../../utils/logger': quiet,
  });
  const socketIO = { sockets: { adapter: { rooms: new Map() } }, to: () => ({ emit: (event, data) => {
    if (socketFailure && event === constants.SOCKET_EMIT_EVENTS.WORKFLOW_STATUS_UPDATE) throw new Error('isolated socket outage');
    notifications.push({ event, data });
  } }) };
  const shared = {
    '../../workflowEngine/stateManager': { stateManager },
    '../../../../config/socket.io': { socketIO },
    '../../../widget/widgetWorkflowBridge': { widgetWorkflowBridge: { emitContextUpdate() {}, emitWorkflowStatus() {} } },
    '../../../../utils/logger': quiet,
  };
  const { emitProgressActivity } = load('apps/backend/modules/workflow/temporal/activities/emitProgress.js', shared);
  const { emitWorkflowCompletedActivity } = load('apps/backend/modules/workflow/temporal/activities/emitCompleted.js', shared);
  const activities = {
    executeNodeActivity: args => logic.executeNode({ ...args, services }),
    emitProgressActivity, emitWorkflowCompletedActivity,
    createDataCollectionRequestActivity: () => { throw new Error('Human-input transport is outside these scenarios'); },
  };
  const temporal = {
    proxyActivities: () => activities, defineSignal: name => name, setHandler() {},
    condition: async predicate => Boolean(predicate()), sleep: async () => {},
    ApplicationFailure: { nonRetryable: message => new Error(message) }, CancellationScope: { nonCancellable: fn => fn() },
  };
  const { dslInterpreterWorkflow } = load('apps/backend/modules/workflow/temporal/workflows/dslWorkflow.js', { '@temporalio/workflow': temporal }, true);
  const { instance, initialContext } = await stateManager.createInstance({ workflowID: 'isolated-workflow', tenantID: 'isolated-tenant' });
  const live = await dslInterpreterWorkflow({ nodes: applyWorkflowConfigToNodes(nodes, {}), edges, instanceID: instance.instanceID, initialContext, tenantID: 'isolated-tenant', workflowID: 'isolated-workflow' });
  const persisted = await stateManager.assembleContext(instance.instanceID);
  return { live, persisted, instance, notifications, logs };
}

async function main() {
  const results = [];
  const linear = data => ({ nodes: [N('s', 'start'), N('j', 'javascript', data), N('e', 'end', { outputParameters: [{ name: 'answer', sourceVariable: '{{ctx.jsResult}}' }] })], edges: [E('s', 'j'), E('j', 'e', 'success')] });
  const normal = await scenario(linear({ code: 'return 42;' }));
  assert.equal(normal.live.jsResult, 42);
  assert.equal(normal.persisted.jsResult, 42);
  assert.equal(normal.persisted.output.answer, 42);
  assert.equal(normal.instance.status, 'COMPLETED');
  results.push('default JavaScript output flows through DSL, End, final snapshot and replay');

  const disabled = await scenario(linear({ code: 'throw new Error("disabled code must never execute")', isDisabled: true }));
  assert.equal(disabled.instance.status, 'COMPLETED');
  assert.equal(disabled.persisted.jsResult, null);
  assert.equal(disabled.persisted.__node_j.output.skipped, true);
  results.push('disabled user code is bypassed and downstream End still executes');

  const merged = await scenario({
    nodes: [N('s', 'start'), N('child', 'subWorkflow', { childWorkflowID: 'child-wf', mergeOutputs: true }), N('e', 'end')],
    edges: [E('s', 'child'), E('child', 'e', 'success')],
    services: { runSubWorkflow: async () => ({ status: 'COMPLETED', output: 7, contextSnapshot: { input: { forbidden: true }, answer: 99 } }) },
  });
  assert.equal(merged.live.answer, 99);
  assert.equal(merged.persisted.answer, 99);
  assert.equal(merged.persisted.subResult, 7);
  assert.equal(merged.persisted.input.forbidden, undefined);
  results.push('opt-in child output merge preserves both named output and parent input isolation');

  const failedEnd = await scenario({ nodes: [N('s', 'start'), N('e', 'end', { status: 'failure' })], edges: [E('s', 'e')] });
  assert.equal(failedEnd.instance.status, 'FAILED');
  assert.deepEqual(Object.keys(failedEnd.persisted.output), []);
  results.push('failure End commits failed run and authoritative final context');

  const offline = await scenario({ ...linear({ code: 'return 5;' }), socketFailure: true });
  assert.equal(offline.instance.status, 'COMPLETED');
  assert.equal(offline.persisted.output.answer, 5);
  results.push('terminal socket outage cannot erase committed completion or final output');

  const deadEnd = await scenario({ nodes: [N('s', 'start'), N('unreachable', 'end')], edges: [] });
  assert.equal(deadEnd.notifications.filter(row => row.event === constants.SOCKET_EMIT_EVENTS.WORKFLOW_STATUS_UPDATE).length, 1);
  results.push('legacy duplicate finalization attempts produce only one terminal notification');

  console.log(JSON.stringify({ scope: 'Actual source with isolated infrastructure shims; no live services', passed: results.length, scenarios: results }, null, 2));
}
main().catch(error => { console.error(error); process.exitCode = 1; });

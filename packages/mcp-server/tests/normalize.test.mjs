import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeWorkflow, summarizeInstance, compactSchemaMap, dedupePermissions, compactAuditLog } from '../src/normalize.js';

const U = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

test('normalizeWorkflow maps raw DB relations', () => {
  const out = normalizeWorkflow({
    workflow: {
      workflowID: U(1), title: 'x', isDisabled: null,
      tblWorkflowNodes: [{ nodeID: U(2), nodeType: 'start', nodeConfig: { title: 'Start' } }],
      tblWorkflowEdge: [{ edgeID: U(3), upstreamNodeID: U(2), downstreamNodeID: U(2), sourceHandle: 'output' }],
    },
  });
  assert.equal(out.status, 'active');
  assert.equal(out.nodes[0].id, U(2));
  assert.equal(out.edges[0].source, U(2));
  assert.equal(out.edgeCount, 1);
});

test('summarizeInstance strips context snapshots and extracts errors', () => {
  const out = summarizeInstance({
    instanceID: U(1), workflowID: U(2), status: 'FAILED',
    contextData: { input: {}, __node_a: { output: 1 }, answer: 7 },
    logs: [
      { eventType: 'NODE_FAILED', nodeID: U(3), nodeStatus: 'failed', errorMessage: 'boom', payload: { __contextSnapshot: { big: true }, error: { message: 'boom' } } },
      { eventType: 'SYSTEM_SET', nodeID: null, payload: { __temporalStartError: 'deadline' } },
    ],
  });
  assert.equal(out.failedNode, U(3));
  assert.equal(out.contextData.answer, 7);
  assert.equal(out.nodeOutputs.a.output, 1);
  assert.ok(out.errors.some((e) => e.message === 'boom'));
  assert.ok(out.errors.some((e) => e.code === 'WORKFLOW_START_FAILED'));
  assert.equal(out.logs[0].payload.__contextSnapshot, undefined);
});

test('compactSchemaMap lists fields without dumping schemas', () => {
  const out = compactSchemaMap({ postgresql: { schema: { type: 'object', properties: { query: {}, inputDefinitions: {} }, required: ['query'] } } });
  assert.equal(out.totalCount, 1);
  assert.deepEqual(out.types[0].fields, ['query', 'inputDefinitions']);
  assert.equal(out.types[0].required[0], 'query');
});

test('dedupePermissions removes duplicates', () => {
  const out = dedupePermissions([
    { permissionID: '1', permissionTitle: 'tenant:workflow:read' },
    { permissionID: '1', permissionTitle: 'tenant:workflow:read' },
    { permissionID: '2', permissionTitle: 'tenant:workflow:execute' },
  ]);
  assert.equal(out.totalCount, 2);
  assert.equal(out.rawCount, 3);
});

test('compactAuditLog drops bodies and exposes path/title', () => {
  const out = compactAuditLog({
    auditLogID: 'a', createdAt: 't', type: 'API_REQUEST', subType: 'POST', success: true, userID: 'u',
    metadata: { apiKeyID: 'k', authType: 'API_KEY', request: { method: 'POST', url: '/x', body: { title: 'mcptest_x' } }, response: { statusCode: 200, body: { huge: 'x' } } },
  });
  assert.equal(out.title, 'mcptest_x');
  assert.equal(out.statusCode, 200);
  assert.equal(out.body, undefined);
});

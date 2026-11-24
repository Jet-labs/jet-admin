import test from 'node:test';
import assert from 'node:assert/strict';
import { validateWorkflowGraph } from '../src/validation/workflow.js';
import { validateAppPageConfig } from '../src/validation/appPage.js';
import { validateFormSchema } from '../src/validation/form.js';
import { validateExpression } from '../src/validation/expression.js';
import { validateListener } from '../src/validation/listener.js';
import { getNodeContract } from '../src/data/nodeContracts.js';

const U = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;

test('linear workflow is valid', () => {
  const r = validateWorkflowGraph({
    nodes: [
      { id: U(1), type: 'start', data: {} },
      { id: U(2), type: 'javascript', data: { code: 'return 7;', outputVariable: 'answer' } },
      { id: U(3), type: 'end', data: { status: 'success' } },
    ],
    edges: [
      { id: U(4), source: U(1), target: U(2), sourceHandle: 'output' },
      { id: U(5), source: U(2), target: U(3), sourceHandle: 'success' },
    ],
  });
  assert.equal(r.valid, true, JSON.stringify(r.errors));
});

test('join must use output handle and bare source names', () => {
  const r = validateWorkflowGraph({
    nodes: [
      { id: U(1), type: 'start', data: {} },
      { id: U(2), type: 'join', data: { sourceVariables: ['a', 'b'] } },
      { id: U(3), type: 'end', data: {} },
    ],
    edges: [
      { id: U(4), source: U(1), target: U(2), sourceHandle: 'output' },
      { id: U(5), source: U(2), target: U(3), sourceHandle: 'success' },
    ],
  });
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.code === 'EDGE_HANDLE_INVALID' || e.code === 'JOIN_OUTPUT_HANDLE'));
});

test('duplicate switch case ids are rejected', () => {
  const r = validateWorkflowGraph({
    nodes: [
      { id: U(1), type: 'start', data: {} },
      { id: U(2), type: 'switch', data: { switchValue: '{{ctx.input.kind}}', cases: [{ id: 'dup', operator: 'equals', matchValue: 'a' }, { id: 'dup', operator: 'equals', matchValue: 'b' }] } },
      { id: U(3), type: 'end', data: {} },
    ],
    edges: [
      { id: U(4), source: U(1), target: U(2), sourceHandle: 'output' },
      { id: U(5), source: U(2), target: U(3), sourceHandle: 'dup' },
    ],
  });
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.code === 'CASE_ID_DUPLICATE'));
});

test('dataCollection contract exists', () => {
  const c = getNodeContract('dataCollection');
  assert.ok(c);
  assert.ok(c.schema.properties.formSchema);
  assert.ok(c.handles.includes('output'));
});

test('app page column root is valid, grid is not', () => {
  const valid = validateAppPageConfig({
    layoutVersion: 2,
    widgets: [`widget_${U(9)}_1`],
    layout: { id: 'ROOT', type: 'column', children: [{ id: 'r', type: 'row', children: [{ id: 's', type: 'widget', span: 12, sizing: 'fill', widgetKey: `widget_${U(9)}_1` }] }] },
    dataSources: [],
    variables: [],
    layouts: {},
  });
  assert.equal(valid.valid, true, JSON.stringify(valid.errors));
  const invalid = validateAppPageConfig({ layoutVersion: 2, widgets: [], layout: { id: 'ROOT', type: 'grid', children: [] }, dataSources: [], variables: [], layouts: {} });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.some((e) => e.code === 'LAYOUT_ROOT_NOT_COLUMN'));
});

test('form schema catches unknown required property', () => {
  const r = validateFormSchema({ schema: { type: 'object', properties: { name: { type: 'string' } }, required: ['age'] } });
  assert.equal(r.valid, false);
  assert.ok(r.errors.some((e) => e.code === 'REQUIRED_UNKNOWN_PROPERTY'));
});

test('safe-path rejects JS, condition-js rejects mustache', () => {
  assert.equal(validateExpression({ template: '{{ctx.input.route}}' }).valid, true);
  assert.equal(validateExpression({ template: '{{ctx.input.route === "a"}}' }).valid, false);
  assert.equal(validateExpression({ template: 'ctx.input.route === "a"', mode: 'condition-js' }).valid, true);
  assert.equal(validateExpression({ template: '{{ctx.input.route}}', mode: 'condition-js' }).valid, false);
});

test('listener action legacy shape normalizes and validates', () => {
  const r = validateListener({
    listenerType: 'webhook',
    datasourceID: U(7),
    listenerConfig: { pathSuffix: '/hook' },
    actions: [{ type: 'transform', config: { script: 'return event;' } }],
  });
  assert.equal(r.valid, true, JSON.stringify(r.errors));
  assert.equal(r.normalizedActions[0].actionType, 'transform');
});

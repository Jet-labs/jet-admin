/**
 * Synthetic Workflow Topology Fixtures
 *
 * Each topology is a plain { workflowID, nodes, edges } object.
 * Node handlers used:
 *   start    — built-in, always succeeds
 *   __echo   — test-only handler; returns nodeConfig.echoOutput, follows echoHandle
 *   __fail   — test-only handler; throws with nodeConfig.errorMessage
 *   __delay  — test-only handler; waits nodeConfig.delayMs then echoes
 *   end      — built-in, marks terminal
 *
 * The __echo/__fail/__delay handlers are registered in the test setup file.
 */

const { v4: uuidv4 } = require('uuid');

// ─── Node / edge factory helpers ─────────────────────────────────────────────

function startNode(id = 'n-start') {
  return { nodeID: id, nodeType: 'start', nodeConfig: { label: 'Start' } };
}

function echoNode(id, outputVariable, echoOutput, echoHandle = 'success') {
  return {
    nodeID: id,
    nodeType: '__echo',
    nodeConfig: { outputVariable, echoOutput, echoHandle, label: id },
  };
}

function failNode(id, errorMessage = 'synthetic failure') {
  return { nodeID: id, nodeType: '__fail', nodeConfig: { errorMessage, label: id } };
}

function delayNode(id, outputVariable, delayMs = 20) {
  return {
    nodeID: id,
    nodeType: '__delay',
    nodeConfig: { outputVariable, delayMs, echoOutput: { delayed: true }, label: id },
  };
}

function endNode(id = 'n-end', status = 'success') {
  return { nodeID: id, nodeType: 'end', nodeConfig: { status, outputParameters: [], label: id } };
}

function edge(upstreamNodeID, downstreamNodeID, sourceHandle = 'output') {
  return { edgeID: uuidv4(), upstreamNodeID, downstreamNodeID, sourceHandle };
}

// ─── 1. Linear — straight chain ───────────────────────────────────────────────
//   start → A → B → C → end
const LINEAR = (() => {
  const wfID = 'wf-linear';
  return {
    workflowID: wfID,
    nodes: [
      startNode('s'),
      echoNode('A', 'stepA', { value: 1 }),
      echoNode('B', 'stepB', { value: 2 }),
      echoNode('C', 'stepC', { value: 3 }),
      endNode('e'),
    ],
    edges: [
      edge('s', 'A'),
      edge('A', 'B', 'success'),
      edge('B', 'C', 'success'),
      edge('C', 'e', 'success'),
    ],
  };
})();

// ─── 2. Fan-out — parallel branches, no join ─────────────────────────────────
//   start → [A, B, C] — each has its own end node
const FAN_OUT = (() => {
  const wfID = 'wf-fan-out';
  return {
    workflowID: wfID,
    nodes: [
      startNode('s'),
      echoNode('A', 'branchA', { branch: 'A' }),
      echoNode('B', 'branchB', { branch: 'B' }),
      echoNode('C', 'branchC', { branch: 'C' }),
      endNode('eA'),
      endNode('eB'),
      endNode('eC'),
    ],
    edges: [
      edge('s', 'A'),
      edge('s', 'B'),
      edge('s', 'C'),
      edge('A', 'eA', 'success'),
      edge('B', 'eB', 'success'),
      edge('C', 'eC', 'success'),
    ],
  };
})();

// ─── 3. Diamond (AND join) ────────────────────────────────────────────────────
//   start → [A, B] → join(all) → end
const DIAMOND_AND = (() => {
  const wfID = 'wf-diamond-and';
  return {
    workflowID: wfID,
    nodes: [
      startNode('s'),
      echoNode('A', 'dataA', { from: 'A' }),
      echoNode('B', 'dataB', { from: 'B' }),
      { ...echoNode('J', 'joined', { merged: true }), nodeConfig: { outputVariable: 'joined', echoOutput: { merged: true }, echoHandle: 'success', joinMode: 'all', label: 'J' } },
      endNode('e'),
    ],
    edges: [
      edge('s', 'A'),
      edge('s', 'B'),
      edge('A', 'J', 'success'),
      edge('B', 'J', 'success'),
      edge('J', 'e', 'success'),
    ],
  };
})();

// ─── 4. Diamond (OR join) ─────────────────────────────────────────────────────
//   start → [A, B] → join(any) → end
const DIAMOND_OR = (() => {
  const wfID = 'wf-diamond-or';
  return {
    workflowID: wfID,
    nodes: [
      startNode('s'),
      echoNode('A', 'dataA', { from: 'A' }),
      echoNode('B', 'dataB', { from: 'B' }),
      { ...echoNode('J', 'joined', { merged: true }), nodeConfig: { outputVariable: 'joined', echoOutput: { merged: true }, echoHandle: 'success', joinMode: 'any', label: 'J' } },
      endNode('e'),
    ],
    edges: [
      edge('s', 'A'),
      edge('s', 'B'),
      edge('A', 'J', 'success'),
      edge('B', 'J', 'success'),
      edge('J', 'e', 'success'),
    ],
  };
})();

// ─── 5. Deep chain — 20 sequential nodes ─────────────────────────────────────
const DEEP_CHAIN = (() => {
  const wfID = 'wf-deep-chain';
  const DEPTH = 20;
  const nodes = [startNode('s')];
  const edges = [];

  for (let i = 1; i <= DEPTH; i++) {
    nodes.push(echoNode(`n${i}`, `step${i}`, { i }));
  }
  nodes.push(endNode('e'));

  edges.push(edge('s', 'n1'));
  for (let i = 1; i < DEPTH; i++) {
    edges.push(edge(`n${i}`, `n${i + 1}`, 'success'));
  }
  edges.push(edge(`n${DEPTH}`, 'e', 'success'));

  return { workflowID: wfID, nodes, edges };
})();

// ─── 6. Wide fan-out — 1 → 10 parallel → 10 ends ────────────────────────────
const WIDE_FAN_OUT = (() => {
  const wfID = 'wf-wide-fan';
  const WIDTH = 10;
  const nodes = [startNode('s')];
  const edges = [];

  for (let i = 1; i <= WIDTH; i++) {
    nodes.push(echoNode(`p${i}`, `parallel${i}`, { slot: i }));
    nodes.push(endNode(`e${i}`));
    edges.push(edge('s', `p${i}`));
    edges.push(edge(`p${i}`, `e${i}`, 'success'));
  }

  return { workflowID: wfID, nodes, edges };
})();

// ─── 7. Wide fan-in — 10 parallel → AND join → end ───────────────────────────
const WIDE_FAN_IN = (() => {
  const wfID = 'wf-wide-fan-in';
  const WIDTH = 10;
  const nodes = [startNode('s')];
  const edges = [];

  for (let i = 1; i <= WIDTH; i++) {
    nodes.push(echoNode(`p${i}`, `parallel${i}`, { slot: i }));
    edges.push(edge('s', `p${i}`));
    edges.push(edge(`p${i}`, 'J', 'success'));
  }

  nodes.push({
    nodeID: 'J',
    nodeType: '__echo',
    nodeConfig: { outputVariable: 'collected', echoOutput: { done: true }, echoHandle: 'success', joinMode: 'all', label: 'J' },
  });
  nodes.push(endNode('e'));
  edges.push(edge('J', 'e', 'success'));

  return { workflowID: wfID, nodes, edges };
})();

// ─── 8. Error path — node fails → error edge → failure end ───────────────────
const ERROR_PATH = (() => {
  const wfID = 'wf-error-path';
  return {
    workflowID: wfID,
    nodes: [
      startNode('s'),
      failNode('boom', 'intentional test failure'),
      endNode('e-ok', 'success'),
      endNode('e-err', 'failure'),
    ],
    edges: [
      edge('s', 'boom'),
      edge('boom', 'e-ok', 'success'),  // never taken
      edge('boom', 'e-err', 'error'),   // taken on failure
    ],
  };
})();

// ─── 9. Conditional branch — echoHandle drives the path taken ────────────────
//   start → gate(→ success path OR error path) → respective ends
const CONDITIONAL = (() => {
  const wfID = 'wf-conditional';
  return {
    workflowID: wfID,
    nodes: [
      startNode('s'),
      // gate emits 'success' handle
      echoNode('gate', 'gateResult', { decision: 'go' }, 'success'),
      echoNode('happy', 'happyResult', { path: 'success' }),
      echoNode('sad', 'sadResult', { path: 'error' }),
      endNode('e-ok'),
      endNode('e-err'),
    ],
    edges: [
      edge('s', 'gate'),
      edge('gate', 'happy', 'success'),
      edge('gate', 'sad', 'error'),
      edge('happy', 'e-ok', 'success'),
      edge('sad', 'e-err', 'success'),
    ],
  };
})();

// ─── 10. Multi-level diamond — nested fan-out/fan-in ─────────────────────────
//   start → [A,B] → mid(join all) → [C,D] → end(join all) → end
const MULTI_DIAMOND = (() => {
  const wfID = 'wf-multi-diamond';
  return {
    workflowID: wfID,
    nodes: [
      startNode('s'),
      echoNode('A', 'dataA', { from: 'A' }),
      echoNode('B', 'dataB', { from: 'B' }),
      { nodeID: 'M', nodeType: '__echo', nodeConfig: { outputVariable: 'midpoint', echoOutput: { level: 1 }, echoHandle: 'success', joinMode: 'all', label: 'M' } },
      echoNode('C', 'dataC', { from: 'C' }),
      echoNode('D', 'dataD', { from: 'D' }),
      { nodeID: 'F', nodeType: '__echo', nodeConfig: { outputVariable: 'final', echoOutput: { level: 2 }, echoHandle: 'success', joinMode: 'all', label: 'F' } },
      endNode('e'),
    ],
    edges: [
      edge('s', 'A'),
      edge('s', 'B'),
      edge('A', 'M', 'success'),
      edge('B', 'M', 'success'),
      edge('M', 'C', 'success'),
      edge('M', 'D', 'success'),
      edge('C', 'F', 'success'),
      edge('D', 'F', 'success'),
      edge('F', 'e', 'success'),
    ],
  };
})();

// ─── 11. Error recovery — fail node with error edge back into success path ────
const ERROR_RECOVERY = (() => {
  const wfID = 'wf-error-recovery';
  return {
    workflowID: wfID,
    nodes: [
      startNode('s'),
      failNode('risky', 'expected failure'),
      echoNode('fallback', 'fallbackResult', { recovered: true }),
      endNode('e'),
    ],
    edges: [
      edge('s', 'risky'),
      edge('risky', 'fallback', 'error'),
      edge('fallback', 'e', 'success'),
    ],
  };
})();

// ─── 12. Delay-heavy — tests concurrency under artificial latency ─────────────
const DELAY_HEAVY = (() => {
  const wfID = 'wf-delay-heavy';
  return {
    workflowID: wfID,
    nodes: [
      startNode('s'),
      delayNode('d1', 'slow1', 15),
      delayNode('d2', 'slow2', 15),
      delayNode('d3', 'slow3', 15),
      { nodeID: 'J', nodeType: '__echo', nodeConfig: { outputVariable: 'collected', echoOutput: { done: true }, echoHandle: 'success', joinMode: 'all', label: 'J' } },
      endNode('e'),
    ],
    edges: [
      edge('s', 'd1'),
      edge('s', 'd2'),
      edge('s', 'd3'),
      edge('d1', 'J', 'success'),
      edge('d2', 'J', 'success'),
      edge('d3', 'J', 'success'),
      edge('J', 'e', 'success'),
    ],
  };
})();

module.exports = {
  LINEAR,
  FAN_OUT,
  DIAMOND_AND,
  DIAMOND_OR,
  DEEP_CHAIN,
  WIDE_FAN_OUT,
  WIDE_FAN_IN,
  ERROR_PATH,
  CONDITIONAL,
  MULTI_DIAMOND,
  ERROR_RECOVERY,
  DELAY_HEAVY,
  ALL_TOPOLOGIES: [
    LINEAR, FAN_OUT, DIAMOND_AND, DIAMOND_OR,
    DEEP_CHAIN, WIDE_FAN_OUT, WIDE_FAN_IN,
    ERROR_PATH, CONDITIONAL, MULTI_DIAMOND,
    ERROR_RECOVERY, DELAY_HEAVY,
  ],
};

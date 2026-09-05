/**
 * Workflow Deterministic Helpers
 * Must NOT import Node.js APIs, Prisma, or non-deterministic libs.
 * Only pure functions used inside dslWorkflow.js
 */

export function normalizeHandle(handle) {
  if (handle === 'done') return 'completed';
  return handle || 'output';
}

/**
 * Build adjacency maps from edges array.
 * Edges shape: { source, target, sourceHandle, targetHandle }
 */
export function buildGraphMaps(nodes, edges) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const outgoingBySource = new Map();
  const incomingByTarget = new Map();

  for (const e of edges) {
    if (!outgoingBySource.has(e.source)) outgoingBySource.set(e.source, []);
    outgoingBySource.get(e.source).push(e);

    if (!incomingByTarget.has(e.target)) incomingByTarget.set(e.target, []);
    incomingByTarget.get(e.target).push(e);
  }
  return { nodeMap, outgoingBySource, incomingByTarget };
}

export function getOutgoingEdges(nodeID, handle, outgoingBySource) {
  const all = outgoingBySource.get(nodeID) || [];
  const want = normalizeHandle(handle);
  // If handle is explicit, filter; if null/undefined handler wants 'output'
  return all.filter((e) => normalizeHandle(e.sourceHandle) === want);
}

/**
 * Barrier check — mirrors dagScheduler.isNodeReadyToExecute
 * Deterministic, no DB query — uses completed Set.
 */
export function isNodeReady(nodeID, incomingByTarget, completedSet, nodeMap) {
  const incoming = incomingByTarget.get(nodeID) || [];
  if (incoming.length <= 1) return true;
  const node = nodeMap.get(nodeID);
  const joinMode = node?.data?.joinMode ?? (node?.type === 'loop' ? 'any' : 'all');
  const upstreamIDs = incoming.map((e) => e.source);
  if (joinMode === 'any') {
    return upstreamIDs.some((id) => completedSet.has(id));
  }
  return upstreamIDs.every((id) => completedSet.has(id));
}

export function normalizeItems(value) {
  if (Array.isArray(value)) return value;
  if (value == null) return [];
  return [value];
}

export function resolveSourceVariable(sourceVariable, context) {
  if (sourceVariable == null) return [];
  if (typeof sourceVariable !== 'string') return normalizeItems(sourceVariable);
  const trimmed = sourceVariable.trim();
  // Support {{ctx.var}} single expression
  const singleMatch = trimmed.match(/^\{\{\s*ctx\.([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}$/);
  if (singleMatch) {
    const key = singleMatch[1];
    return normalizeItems(context[key]);
  }
  // Support {{ctx.var.sub}} dot path — shallow for now
  const dotMatch = trimmed.match(/^\{\{\s*ctx\.([a-zA-Z0-9_.]+)\s*\}\}$/);
  if (dotMatch) {
    const path = dotMatch[1].split('.');
    let cur = context;
    for (const part of path) cur = cur?.[part];
    return normalizeItems(cur);
  }
  // Plain key lookup
  if (context[sourceVariable] !== undefined) return normalizeItems(context[sourceVariable]);
  // Fallback: return as single item string
  return normalizeItems(sourceVariable);
}

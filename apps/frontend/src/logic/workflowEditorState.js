const SELECTABLE_EDGE_TYPES = new Set(['default', 'straight', 'step', 'smoothstep', 'simplebezier']);

// Legacy workflows only persisted per-edge types. Error paths must not select
// the default style for newly connected success paths.
export function getWorkflowEdgeType(values) {
  const configured = values.workflowOptions?.edgeType ?? values.edgeType;
  if (SELECTABLE_EDGE_TYPES.has(configured)) return configured;
  return values.edges?.find(edge => SELECTABLE_EDGE_TYPES.has(edge.type))?.type ?? 'smoothstep';
}

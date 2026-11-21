export const isWorkflowRunActive = status => ['PENDING', 'RUNNING', 'SUSPENDED'].includes(status);

export function workflowEventLabel(log) {
  // The terminal failure row is distinct from a node failure; presenting both
  // as NODE FAILED makes a single failed node look as though it failed twice.
  if (log.eventType === 'NODE_FAILED' && !log.nodeID) return 'Workflow failed';
  if (log.nodeStatus === 'cancelled') return 'Node cancelled';
  if (log.nodeStatus === 'skipped') return 'Node skipped';
  return log.eventType.replace(/_/g, ' ');
}

// Temporal activity IDs are stable across retries, and unique for each loop
// invocation. No test/HTTP caller is allowed to invent an activity identity.
function activityEventKey(kind) {
  try {
    const { Context } = require('@temporalio/activity');
    const info = Context.current().info;
    return `${info.workflowExecution.runId}:${info.activityId}:${kind}`;
  } catch (_) {
    return null; // direct non-Temporal calls have no retry identity
  }
}
module.exports = { activityEventKey };

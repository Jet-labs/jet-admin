const { createHash } = require('crypto');

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  return value;
}

// Display names, status counters and credentials are not executable definitions.
// Include enabled processing actions, in deterministic execution order.
function listenerDefinition(listener) {
  return {
    listenerID: listener.listenerID,
    tenantID: listener.tenantID,
    datasourceID: listener.datasourceID,
    listenerType: listener.listenerType,
    listenerConfig: listener.listenerConfig || {},
    endpointPath: listener.endpointPath || null,
    actions: (listener.tblListenerActions || []).filter(action => action.isEnabled !== false)
      .map(action => ({ actionID: action.actionID, actionType: action.actionType, actionConfig: action.actionConfig || {}, orderIndex: action.orderIndex || 0 }))
      .sort((a, b) => a.orderIndex - b.orderIndex || a.actionID.localeCompare(b.actionID)),
  };
}

const listenerDefinitionHash = listener => createHash('sha256').update(JSON.stringify(canonical(listenerDefinition(listener)))).digest('hex');
module.exports = { listenerDefinition, listenerDefinitionHash };

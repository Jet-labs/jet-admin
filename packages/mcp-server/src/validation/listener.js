/**
 * Listener config + pipeline action validator — pure, no network.
 * Mirrors the runtime action dispatcher (transform / trigger_workflow /
 * trigger_query / save_to_buffer / push_to_app_page).
 */
import { GENERATED_DATASOURCE_TYPES } from '../data/catalogs.js';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const ACTION_TYPES = ['transform', 'trigger_workflow', 'trigger_query', 'save_to_buffer', 'push_to_app_page'];
const LISTENER_TYPES = GENERATED_DATASOURCE_TYPES.filter((d) => d.supportsListener).map((d) => d.value);

function err(path, code, message, fix, suggestion) { return { path, code, message, fix, suggestion }; }
function warn(path, code, message, fix) { return { path, code, message, fix }; }
function isObject(v) { return v !== null && typeof v === 'object' && !Array.isArray(v); }

export function normalizeAction(action) {
  if (!isObject(action)) return action;
  return {
    ...action,
    actionType: action.actionType ?? action.type,
    actionConfig: action.actionConfig ?? action.config ?? {},
  };
}

export function validateListener({ listenerType, listenerConfig, actions, pipelineSteps, datasourceID } = {}) {
  const errors = [];
  const warnings = [];
  if (!LISTENER_TYPES.includes(listenerType)) {
    errors.push(err('listenerType', 'LISTENER_TYPE_INVALID', `listenerType ${JSON.stringify(listenerType)} is not listener-capable.`, `Use one of: ${LISTENER_TYPES.join(', ')}.`, 'list_listener_types'));
  }
  if (!UUID_RE.test(String(datasourceID || ''))) errors.push(err('datasourceID', 'DATASOURCE_ID_REQUIRED', 'A listener requires a datasource UUID of matching type.', 'Find one with list_datasources.', 'list_datasources'));
  if (listenerConfig !== undefined && !isObject(listenerConfig)) errors.push(err('listenerConfig', 'LISTENER_CONFIG_INVALID', 'listenerConfig must be an object.', 'Use {pathSuffix:"/my-hook"}.', 'get_listener_schemas'));
  const cfg = listenerConfig || {};
  if (listenerType === 'webhook') {
    if (cfg.path !== undefined) warnings.push(warn('listenerConfig.path', 'WEBHOOK_PATH_ALIAS', 'listenerConfig.path is documented as an alias but was observed to produce endpointPath:null; prefer pathSuffix.', 'Use pathSuffix:"/my-hook".'));
    if (cfg.pathSuffix !== undefined && typeof cfg.pathSuffix !== 'string') errors.push(err('listenerConfig.pathSuffix', 'PATH_SUFFIX_INVALID', 'pathSuffix must be a string.', 'Use "/my-hook".', 'get_listener_schemas'));
  }
  if (listenerType === 'mqtt') {
    if (cfg.topics !== undefined && typeof cfg.topics !== 'string') errors.push(err('listenerConfig.topics', 'MQTT_TOPICS_INVALID', 'MQTT topics must be a string (comma-separated).', 'Use "sensors/#".', 'get_listener_schemas'));
  }
  if (listenerType === 'kafka') {
    if (cfg.topic !== undefined && typeof cfg.topic !== 'string') errors.push(err('listenerConfig.topic', 'KAFKA_TOPIC_INVALID', 'Kafka topic must be a string.', 'Use "events".', 'get_listener_schemas'));
  }

  const raw = actions ?? pipelineSteps ?? [];
  if (!Array.isArray(raw)) {
    errors.push(err('actions', 'ACTIONS_NOT_ARRAY', 'actions must be an array.', 'Use [{actionType,actionConfig}].', 'add_listener_action'));
    return { valid: false, errors, warnings, normalizedActions: [], summary: null };
  }
  if (raw.length === 0) warnings.push(warn('actions', 'EMPTY_PIPELINE', 'Listener has no actions; events will be received but nothing will happen.', 'Add transform/trigger_workflow/trigger_query.'));
  const normalizedActions = [];
  raw.forEach((a, i) => {
    const p = `actions[${i}]`;
    const action = normalizeAction(a);
    if (!isObject(action)) { errors.push(err(p, 'ACTION_NOT_OBJECT', 'Action must be an object.', 'Use {actionType,actionConfig}.', 'add_listener_action')); return; }
    const type = action.actionType;
    const c = action.actionConfig || {};
    if (!ACTION_TYPES.includes(type)) {
      errors.push(err(`${p}.actionType`, 'ACTION_TYPE_INVALID', `Unknown actionType ${JSON.stringify(type)}.`, `Use one of: ${ACTION_TYPES.join(', ')}.`, 'list_listener_action_types'));
      return;
    }
    if (action.isEnabled !== undefined && typeof action.isEnabled !== 'boolean') errors.push(err(`${p}.isEnabled`, 'IS_ENABLED_INVALID', 'isEnabled must be boolean.', 'Use true.', 'add_listener_action'));
    if (action.orderIndex !== undefined && !(Number.isInteger(action.orderIndex) && action.orderIndex >= 0)) errors.push(err(`${p}.orderIndex`, 'ORDER_INDEX_INVALID', 'orderIndex must be a non-negative integer.', 'Use 0.', 'add_listener_action'));

    if (type === 'transform') {
      if (typeof c.script !== 'string' || !c.script.trim()) errors.push(err(`${p}.actionConfig.script`, 'TRANSFORM_SCRIPT_REQUIRED', 'transform requires actionConfig.script.', 'Use "return event;".', 'add_listener_action'));
      if (c.script && /window|document|fetch|require|process|eval\b/.test(c.script)) errors.push(err(`${p}.actionConfig.script`, 'TRANSFORM_BLOCKED_GLOBAL', 'Transform script references a blocked global.', 'Use event values only.', 'add_listener_action'));
    }
    if (type === 'trigger_workflow') {
      if (!UUID_RE.test(String(c.workflowID || ''))) errors.push(err(`${p}.actionConfig.workflowID`, 'TRIGGER_WORKFLOW_ID_INVALID', 'trigger_workflow requires a workflow UUID.', 'Find it with list_workflows.', 'list_workflows'));
      if (c.inputValues !== undefined && !isObject(c.inputValues)) errors.push(err(`${p}.actionConfig.inputValues`, 'TRIGGER_INPUTS_INVALID', 'inputValues must be an object.', 'Use { key: "{{event.field}}" }.', 'add_listener_action'));
      if (c.inputMapping !== undefined) warnings.push(warn(`${p}.actionConfig.inputMapping`, 'TRIGGER_INPUT_MAPPING_UNUSED', 'trigger_workflow uses inputValues, not inputMapping.', 'Rename to inputValues.'));
    }
    if (type === 'trigger_query') {
      if (!UUID_RE.test(String(c.dataQueryID || ''))) errors.push(err(`${p}.actionConfig.dataQueryID`, 'TRIGGER_QUERY_ID_INVALID', 'trigger_query requires a query UUID.', 'Find it with list_queries.', 'list_queries'));
      if (c.inputValues !== undefined && !isObject(c.inputValues)) errors.push(err(`${p}.actionConfig.inputValues`, 'TRIGGER_INPUTS_INVALID', 'inputValues must be an object.', 'Use { key: "{{event.field}}" }.', 'add_listener_action'));
    }
    if (type === 'save_to_buffer') {
      if (typeof c.bufferName !== 'string' || !c.bufferName.trim()) errors.push(err(`${p}.actionConfig.bufferName`, 'BUFFER_NAME_REQUIRED', 'save_to_buffer requires bufferName.', 'Use "recent_events".', 'add_listener_action'));
      if (c.retentionPolicy !== undefined && !['count', 'time', 'both'].includes(c.retentionPolicy)) errors.push(err(`${p}.actionConfig.retentionPolicy`, 'RETENTION_POLICY_INVALID', 'retentionPolicy must be count, time, or both.', 'Use count.', 'add_listener_action'));
      if (c.maxEvents !== undefined && !(Number.isInteger(c.maxEvents) && c.maxEvents > 0)) errors.push(err(`${p}.actionConfig.maxEvents`, 'MAX_EVENTS_INVALID', 'maxEvents must be a positive integer.', 'Use 100.', 'add_listener_action'));
      if (c.maxAgeHours !== undefined && !(Number.isFinite(c.maxAgeHours) && c.maxAgeHours > 0)) errors.push(err(`${p}.actionConfig.maxAgeHours`, 'MAX_AGE_INVALID', 'maxAgeHours must be positive.', 'Use 24.', 'add_listener_action'));
    }
    if (type === 'push_to_app_page') {
      if (!UUID_RE.test(String(c.appPageID || ''))) errors.push(err(`${p}.actionConfig.appPageID`, 'PUSH_PAGE_ID_INVALID', 'push_to_app_page requires an app page UUID.', 'Find it with list_app_pages.', 'list_app_pages'));
      if (c.channelName !== undefined && typeof c.channelName !== 'string') errors.push(err(`${p}.actionConfig.channelName`, 'CHANNEL_NAME_INVALID', 'channelName must be a string.', 'Use "live_events".', 'add_listener_action'));
      if (c.maxArrayLength !== undefined && !(Number.isInteger(c.maxArrayLength) && c.maxArrayLength > 0)) errors.push(err(`${p}.actionConfig.maxArrayLength`, 'MAX_ARRAY_INVALID', 'maxArrayLength must be a positive integer.', 'Use 100.', 'add_listener_action'));
    }
    normalizedActions.push({ ...action, actionType: type, actionConfig: c });
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    normalizedActions,
    summary: { listenerType, actionCount: normalizedActions.length, actionTypes: normalizedActions.map((a) => a.actionType) },
  };
}

export const LISTENER_ACTION_TYPES = ACTION_TYPES;
export const LISTENER_CAPABLE_TYPES = LISTENER_TYPES;

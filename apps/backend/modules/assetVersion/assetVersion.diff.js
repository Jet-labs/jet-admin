const MAX_CHANGES = 500;

const isObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (isObject(value)) {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = stable(value[key]);
        return result;
      }, {});
  }
  return value;
}

const equal = (left, right) => JSON.stringify(stable(left)) === JSON.stringify(stable(right));

/**
 * Bounded structural diff for version payload previews. Arrays are compared
 * by index; changed object properties produce one entry per leaf path.
 */
function diffJson(before, after, path = "", changes = []) {
  if (changes.length >= MAX_CHANGES) return changes;
  if (equal(before, after)) return changes;

  if (Array.isArray(before) || Array.isArray(after)) {
    const left = Array.isArray(before) ? before : [];
    const right = Array.isArray(after) ? after : [];
    const length = Math.max(left.length, right.length);
    for (let index = 0; index < length && changes.length < MAX_CHANGES; index += 1) {
      const childPath = `${path}[${index}]`;
      if (index >= left.length) {
        changes.push({ path: childPath, change: "added", after: right[index] });
      } else if (index >= right.length) {
        changes.push({ path: childPath, change: "removed", before: left[index] });
      } else {
        diffJson(left[index], right[index], childPath, changes);
      }
    }
    return changes;
  }

  if (isObject(before) && isObject(after)) {
    const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort();
    for (const key of keys) {
      if (changes.length >= MAX_CHANGES) break;
      const childPath = path ? `${path}.${key}` : key;
      if (!Object.prototype.hasOwnProperty.call(before, key)) {
        changes.push({ path: childPath, change: "added", after: after[key] });
      } else if (!Object.prototype.hasOwnProperty.call(after, key)) {
        changes.push({ path: childPath, change: "removed", before: before[key] });
      } else {
        diffJson(before[key], after[key], childPath, changes);
      }
    }
    return changes;
  }

  changes.push({ path: path || "value", change: "changed", before, after });
  return changes;
}

const DIFF_CHANGE_LIMIT = MAX_CHANGES;

/**
 * Only fields that are part of the executable definition and can safely be
 * restored into a mutable draft. Credentials, connection options, status
 * counters, and version-pointer maps are excluded.
 */
function comparablePayload(type, payload = {}) {
  switch (type) {
    case "datasource":
      return {
        datasourceTitle: payload.datasourceTitle,
        datasourceDescription: payload.datasourceDescription ?? null,
        datasourceTags: payload.datasourceTags || [],
      };
    case "widget":
      return {
        widgetTitle: payload.widgetTitle,
        widgetType: payload.widgetType,
        widgetConfig: payload.widgetConfig || {},
      };
    case "query":
      return {
        dataQueryTitle: payload.dataQueryTitle,
        dataQueryDescription: payload.dataQueryDescription ?? null,
        datasourceID: payload.datasourceID || null,
        datasourceType: payload.datasourceType,
        dataQueryOptions: payload.dataQueryOptions || {},
        runOnLoad: Boolean(payload.runOnLoad),
        dataQueryResultSchema: payload.dataQueryResultSchema ?? null,
        inputDefinitions: payload.inputDefinitions || [],
      };
    case "workflow":
      return {
        title: payload.title,
        workflowOptions: payload.workflowOptions || {},
        nodes: payload.nodes || [],
        edges: payload.edges || [],
      };
    case "listener":
      return {
        listenerTitle: payload.listenerTitle,
        listenerDescription: payload.listenerDescription ?? null,
        datasourceID: payload.datasourceID || null,
        listenerType: payload.listenerType,
        listenerConfig: payload.listenerConfig || {},
        actions: payload.actions || [],
        endpointPath: payload.endpointPath ?? null,
      };
    case "cronjob":
      return {
        cronJobTitle: payload.cronJobTitle,
        cronJobDescription: payload.cronJobDescription ?? null,
        cronJobSchedule: payload.cronJobSchedule,
        workflowID: payload.workflowID || null,
        workflowConfig: payload.workflowConfig || {},
        timeoutSeconds: payload.timeoutSeconds,
        retryAttempts: payload.retryAttempts,
        retryDelaySeconds: payload.retryDelaySeconds,
      };
    case "appPage":
      return {
        appPageTitle: payload.appPageTitle,
        appPageDescription: payload.appPageDescription ?? null,
        appPageConfig: payload.appPageConfig || {},
      };
    default:
      return {};
  }
}

module.exports = { diffJson, comparablePayload, DIFF_CHANGE_LIMIT };

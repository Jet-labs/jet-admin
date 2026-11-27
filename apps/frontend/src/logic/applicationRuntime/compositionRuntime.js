// Composition preview deliberately supports paths only, never JavaScript.
// The full strict expression language and execution transport ship separately.
const forbidden = new Set(["__proto__", "prototype", "constructor", "widgetMethods"]);
const pathPattern = /^state(?:\.[a-zA-Z0-9_-]+|\[\d+\])+$/;
const readPath = (expression, state) => {
  const path = expression.trim();
  if (path.length > 4096 || !pathPattern.test(path)) return undefined;
  const keys = path.slice(6).replace(/\[(\d+)\]/g, ".$1").split(".");
  let value = state;
  for (const key of keys) {
    if (forbidden.has(key) || value == null || !Object.prototype.hasOwnProperty.call(value, key)) return undefined;
    value = value[key];
  }
  return typeof value === "function" ? undefined : value;
};

export function resolveCompositionValue(value, state) {
  if (typeof value !== "string") return value;
  const whole = /^\{\{\s*([\s\S]*?)\s*\}\}$/.exec(value);
  if (whole) return readPath(whole[1], state);
  return value.replace(/\{\{([\s\S]*?)\}\}/g, (_match, expression) => {
    const resolved = readPath(expression, state);
    return resolved == null ? "" : typeof resolved === "object" ? JSON.stringify(resolved) : String(resolved);
  });
}

export function resolveCompositionConfig(value, state, depth = 0) {
  if (depth > 40) return undefined;
  if (Array.isArray(value)) return value.map(item => resolveCompositionConfig(item, state, depth + 1));
  if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).filter(([key]) => !forbidden.has(key)).map(([key, item]) => [key, resolveCompositionConfig(item, state, depth + 1)]));
  return resolveCompositionValue(value, state);
}

export function createCompositionServices(preview) {
  if (preview.mode !== "composition" || preview.executionEnabled !== false) throw new Error("Unsupported application preview contract");
  return {
    identity: preview.previewID,
    executionEnabled: false,
    resolveConfig: resolveCompositionConfig,
    resolveValue: resolveCompositionValue,
    evaluateVisibility: (condition, state) => ({ visible: !condition?.trim() || resolveCompositionValue(condition, state) === true }),
    resolveWidget: async resourceID => {
      if (!Object.prototype.hasOwnProperty.call(preview.widgets, resourceID)) throw new Error("Widget is not present in this preview");
      return preview.widgets[resourceID];
    },
  };
}

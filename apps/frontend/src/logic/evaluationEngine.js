/**
 * Expression Evaluation Engine
 *
 * Resolves mustache-style expressions like `{{ queries.get_users.data }}`
 * against a runtime state tree. This is the core of the reactive data
 * binding system, following the Retool/Appsmith pattern.
 *
 * State tree shape:
 * {
 *   queries: {
 *     get_users: { data: [...], isLoading: false, error: null },
 *     get_orders: { data: [...], isLoading: false, error: null },
 *   },
 *   widgets: {
 *     my_table: { selectedRow: {...}, selectedIndex: 0 },
 *   },
 *   globals: {
 *     currentUser: { ... },
 *     tenantID: "...",
 *   }
 * }
 */

const EXPRESSION_REGEX = /\{\{\s*(.*?)\s*\}\}/g;

/**
 * Safely resolve a dot-notated path against an object.
 *
 * @param {object} obj - The root object
 * @param {string} path - Dot-notated path like "queries.get_users.data[0].name"
 * @returns {*} The resolved value, or undefined if not found
 */
export const resolvePath = (obj, path) => {
  if (!obj || !path) return undefined;

  // Handle bracket notation: convert arr[0] to arr.0
  const normalizedPath = path.replace(/\[(\d+)\]/g, ".$1");
  const parts = normalizedPath.split(".");
  let current = obj;

  for (const part of parts) {
    if (current === undefined || current === null) return undefined;
    current = current[part];
  }

  return current;
};

/**
 * Check if a string contains mustache expressions.
 *
 * @param {string} str
 * @returns {boolean}
 */
export const containsExpression = (str) => {
  if (typeof str !== "string") return false;
  return EXPRESSION_REGEX.test(str);
};

/**
 * Evaluate a single expression string against the state tree.
 * Supports simple dot-path resolution (no arbitrary JS for security).
 *
 * @param {string} expression - e.g. "queries.get_users.data"
 * @param {object} stateTree - The global runtime state
 * @returns {*} The resolved value
 */
export const evaluateExpression = (expression, stateTree) => {
  const trimmed = expression.trim();

  // Direct path resolution against the state tree
  const result = resolvePath(stateTree, trimmed);

  // Return undefined for unresolved paths (not an error)
  return result;
};

/**
 * Resolve a string value that may contain mustache expressions.
 * If the entire string is a single expression, returns the raw value (preserving type).
 * If the string contains mixed text + expressions, returns a string with substitutions.
 *
 * @param {string} value - The string to evaluate
 * @param {object} stateTree - The global runtime state
 * @returns {*} The resolved value
 */
export const resolveValue = (value, stateTree) => {
  if (typeof value !== "string") return value;

  // Check if the entire value is a single expression
  const singleExprMatch = value.match(/^\{\{\s*(.*?)\s*\}\}$/);
  if (singleExprMatch) {
    // Return the raw value (could be object, array, number, etc.)
    return evaluateExpression(singleExprMatch[1], stateTree);
  }

  // Mixed text + expressions: substitute and return string
  return value.replace(EXPRESSION_REGEX, (match, expr) => {
    const result = evaluateExpression(expr, stateTree);
    if (result === undefined || result === null) return "";
    if (typeof result === "object") return JSON.stringify(result);
    return String(result);
  });
};

/**
 * Deep-resolve all expressions in an object or array recursively.
 * Walks through all string values and resolves any mustache expressions.
 *
 * @param {*} config - The configuration object/array/value to resolve
 * @param {object} stateTree - The global runtime state
 * @returns {*} The resolved configuration with all expressions substituted
 */
export const resolveConfig = (config, stateTree) => {
  if (config === null || config === undefined) return config;

  if (typeof config === "string") {
    return resolveValue(config, stateTree);
  }

  if (Array.isArray(config)) {
    return config.map((item) => resolveConfig(item, stateTree));
  }

  if (typeof config === "object") {
    const resolved = {};
    for (const [key, val] of Object.entries(config)) {
      resolved[key] = resolveConfig(val, stateTree);
    }
    return resolved;
  }

  // Primitives (number, boolean) pass through
  return config;
};

/**
 * Extract all expression paths from a config object.
 * Useful for dependency tracking — knowing which state paths
 * a widget depends on so we can re-render when they change.
 *
 * @param {*} config - The configuration to scan
 * @returns {string[]} Array of unique state paths referenced
 */
export const extractDependencies = (config) => {
  const deps = new Set();

  const walk = (value) => {
    if (typeof value === "string") {
      let match;
      const regex = new RegExp(EXPRESSION_REGEX.source, "g");
      while ((match = regex.exec(value)) !== null) {
        const path = match[1].trim();
        // Extract the top-level dependency (e.g. "queries.get_users" from "queries.get_users.data[0]")
        const parts = path.split(".");
        if (parts.length >= 2) {
          deps.add(`${parts[0]}.${parts[1]}`);
        } else {
          deps.add(path);
        }
      }
    } else if (Array.isArray(value)) {
      value.forEach(walk);
    } else if (value && typeof value === "object") {
      Object.values(value).forEach(walk);
    }
  };

  walk(config);
  return [...deps];
};

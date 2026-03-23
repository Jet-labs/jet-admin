/**
 * Input Args Utility
 *
 * Centralized validation, coercion, and conversion for input arguments
 * used across data-query, workflow, and cron-job modules.
 *
 * Canonical arg schema shape:
 *   { key: string, type: 'string'|'number'|'boolean'|'object'|'array', required?: boolean }
 *
 * Canonical runtime values shape:
 *   { [key]: any }   (flat object)
 */

const SUPPORTED_TYPES = ['string', 'number', 'boolean', 'object', 'array'];

/**
 * Mapping from legacy descriptive type strings (used in older queryConfig.json)
 * to clean canonical type values.
 */
const LEGACY_TYPE_MAP = {
  'array (, separated)': 'array',
  'object (JSON stringified)': 'object',
};

/**
 * Normalize a type string, converting legacy descriptive types to canonical ones.
 * @param {string} type
 * @returns {string}
 */
function normalizeType(type) {
  if (!type) return 'string';
  return LEGACY_TYPE_MAP[type] || type;
}

// ─── Coercion helpers ─────────────────────────────────────────────────────────

/**
 * Coerce a single value to the declared type.
 * Returns { value, error } — error is a string if coercion fails.
 *
 * @param {*}      rawValue
 * @param {string} type
 * @returns {{ value: *, error: string|null }}
 */
function coerceValue(rawValue, type) {
  // null / undefined pass through (handled by required check separately)
  if (rawValue === null || rawValue === undefined) {
    return { value: rawValue, error: null };
  }

  switch (type) {
    case 'string':
      return { value: String(rawValue), error: null };

    case 'number': {
      if (rawValue === '') return { value: null, error: null };
      const num = Number(rawValue);
      if (Number.isNaN(num)) {
        return { value: rawValue, error: `Expected number, got "${rawValue}"` };
      }
      return { value: num, error: null };
    }

    case 'boolean': {
      if (typeof rawValue === 'boolean') return { value: rawValue, error: null };
      if (rawValue === 'true' || rawValue === 1) return { value: true, error: null };
      if (rawValue === 'false' || rawValue === 0 || rawValue === '') return { value: false, error: null };
      return { value: Boolean(rawValue), error: null };
    }

    case 'object': {
      if (typeof rawValue === 'object' && !Array.isArray(rawValue)) {
        return { value: rawValue, error: null };
      }
      if (typeof rawValue === 'string') {
        if (rawValue.trim() === '') return { value: null, error: null };
        try {
          const parsed = JSON.parse(rawValue);
          if (typeof parsed !== 'object' || Array.isArray(parsed) || parsed === null) {
            return { value: rawValue, error: 'Expected JSON object' };
          }
          return { value: parsed, error: null };
        } catch {
          return { value: rawValue, error: 'Invalid JSON' };
        }
      }
      return { value: rawValue, error: `Expected object, got ${typeof rawValue}` };
    }

    case 'array': {
      if (Array.isArray(rawValue)) return { value: rawValue, error: null };
      if (typeof rawValue === 'string') {
        if (rawValue.trim() === '') return { value: [], error: null };
        try {
          const parsed = JSON.parse(rawValue);
          if (!Array.isArray(parsed)) {
            return { value: rawValue, error: 'Expected JSON array' };
          }
          return { value: parsed, error: null };
        } catch {
          return { value: rawValue, error: 'Invalid JSON array' };
        }
      }
      return { value: rawValue, error: `Expected array, got ${typeof rawValue}` };
    }

    default:
      return { value: rawValue, error: null };
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Validate and coerce runtime input args against a schema.
 *
 * @param {Array<{ key: string, type: string, required?: boolean }>} argSchema
 * @param {Object}  inputArgs   Flat { key: value } object
 * @returns {{ valid: boolean, errors: Object<string, string>, coercedValues: Object }}
 */
function validateAndCoerceInputArgs(argSchema, inputArgs) {
  const safeInputArgs = inputArgs || {};
  const errors = {};
  const coercedValues = {};

  if (!Array.isArray(argSchema) || argSchema.length === 0) {
    // No schema — pass through all values as-is
    return { valid: true, errors: {}, coercedValues: { ...safeInputArgs } };
  }

  for (const arg of argSchema) {
    const { key, type: rawType = 'string', required = false } = arg;
    const type = normalizeType(rawType);
    if (!key) continue;

    const rawValue = safeInputArgs[key];

    // Required check
    if (required && (rawValue === undefined || rawValue === null || rawValue === '')) {
      errors[key] = `"${key}" is required`;
      continue;
    }

    // Skip coercion for missing optional values
    if (rawValue === undefined || rawValue === null) {
      coercedValues[key] = rawValue ?? null;
      continue;
    }

    // Coerce
    const { value, error } = coerceValue(rawValue, type);
    if (error) {
      errors[key] = `"${key}": ${error}`;
    } else {
      coercedValues[key] = value;
    }
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
    coercedValues,
  };
}

/**
 * Convert a KVT (key-value-type) array to a flat typed object.
 * This is the improved version of the original json.util.js function
 * with added `array` type support.
 *
 * @param {Array<{ key: string, type: string, value: * }>} kvtArray
 * @returns {Object}
 */
function keyValueTypeArrayToObject(kvtArray) {
  if (!Array.isArray(kvtArray)) return {};

  const obj = {};
  for (const item of kvtArray) {
    if (!item.key) continue;
    const { value } = coerceValue(item.value, normalizeType(item.type || 'string'));
    obj[item.key] = value;
  }
  return obj;
}

module.exports = {
  validateAndCoerceInputArgs,
  keyValueTypeArrayToObject,
  coerceValue,
  normalizeType,
  SUPPORTED_TYPES,
  LEGACY_TYPE_MAP,
};

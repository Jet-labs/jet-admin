/**
 * Input Values Utility
 *
 * Centralized resolution, validation, coercion, and extraction 
 * for input values used across data-query, workflow, and cron-job modules.
 *
 * Canonical input schema shape:
 *   { key: string, type: 'string'|'number'|'boolean'|'object'|'array', required?: boolean, default?: any, supportsTemplate?: boolean }
 *
 * Canonical runtime values shape:
 *   { [key]: any }   (flat object)
 */

const { prisma } = require('../config/prisma.config');
const Logger = require('./logger');

const SUPPORTED_TYPES = ['string', 'number', 'boolean', 'object', 'array'];

// ─── Definition Providers ─────────────────────────────────────────────────────

/**
 * Normalise a raw input-schema array into a canonical InputDefinition[].
 *
 * @param {Array<{ key: string, type?: string, required?: boolean, default?: * }>} inputDefinitions
 * @param {{ definitionSource?: string, supportsTemplate?: boolean }} [options]
 * @returns {Array<object>}
 */
function normalizeDefinitions(inputDefinitions, options = {}) {
  if (!Array.isArray(inputDefinitions)) return [];

  const {
    definitionSource = 'native',
    supportsTemplate = false,
  } = options;

  return inputDefinitions
    .filter((input) => input && input.key)
    .map((input) => ({
      key: input.key,
      type: input.type || 'string',
      required: input.required === true,
      default: input.default !== undefined ? input.default : (input.defaultValue !== undefined ? input.defaultValue : undefined),
      supportsTemplate,
      definitionSource,
    }));
}

function extractWorkflowDefinitions(workflow) {
  if (!workflow || !workflow.workflowOptions) return [];
  return normalizeDefinitions(
    workflow.workflowOptions.inputDefinitions,
    { definitionSource: 'native', supportsTemplate: false }
  );
}

function extractQueryDefinitions(dataQuery) {
  if (!dataQuery || !dataQuery.dataQueryOptions) return [];
  return normalizeDefinitions(
    dataQuery.dataQueryOptions.inputDefinitions,
    { definitionSource: 'native', supportsTemplate: true }
  );
}

/**
 * Fetch input definitions by executable type and ID.
 *
 * @param {'workflow'|'query'|'node'|'widget'|'cron'} type
 * @param {string|number} id  Entity primary key
 * @returns {Promise<Array<object>>}  Normalised InputDefinition[]
 */
async function getInputDefinitions(type, id) {
  Logger.log('info', {
    message: 'inputValues:getInputDefinitions',
    params: { type, id },
  });

  switch (type) {
    case 'workflow': {
      const workflow = await prisma.tblWorkflows.findUnique({ where: { workflowID: id } });
      return extractWorkflowDefinitions(workflow);
    }
    case 'query': {
      const query = await prisma.tblDataQueries.findFirst({ where: { dataQueryID: id } });
      return extractQueryDefinitions(query);
    }
    case 'cron': {
      const cronJob = await prisma.tblCronJobs.findFirst({
        where: { cronJobID: id },
        include: { tblWorkflows: true },
      });
      if (!cronJob?.tblWorkflows) return [];
      const defs = extractWorkflowDefinitions(cronJob.tblWorkflows);
      return defs.map((d) => ({ ...d, definitionSource: 'derived' }));
    }
    default:
      Logger.log('warning', {
        message: 'inputValues:unknownType',
        params: { type, id },
      });
      return [];
  }
}

// ─── Coercion helpers ─────────────────────────────────────────────────────────

function normalizeType(type) {
  if (!type) return 'string';
  return type;
}

/**
 * Coerce a single value to the declared type.
 * Returns { value, error } — error is a string if coercion fails.
 */
function coerceValue(rawValue, type) {
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

// ─── Pipeline Stages ──────────────────────────────────────────────────────────

function resolveInputTemplates(inputDefinitions, values, contextData) {
  const resolved = { ...values };
  const errors = {};
  if (!contextData) return { values: resolved, errors };

  const { resolveTemplate } = require("@jet-admin/expression-engine");

  for (const def of inputDefinitions) {
    if (!def.supportsTemplate || resolved[def.key] === undefined || resolved[def.key] === null) continue;
    try {
      resolved[def.key] = resolveTemplate(resolved[def.key], contextData, { preserveSingleExpressionType: true });
    } catch (err) {
      errors[def.key] = `Template resolution failed: ${err.message}`;
    }
  }
  return { values: resolved, errors };
}

function applyInputDefaults(inputDefinitions, values) {
  const resolved = { ...values };
  for (const def of inputDefinitions) {
    if ((resolved[def.key] === undefined || resolved[def.key] === null) && def.default !== undefined) {
      resolved[def.key] = def.default;
    }
  }
  return { values: resolved, errors: {} };
}

function coerceInputTypes(inputDefinitions, values) {
  const resolved = { ...values };
  const errors = {};
  for (const def of inputDefinitions) {
    if (resolved[def.key] === undefined || resolved[def.key] === null) continue;
    const type = normalizeType(def.type);
    const { value: coerced, error } = coerceValue(resolved[def.key], type);
    if (error) {
      errors[def.key] = `"${def.key}": ${error}`;
    } else {
      resolved[def.key] = coerced;
    }
  }
  return { values: resolved, errors };
}

function validateRequiredInputs(inputDefinitions, values) {
  const resolved = { ...values };
  const errors = {};
  for (const def of inputDefinitions) {
    if (def.required && (resolved[def.key] === undefined || resolved[def.key] === null || resolved[def.key] === '')) {
      errors[def.key] = `"${def.key}" is required`;
    }
  }
  return { values: resolved, errors };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Convert a KVT (key-value-type) array to a flat typed object.
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

/**
 * Resolve inputs through the unified multi-stage pipeline.
 */
async function resolveInputs({
  type,
  id,
  inputDefinitions,
  inputValues = {},
  contextData,
} = {}) {
  // Stage 0: Get definitions
  let defs = inputDefinitions;
  if (!defs && type && id) {
    defs = await getInputDefinitions(type, id);
  }

  // No definitions → pass through all values as-is
  if (!Array.isArray(defs) || defs.length === 0) {
    return { resolved: { ...inputValues }, errors: {}, valid: true };
  }

  // Sequentially process each stage, accumulating errors and halting processing 
  // for a specific key if it fails an earlier stage.
  const resolved = {};
  const errors = {};

  for (const def of defs) {
    if (!def.key) continue;

    let value = inputValues[def.key];
    let hasError = false;

    // Stage 1: Templates
    if (def.supportsTemplate && value !== undefined && value !== null && contextData) {
      try {
        const { resolveTemplate } = require("@jet-admin/expression-engine");
        value = resolveTemplate(value, contextData, { preserveSingleExpressionType: true });
      } catch (err) {
        errors[def.key] = `Template resolution failed: ${err.message}`;
        hasError = true;
      }
    }

    if (hasError) continue;

    // Stage 2: Defaults
    if ((value === undefined || value === null) && def.default !== undefined) {
      value = def.default;
    }

    // Stage 3: Coerce
    const type = normalizeType(def.type);
    if (value !== undefined && value !== null) {
      const { value: coerced, error } = coerceValue(value, type);
      if (error) {
        errors[def.key] = `"${def.key}": ${error}`;
        hasError = true;
      } else {
        value = coerced;
      }
    }

    if (hasError) continue;

    // Stage 4: Validate required
    if (def.required && (value === undefined || value === null || value === '')) {
      errors[def.key] = `"${def.key}" is required`;
      hasError = true;
    }

    if (hasError) continue;

    resolved[def.key] = value !== undefined ? value : null;
  }

  return {
    resolved,
    errors,
    valid: Object.keys(errors).length === 0,
  };
}

module.exports = {
  // Main pipeline
  resolveInputs,
  
  // Pipeline stages
  resolveInputTemplates,
  applyInputDefaults,
  coerceInputTypes,
  validateRequiredInputs,
  
  // Definition providers
  normalizeDefinitions,
  extractWorkflowDefinitions,
  extractQueryDefinitions,
  getInputDefinitions,

  // Utilities
  keyValueTypeArrayToObject,
  coerceValue,
  normalizeType,
  SUPPORTED_TYPES,
};

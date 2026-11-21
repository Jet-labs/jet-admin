/**
 * fieldContracts — canonical field value contracts for form + standalone inputs
 * (E08/E11/E12/E14-E21 prerequisites, F05 semantics).
 *
 * Pure + dependency-free so widget-types validation, widgets-ui renderers and
 * jest suites share one implementation. Renderers must import from here instead
 * of duplicating coercion.
 *
 * Boolean policy (section 4 "input booleans"):
 * - true / 1 / "true" / "1" (trimmed, case-insensitive) -> true
 * - false / 0 / "false" / "0" / "" -> false
 * - null / undefined (unset) -> defaultValue
 * - anything else (objects, "yes", "on", ...) -> false (fail closed, never
 *   enable on ambiguous input). In particular the string "false" is false.
 *
 * Typed values:
 * - text-like fields stay strings; number fields stay numbers (empty draft
 *   stays "" so required/clear semantics survive); checkbox/switch stay booleans.
 * - select values preserve original types via normalizeOptions; the UI coerces
 *   to string only for display, never for state (avoids 1 vs "1" collisions).
 */

const TRUE_STRINGS = new Set(["true", "1"]);
const FALSE_STRINGS = new Set(["false", "0", ""]);

/**
 * Strict boolean normalization shared by every input widget + form fields.
 * @param {*} value raw config/state value (may be template-resolved)
 * @param {boolean} [defaultValue=false] used only when value is null/undefined
 */
export const normalizeFieldBoolean = (value, defaultValue = false) => {
  if (value === null || value === undefined) return !!defaultValue;
  if (typeof value === "boolean") return value;
  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
    return false;
  }
  if (typeof value === "string") {
    const t = value.trim().toLowerCase();
    if (t === "") return false;
    if (TRUE_STRINGS.has(t)) return true;
    if (FALSE_STRINGS.has(t)) return false;
    return false;
  }
  return false;
};

/** Template-capable disabled/required/readOnly all share the same policy. */
export const normalizeDisabled = (v) => normalizeFieldBoolean(v, false);
export const normalizeRequired = (v) => normalizeFieldBoolean(v, false);
export const normalizeReadOnly = (v) => normalizeFieldBoolean(v, false);

/**
 * Normalize a static options list to { label, value } preserving value types.
 * Accepts strings, numbers, booleans, or { label, value } objects.
 * Duplicate values are kept (validation reports them); label falls back to
 * String(value).
 */
export const normalizeOptions = (options) => {
  if (!Array.isArray(options)) return [];
  return options.map((opt) => {
    if (typeof opt === "object" && opt !== null && "value" in opt) {
      const value = opt.value;
      const label = opt.label ?? String(value ?? "");
      return { label: String(label), value, disabled: normalizeDisabled(opt.disabled) };
    }
    return { label: String(opt ?? ""), value: opt, disabled: false };
  });
};

/**
 * Resolve bound template options (already resolved to an array by the runtime)
 * with labelKey/valueKey mapping, preserving original value types.
 */
export const normalizeBoundOptions = (tpl, labelKey = "label", valueKey = "value") => {
  if (!Array.isArray(tpl)) return [];
  return tpl.map((o) => {
    if (typeof o === "object" && o !== null) {
      const value = o[valueKey] ?? o.value;
      const label = o[labelKey] ?? o.label ?? value;
      return { label: String(label ?? ""), value, disabled: normalizeDisabled(o.disabled) };
    }
    return { label: String(o ?? ""), value: o, disabled: false };
  });
};

/** Find an option by strict value equality (1 !== "1"). */
export const findOptionByValue = (normalizedOptions, value) =>
  (normalizedOptions || []).find((o) => o.value === value) || null;

/**
 * Coerce a raw form draft value to its typed state value.
 * - checkbox: boolean via normalizeFieldBoolean
 * - number: "" stays "" (empty draft); otherwise Number(raw), NaN -> NaN flag
 * - select/radio: pass through untouched (type preservation)
 * - everything else: String(raw ?? "")
 */
export const coerceFieldValue = (fieldType, raw) => {
  const t = fieldType || "text";
  if (t === "checkbox") return normalizeFieldBoolean(raw, false);
  if (t === "number") {
    if (raw === "" || raw === null || raw === undefined) return "";
    if (typeof raw === "number") return raw;
    const n = Number(raw);
    return n;
  }
  if (t === "select" || t === "radio" || t === "multiselect") return raw;
  if (t === "date" || t === "datetime" || t === "file" || t === "hidden") return raw;
  return raw === null || raw === undefined ? "" : String(raw);
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validate one form field value. Returns an error string or null.
 * Handles required for every type (including select "" and checkbox false),
 * email shape, number bounds/NaN, length bounds, pattern, and option membership.
 */
export const validateFieldValue = (fieldDef = {}, value, normalizedOpts = null) => {
  const type = fieldDef.type || "text";
  const required = normalizeRequired(fieldDef.required);
  const isEmpty =
    value === undefined ||
    value === null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0) ||
    (type === "checkbox" && value === false);

  if (isEmpty) {
    if (required) {
      if (type === "checkbox") return `${fieldDef.label || fieldDef.key || "This field"} must be checked.`;
      if (type === "select") return `${fieldDef.label || fieldDef.key || "This field"} is required. Choose an option.`;
      return `${fieldDef.label || fieldDef.key || "This field"} is required.`;
    }
    return null;
  }

  if (type === "email" && typeof value === "string" && value !== "" && !EMAIL_RE.test(value)) {
    return `Enter a valid email address.`;
  }
  if (type === "number") {
    const n = typeof value === "number" ? value : Number(value);
    if (!Number.isFinite(n)) return `Enter a valid number.`;
    const v = fieldDef.validation || {};
    if (v.min !== undefined && n < v.min) return `Must be at least ${v.min}.`;
    if (v.max !== undefined && n > v.max) return `Must be at most ${v.max}.`;
    return null;
  }
  if (typeof value === "string") {
    const v = fieldDef.validation || {};
    if (v.minLength !== undefined && value.length < v.minLength)
      return `Must be at least ${v.minLength} characters.`;
    if (v.maxLength !== undefined && value.length > v.maxLength)
      return `Must be at most ${v.maxLength} characters.`;
    if (fieldDef.maxLength !== undefined && value.length > fieldDef.maxLength)
      return `Must be at most ${fieldDef.maxLength} characters.`;
    if (v.pattern) {
      try {
        const re = new RegExp(v.pattern);
        if (!re.test(value)) return `Value does not match the required pattern.`;
      } catch {
        return null;
      }
    }
  }
  if ((type === "select" || type === "radio") && normalizedOpts) {
    const ok = normalizedOpts.some((o) => o.value === value);
    if (!ok) return `Selected value is not a valid option.`;
  }
  if (type === "multiselect" && Array.isArray(value) && normalizedOpts) {
    const bad = value.filter((val) => !normalizedOpts.some((o) => o.value === val));
    if (bad.length > 0) return `One or more selected values are invalid.`;
  }
  return null;
};

/**
 * Build default values for a fields array (dual-read: defaultValue ?? default).
 * Number fields default to "" when no default is configured so the empty draft
 * stays empty; checkbox defaults to false.
 */
export const buildFieldDefaults = (fields = []) => {
  const defaults = {};
  for (const f of fields) {
    if (!f || !f.key) continue;
    const raw = f.defaultValue !== undefined ? f.defaultValue : f.default;
    if (raw !== undefined) {
      defaults[f.key] = f.type === "number" && raw === "" ? "" : raw;
    } else {
      defaults[f.key] = f.type === "checkbox" ? false : "";
    }
    if ((f.type === "checkbox") && typeof defaults[f.key] !== "boolean") {
      defaults[f.key] = normalizeFieldBoolean(defaults[f.key], false);
    }
  }
  return defaults;
};

/**
 * Merge fresh defaults into current values without overwriting dirty fields.
 * @param {object} values current draft
 * @param {object} defaults freshly computed defaults
 * @param {Set<string>|string[]} dirtyKeys keys the user (or methods) touched
 * @returns {object} merged draft
 */
export const mergeDefaultsPreservingDirty = (values = {}, defaults = {}, dirtyKeys = []) => {
  const dirty = dirtyKeys instanceof Set ? dirtyKeys : new Set(dirtyKeys || []);
  const out = { ...(values || {}) };
  for (const [k, v] of Object.entries(defaults || {})) {
    if (dirty.has(k)) continue;
    if (out[k] === undefined) out[k] = v;
  }
  // Drop values for removed fields (but keep dirty set management to caller).
  for (const k of Object.keys(out)) {
    if (!(k in (defaults || {}))) delete out[k];
  }
  return out;
};

/**
 * Normalize form-level layout config (E08 contract reconciliation).
 * Canonical: size ("sm"|"default"|"lg"), showReset (boolean), layout
 * ("vertical"|"horizontal"|"grid"), columns (number), resetLabel (string).
 * Legacy: resetLabel implies showReset when showReset is unset; size aliases
 * ("small"->"sm", "large"->"lg", "medium"->"default") migrate.
 */
export const normalizeFormLayout = (config = {}) => {
  const out = { ...config };
  const sizeAliases = { small: "sm", large: "lg", medium: "default", compact: "sm", spacious: "lg" };
  if (typeof out.size === "string" && sizeAliases[out.size]) out.size = sizeAliases[out.size];
  if (!["sm", "default", "lg"].includes(out.size)) out.size = out.size || "default";
  if (out.showReset === undefined && out.resetLabel !== undefined) {
    out.showReset = typeof out.resetLabel === "string" ? out.resetLabel !== "" : !!out.resetLabel;
  }
  out.showReset = !!out.showReset;
  if (!["vertical", "horizontal", "grid"].includes(out.layout)) out.layout = out.layout || "vertical";
  const cols = Number(out.columns);
  out.columns = out.layout === "grid" ? (Number.isFinite(cols) && cols >= 1 ? Math.min(Math.floor(cols), 4) : 2) : 1;
  if (out.showReset && (out.resetLabel === undefined || out.resetLabel === "")) out.resetLabel = "Reset";
  return out;
};

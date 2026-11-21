/**
 * fieldA11y — instance-scoped accessible field identities (F05/B09/B10).
 *
 * Every form field, date trigger, calendar grid and time input must use
 * instance-scoped IDs so two placements of the same resource never duplicate
 * IDs. Labels associate via htmlFor; help/error text associates via
 * aria-describedby; invalid fields set aria-invalid and announce via live
 * regions owned by the widget (not global).
 *
 * Pure helpers (testable in node) + one React hook for stable suffixes.
 */
import { useId } from "react";

const sanitize = (s) =>
  String(s ?? "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "field";

/**
 * Build a deterministic field ID from the runtime instance + field key.
 * instanceID is the placement instance (widget_42_7 or ...::repeat:...),
 * never the bare resource ID, so duplicates stay isolated (B24).
 */
export const buildFieldId = (instanceID, fieldKey, index = 0) => {
  const inst = sanitize(instanceID || "widget");
  const key = sanitize(fieldKey || `field-${index}`);
  return `${inst}--${key}`;
};

/**
 * Derive help/error/description IDs + aria-describedby for a field.
 * @param {string} fieldId base input id
 * @param {{ help?: boolean, error?: string|null }} opts
 */
export const buildFieldA11y = (fieldId, opts = {}) => {
  const helpId = opts.help ? `${fieldId}-help` : null;
  const errorId = opts.error ? `${fieldId}-error` : null;
  const describedBy = [helpId, errorId].filter(Boolean).join(" ") || undefined;
  return { helpId, errorId, describedBy };
};

/**
 * React hook returning a stable instance suffix for widgets that do not
 * receive an explicit instanceID (standalone preview). When instanceID exists
 * it is used verbatim; otherwise a useId suffix keeps multiple preview
 * instances unique.
 */
export const useInstanceSuffix = (instanceID) => {
  const reactId = useId();
  if (instanceID) return String(instanceID);
  return `preview-${sanitize(reactId)}`;
};

/**
 * Resolve the effective instance key for a widget from all accepted props.
 * Preference: instanceID > widgetID > resourceID > placementKey.
 */
export const resolveInstanceKey = (props = {}) =>
  props.instanceID || props.widgetID || props.resourceID || props.placementKey || "";

/**
 * Focus helper: focus the first invalid field from a ref map.
 * @param {Map<string, HTMLElement>|object} refMap key -> element
 * @param {string[]} invalidKeys ordered field keys
 */
export const focusFirstInvalid = (refMap, invalidKeys = []) => {
  const get = (k) => (refMap instanceof Map ? refMap.get(k) : refMap?.[k]);
  for (const k of invalidKeys) {
    const el = get(k);
    if (el && typeof el.focus === "function") {
      el.focus();
      return k;
    }
  }
  return null;
};

/**
 * Widget config validation (F04/F15 authoring + resolved validation).
 *
 * `validateWidgetConfig(widgetType, config, { mode })` checks a config
 * against its canonical descriptor:
 * - unknown widget type -> invalid
 * - required keys (present and correctly shaped)
 * - known scalar fields: type-checked. At authoring time (`mode:
 *   'authoring'`, the default) `{{ }}` template strings are accepted on
 *   template-capable props; at `mode: 'resolved'` leftover templates are
 *   errors and concrete values must match.
 * - unknown config keys are ALLOWED (extension metadata passes through)
 * - unknown event names produce warnings (kept, never dropped)
 *
 * Validation never throws for bad input; it returns structured errors.
 */

import { getWidgetDescriptor } from "./descriptors.js";
import { getSupportedEvents } from "./index.js";

const hasTemplate = (value) =>
  typeof value === "string" && value.includes("{{") && value.includes("}}");

// Known scalar field specs per type: { types: [...], template: bool }.
// Only fields with reconciliation or validation relevance are listed;
// everything else passes through as extension metadata.
const FIELD_SPECS = {
  button: {
    text: { types: ["string"], template: true },
    label: { types: ["string"], template: true },
    variant: {
      types: ["string"],
      values: [
        "default", "secondary", "green", "destructive", "white", "outline",
        "ghost", "link", "pill", "primary-ghost", "destructive-ghost", "primary-outline",
      ],
    },
    size: { types: ["string"], values: ["default", "sm", "lg", "icon", "circle", "pill"] },
    icon: { types: ["string"] },
    iconPosition: { types: ["string"], values: ["left", "right"] },
    alignment: { types: ["string"], values: ["left", "center", "right"] },
    fullWidth: { types: ["boolean", "string"], template: true },
    disabled: { types: ["boolean", "string"], template: true },
    isLoading: { types: ["boolean", "string"], template: true },
    loading: { types: ["boolean", "string"], template: true },
  },
  text: {
    content: { types: ["string"], template: true },
    format: { types: ["string"], values: ["markdown", "plain"] },
    fontSize: { types: ["string"] },
    fontWeight: { types: ["string"], values: ["normal", "bold", "semibold"] },
    color: { types: ["string"] },
    align: { types: ["string"], values: ["left", "center", "right"] },
    textAlign: { types: ["string"], values: ["left", "center", "right"] },
    isLoading: { types: ["boolean", "string"], template: true },
  },
  stat: {
    value: { types: ["string", "number"], template: true },
    valueTemplate: { types: ["string", "number"], template: true },
    label: { types: ["string"], template: true },
    prefix: { types: ["string"] },
    suffix: { types: ["string"] },
    trend: { types: ["object", "string"], template: true },
    trendTemplate: { types: ["string", "number"], template: true },
    trendDirection: { types: ["string"], values: ["up-is-good", "down-is-good"] },
    textAlign: { types: ["string"], values: ["left", "center", "right"] },
    decimals: { types: ["number"] },
    icon: { types: ["string"] },
    iconColor: { types: ["string"] },
    isLoading: { types: ["boolean", "string"], template: true },
  },
  alert: {
    message: { types: ["string"], template: true },
    title: { types: ["string"], template: true },
    variant: { types: ["string"], values: ["info", "success", "warning", "error"] },
    dismissible: { types: ["boolean"] },
    icon: { types: ["boolean"] },
    visible: { types: ["boolean", "string"], template: true },
    isLoading: { types: ["boolean", "string"], template: true },
  },
  form: {
    submitLabel: { types: ["string"] },
    resetLabel: { types: ["string"] },
    layout: { types: ["string"], values: ["vertical", "horizontal", "grid"] },
    columns: { types: ["number"] },
    showReset: { types: ["boolean"] },
    size: { types: ["string"], values: ["default", "sm", "lg"] },
    isLoading: { types: ["boolean", "string"], template: true },
  },
  image: {
    src: { types: ["string"], template: true },
    alt: { types: ["string"] },
    objectFit: { types: ["string"], values: ["cover", "contain", "fill", "none", "scale-down"] },
    borderRadius: { types: ["string"] },
    linkUrl: { types: ["string"], template: true },
    linkTarget: { types: ["string"], values: ["_blank", "_self"] },
    isLoading: { types: ["boolean", "string"], template: true },
  },
  video: {
    src: { types: ["string"], template: true },
    poster: { types: ["string"], template: true },
    autoplay: { types: ["boolean"] },
    controls: { types: ["boolean"] },
    loop: { types: ["boolean"] },
    muted: { types: ["boolean"] },
    isLoading: { types: ["boolean", "string"], template: true },
  },
  iframe: {
    url: { types: ["string"], template: true },
    src: { types: ["string"], template: true },
    allowScripts: { types: ["boolean", "string"] },
    allowForms: { types: ["boolean", "string"] },
    allowPopups: { types: ["boolean", "string"] },
    allowSameOrigin: { types: ["boolean", "string"] },
    isLoading: { types: ["boolean", "string"], template: true },
    height: { types: ["number", "string"] },
    scrolling: { types: ["boolean"] },
    allowFullscreen: { types: ["boolean"] },
    sandbox: { types: ["string"] },
  },
  html: {
    html: { types: ["string"], template: true },
    css: { types: ["string"], template: true },
    js: { types: ["string"] },
    allowScripts: { types: ["boolean", "string"] },
    allowForms: { types: ["boolean", "string"] },
    allowPopups: { types: ["boolean", "string"] },
    isLoading: { types: ["boolean", "string"], template: true },
    height: { types: ["number", "string"] },
    scrollable: { types: ["boolean"] },
  },
  "date-picker": {
    label: { types: ["string"] },
    help: { types: ["string"] },
    placeholder: { types: ["string"] },
    defaultValue: { types: ["string"], template: true },
    enableTime: { types: ["boolean"] },
    dateFormat: { types: ["string"] },
    minDate: { types: ["string"] },
    maxDate: { types: ["string"] },
    disabledDates: { types: ["array"] },
    required: { types: ["boolean", "string"], template: true },
    disabled: { types: ["boolean", "string"], template: true },
    readOnly: { types: ["boolean", "string"], template: true },
    isLoading: { types: ["boolean", "string"], template: true },
  },
  "date-range-picker": {
    label: { types: ["string"] },
    help: { types: ["string"] },
    startPlaceholder: { types: ["string"] },
    endPlaceholder: { types: ["string"] },
    placeholderStart: { types: ["string"] },
    placeholderEnd: { types: ["string"] },
    defaultStart: { types: ["string"], template: true },
    defaultEnd: { types: ["string"], template: true },
    enableTime: { types: ["boolean"] },
    requireApply: { types: ["boolean"] },
    dateFormat: { types: ["string"] },
    minDate: { types: ["string"] },
    maxDate: { types: ["string"] },
    disabledDates: { types: ["array"] },
    required: { types: ["boolean", "string"], template: true },
    disabled: { types: ["boolean", "string"], template: true },
    readOnly: { types: ["boolean", "string"], template: true },
    isLoading: { types: ["boolean", "string"], template: true },
  },
  "text-input": {
    label: { types: ["string"] },
    placeholder: { types: ["string"] },
    inputType: { types: ["string"], values: ["text", "number", "email", "password", "url", "textarea"] },
    defaultValue: { types: ["string"], template: true },
    required: { types: ["boolean"] },
    disabled: { types: ["boolean", "string"], template: true },
    maxLength: { types: ["number"] },
    rows: { types: ["number"] },
    isLoading: { types: ["boolean", "string"], template: true },
  },
  select: {
    label: { types: ["string"] },
    placeholder: { types: ["string"] },
    optionsTemplate: { types: ["string"], template: true },
    labelKey: { types: ["string"] },
    valueKey: { types: ["string"] },
    defaultValue: { types: ["string", "number", "boolean"], template: true },
    required: { types: ["boolean"] },
    disabled: { types: ["boolean", "string"], template: true },
    clearable: { types: ["boolean"] },
    isLoading: { types: ["boolean", "string"], template: true },
  },
  "multi-select": {
    label: { types: ["string"] },
    placeholder: { types: ["string"] },
    optionsTemplate: { types: ["string"], template: true },
    labelKey: { types: ["string"] },
    valueKey: { types: ["string"] },
    defaultValue: { types: ["array"], template: true },
    maxSelected: { types: ["number"] },
    disabled: { types: ["boolean", "string"], template: true },
    isLoading: { types: ["boolean", "string"], template: true },
  },
  checkbox: {
    label: { types: ["string"] },
    defaultChecked: { types: ["boolean", "string"], template: true },
    disabled: { types: ["boolean", "string"], template: true },
    description: { types: ["string"] },
    isLoading: { types: ["boolean", "string"], template: true },
  },
  "radio-group": {
    label: { types: ["string"] },
    optionsTemplate: { types: ["string"], template: true },
    labelKey: { types: ["string"] },
    valueKey: { types: ["string"] },
    defaultValue: { types: ["string", "number", "boolean"], template: true },
    orientation: { types: ["string"], values: ["horizontal", "vertical"] },
    disabled: { types: ["boolean", "string"], template: true },
    isLoading: { types: ["boolean", "string"], template: true },
  },
  switch: {
    label: { types: ["string"] },
    defaultChecked: { types: ["boolean", "string"], template: true },
    disabled: { types: ["boolean", "string"], template: true },
    description: { types: ["string"] },
    isLoading: { types: ["boolean", "string"], template: true },
  },
  slider: {
    label: { types: ["string"] },
    min: { types: ["number"] },
    max: { types: ["number"] },
    step: { types: ["number"] },
    defaultValue: { types: ["number", "string"], template: true },
    showValue: { types: ["boolean"] },
    disabled: { types: ["boolean", "string"], template: true },
    isLoading: { types: ["boolean", "string"], template: true },
  },
  "search-input": {
    label: { types: ["string"] },
    placeholder: { types: ["string"] },
    defaultValue: { types: ["string"], template: true },
    debounceMs: { types: ["number"] },
    disabled: { types: ["boolean", "string"], template: true },
    isLoading: { types: ["boolean", "string"], template: true },
  },
  "file-upload": {
    label: { types: ["string"] },
    accept: { types: ["string"] },
    multiple: { types: ["boolean"] },
    maxSizeMB: { types: ["number"] },
    buttonLabel: { types: ["string"] },
    disabled: { types: ["boolean", "string"], template: true },
    isLoading: { types: ["boolean", "string"], template: true },
  },
  divider: {
    label: { types: ["string"] },
    orientation: { types: ["string"], values: ["horizontal", "vertical"] },
    thickness: { types: ["string"], values: ["thin", "medium", "thick"] },
    spacing: { types: ["string"], values: ["sm", "md", "lg"] },
  },
  tabs: {
    defaultTab: { types: ["string"] },
    isLoading: { types: ["boolean", "string"], template: true },
  },
  "key-value": {
    dataTemplate: { types: ["string"], template: true },
    columns: { types: ["number"] },
    emptyText: { types: ["string"] },
    isLoading: { types: ["boolean", "string"], template: true },
  },
  "json-viewer": {
    dataTemplate: { types: ["string"], template: true },
    collapsed: { types: ["boolean"] },
    isLoading: { types: ["boolean", "string"], template: true },
  },
  list: {
    dataTemplate: { types: ["string"], template: true },
    titleKey: { types: ["string"] },
    subtitleKey: { types: ["string"] },
    layout: { types: ["string"] },
    searchable: { types: ["boolean"] },
    emptyText: { types: ["string"] },
    isLoading: { types: ["boolean", "string"], template: true },
  },
  badge: {
    text: { types: ["string"], template: true },
    variant: { types: ["string"] },
    size: { types: ["string"] },
    isLoading: { types: ["boolean", "string"], template: true },
  },
  progress: {
    value: { types: ["string", "number"], template: true },
    valueTemplate: { types: ["string", "number"], template: true },
    variant: { types: ["string"] },
    status: { types: ["string"] },
    showValue: { types: ["boolean"] },
    isLoading: { types: ["boolean", "string"], template: true },
  },
  timeline: {
    dataTemplate: { types: ["string"], template: true },
    titleKey: { types: ["string"] },
    timeKey: { types: ["string"] },
    descriptionKey: { types: ["string"] },
    emptyText: { types: ["string"] },
    isLoading: { types: ["boolean", "string"], template: true },
  },
  "vega-lite": {
    showActions: { types: ["boolean"] },
    renderer: { types: ["string"], values: ["svg", "canvas"] },
    theme: { types: ["string"] },
    isLoading: { types: ["boolean", "string"], template: true },
  },
  vega: {
    showActions: { types: ["boolean"] },
    renderer: { types: ["string"], values: ["svg", "canvas"] },
    theme: { types: ["string"] },
    isLoading: { types: ["boolean", "string"], template: true },
  },
  table: {
    dataArrayTemplate: { types: ["string"], template: true },
    emptyText: { types: ["string"] },
    emptyHint: { types: ["string"] },
    striped: { types: ["boolean"] },
    dense: { types: ["boolean"] },
    stickyHeader: { types: ["boolean"] },
    searchable: { types: ["boolean"] },
    exportable: { types: ["boolean"] },
    selectable: { types: ["boolean"] },
    isLoading: { types: ["boolean", "string"], template: true },
  },
  "code-block": {
    code: { types: ["string"], template: true },
    language: { types: ["string"] },
    showCopy: { types: ["boolean"] },
    isLoading: { types: ["boolean", "string"], template: true },
  },
};

const jsType = (v) => (Array.isArray(v) ? "array" : v === null ? "null" : typeof v);

/**
 * @param {string} widgetType
 * @param {object} config
 * @param {{ mode?: 'authoring'|'resolved' }} opts
 * @returns {{ valid: boolean, errors: Array<{code:string,field?:string,message:string}>, warnings: Array<{code:string,field?:string,message:string}> }}
 */
export const validateWidgetConfig = (widgetType, config, opts = {}) => {
  const mode = opts.mode === "resolved" ? "resolved" : "authoring";
  const errors = [];
  const warnings = [];
  const descriptor = getWidgetDescriptor(widgetType);
  if (!descriptor) {
    return {
      valid: false,
      errors: [{ code: "unknown-type", message: `Unknown widgetType: '${widgetType}'.` }],
      warnings,
    };
  }
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    return {
      valid: false,
      errors: [{ code: "config-object", message: "widgetConfig must be an object." }],
      warnings,
    };
  }

  // Required keys (presence, not non-emptiness: empty values render
  // documented fallbacks/empty states, so only undefined/null are missing).
  for (const key of descriptor.required || []) {
    const v = config[key];
    if (v === undefined || v === null) {
      errors.push({ code: "required", field: key, message: `Missing required config key: '${key}'.` });
    }
  }
  if (widgetType === "form" && config.fields !== undefined && !Array.isArray(config.fields)) {
    errors.push({ code: "type", field: "fields", message: "`fields` must be an array." });
  }
  if (
    widgetType === "form" &&
    Array.isArray(config.fields) &&
    config.fields.some((f) => !f || typeof f !== "object" || !f.key)
  ) {
    errors.push({
      code: "fields",
      field: "fields",
      message: "Every form field must be an object with a `key`.",
    });
  }

  // Known scalar fields.
  const specs = FIELD_SPECS[widgetType] || {};
  for (const [key, spec] of Object.entries(specs)) {
    const v = config[key];
    if (v === undefined) continue;
    const templated = hasTemplate(v);
    if (templated) {
      if (mode === "resolved") {
        errors.push({
          code: "unresolved-template",
          field: key,
          message: `Unresolved template in '${key}' at render time.`,
        });
      } else if (!spec.template && typeof v === "string") {
        warnings.push({
          code: "template-not-supported",
          field: key,
          message: `'${key}' does not support templates; the expression will render literally.`,
        });
      }
      continue;
    }
    const t = jsType(v);
    if (!spec.types.includes(t)) {
      errors.push({
        code: "type",
        field: key,
        message: `'${key}' must be ${spec.types.join("/")} (got ${t}).`,
      });
      continue;
    }
    if (spec.values && !spec.values.includes(v)) {
      errors.push({
        code: "enum",
        field: key,
        message: `'${key}' must be one of ${spec.values.join(", ")}.`,
      });
    }
  }

  // Events: unknown names warn (kept, never dropped).
  if (config.events !== undefined) {
    if (!config.events || typeof config.events !== "object" || Array.isArray(config.events)) {
      errors.push({ code: "type", field: "events", message: "`events` must be an object." });
    } else {
      const supported = new Set(getSupportedEvents(widgetType).map((e) => e.value));
      for (const name of Object.keys(config.events)) {
        if (!supported.has(name)) {
          warnings.push({
            code: "unsupported-event",
            field: `events.${name}`,
            message: `'${name}' is not a supported '${widgetType}' event; it is preserved but will not fire.`,
          });
        }
      }
    }
  }

  return { valid: errors.length === 0, errors, warnings };
};

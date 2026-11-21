/**
 * Widget config normalization (F04 dual-read migration).
 *
 * `normalizeWidgetConfig(widgetType, input)` reads legacy and canonical
 * shapes deterministically and writes the canonical shape:
 * - legacy alias keys migrate to canonical keys (canonical wins conflicts)
 * - chart option nesting, root showHeader, table/text/stat/form/vega legacy
 *   forms reconcile per section 4
 * - unknown keys, `events`, and `properties` pass through untouched — events
 *   and styles are never silently dropped
 * - normalization is idempotent: normalize(normalize(x)) deep-equals
 *   normalize(x) with zero new migrations
 *
 * Runtime renderers keep dual-READ fallbacks for rows saved before any
 * re-save (see widgets-ui renderers/builders); this module is the WRITE path
 * used by API validation and authoring tools.
 */

import { getWidgetDescriptor } from "./descriptors.js";

const cloneJson = (value) => {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
};

const isPlainObject = (v) =>
  !!v && typeof v === "object" && !Array.isArray(v);

const deepEqual = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/**
 * @returns {{ config: object, migrations: Array<{from:string,to:string,note?:string}>, warnings: Array<{code:string,message:string}> }}
 */
export const normalizeWidgetConfig = (widgetType, input) => {
  const descriptor = getWidgetDescriptor(widgetType);
  const migrations = [];
  const warnings = [];
  const source =
    input && typeof input === "object" && !Array.isArray(input) ? input : {};
  const config = cloneJson(source);

  const migrated = (from, to, note) => migrations.push(note ? { from, to, note } : { from, to });
  const warn = (code, message) => warnings.push({ code, message });

  // 1. Generic alias migration (legacy -> canonical, canonical wins).
  //    Most aliases are removed after migration so output is canonical;
  //    exceptions with intentional dual-write are handled per-type below.
  //    Table boolean->object flags need type coercion, so they are deferred
  //    to the per-type block instead of a plain copy here.
  const deferred = DEFERRED_ALIASES[widgetType] || [];
  const aliases = (descriptor && descriptor.aliases) || {};
  for (const [from, to] of Object.entries(aliases)) {
    if (deferred.includes(from)) continue;
    if (config[from] === undefined) continue;
    if (config[to] === undefined) {
      config[to] = config[from];
      migrated(from, to);
    } else if (!deepEqual(config[from], config[to])) {
      warn(
        "alias-conflict",
        `Both "${from}" and canonical "${to}" are set with different values; "${to}" wins.`
      );
    }
    // Dual-write exceptions keep both keys mirrored (see per-type rules).
    if (!DUAL_WRITE[widgetType]?.includes(from)) {
      // vega `spec` is intentionally preserved (see below).
      if (!(widgetType === "vega" || widgetType === "vega-lite") || from !== "spec") {
        delete config[from];
      }
    }
  }

  // 2. Chrome: root showHeader -> properties.showHeader (properties wins).
  if (config.showHeader !== undefined) {
    config.properties = isPlainObject(config.properties) ? config.properties : {};
    if (config.properties.showHeader === undefined) {
      config.properties.showHeader = config.showHeader;
      migrated("showHeader", "properties.showHeader");
    } else if (config.properties.showHeader !== config.showHeader) {
      warn(
        "showheader-conflict",
        "Root showHeader ignored: properties.showHeader wins."
      );
    }
    delete config.showHeader;
  }

  // 3. Per-type reconciliation (section 4 priority rows).
  switch (widgetType) {
    case "stat": {
      // Dual-write value <-> valueTemplate so old and new readers agree.
      // Only meaningful (non-empty) values mirror: mirroring "" would invent
      // keys and, for trend, a type the schema does not allow.
      const meaningful = (v) => v !== undefined && v !== "";
      if (config.valueTemplate === undefined && meaningful(config.value)) {
        config.valueTemplate = config.value;
        migrated("value", "valueTemplate");
      } else if (config.value === undefined && meaningful(config.valueTemplate)) {
        config.value = config.valueTemplate;
        migrated("valueTemplate", "value");
      } else if (
        meaningful(config.value) &&
        meaningful(config.valueTemplate) &&
        !deepEqual(config.value, config.valueTemplate)
      ) {
        config.value = config.valueTemplate;
        warn("stat-value-conflict", "value and valueTemplate differ; valueTemplate wins and is mirrored to value.");
      }
      if (config.trendTemplate === undefined && meaningful(config.trend)) {
        config.trendTemplate = config.trend;
        migrated("trend", "trendTemplate");
      } else if (config.trend === undefined && meaningful(config.trendTemplate)) {
        config.trend = config.trendTemplate;
        migrated("trendTemplate", "trend");
      }
      break;
    }
    case "vega-lite":
    case "vega": {
      // Canonical render spec is vegaSpec; `spec` stays as a mirrored alias
      // for maximal reader compatibility (builder reads vegaSpec ?? spec).
      if (config.vegaSpec === undefined && config.spec !== undefined) {
        config.vegaSpec = config.spec;
        migrated("spec", "vegaSpec");
      } else if (config.spec === undefined && config.vegaSpec !== undefined) {
        config.spec = config.vegaSpec;
        migrated("vegaSpec", "spec");
      }
      // Nested options wrapper -> root (explicit root values win).
      if (isPlainObject(config.options)) {
        for (const key of ["showActions", "renderer", "theme"]) {
          if (config.options[key] !== undefined && config[key] === undefined) {
            config[key] = config.options[key];
            migrated(`options.${key}`, key);
          }
        }
      }
      break;
    }
    case "table": {
      const boolToObject = (key, enabledKey) => {
        const legacy = config[key];
        if (legacy === undefined) return;
        if (typeof legacy === "boolean") {
          if (config[enabledKey] === undefined) {
            config[enabledKey] = { enabled: legacy };
          } else if (
            isPlainObject(config[enabledKey]) &&
            config[enabledKey].enabled !== undefined &&
            config[enabledKey].enabled !== legacy
          ) {
            warn(
              "table-flag-conflict",
              `"${key}" disagrees with "${enabledKey}.enabled; object form wins.`
            );
          }
          delete config[key];
          migrated(key, enabledKey);
        }
      };
      boolToObject("searchable", "search");
      boolToObject("exportable", "export");
      boolToObject("selectable", "multiSelect");
      if (config.bulkActions !== undefined && config.multiSelect === undefined) {
        config.multiSelect = { actions: config.bulkActions };
        delete config.bulkActions;
        migrated("bulkActions", "multiSelect");
      } else if (config.bulkActions !== undefined && isPlainObject(config.multiSelect)) {
        if (config.multiSelect.actions === undefined) {
          config.multiSelect.actions = config.bulkActions;
          migrated("bulkActions", "multiSelect.actions");
        }
        delete config.bulkActions;
      } else if (config.bulkActions !== undefined) {
        delete config.bulkActions;
        migrated("bulkActions", "multiSelect");
      }
      // dataArrayTemplate is the canonical binding field: no transform, but
      // ensure it is never dropped (passthrough by default).
      break;
    }
    case "form": {
      // resetLabel (custom label) implies a visible reset control; showReset
      // is the canonical boolean the renderer reads. Both are preserved.
      if (config.showReset === undefined && config.resetLabel !== undefined) {
        config.showReset =
          typeof config.resetLabel === "string"
            ? config.resetLabel !== ""
            : !!config.resetLabel;
        migrated("resetLabel", "showReset");
      }
      // size aliases migrate to canonical sm/default/lg (E08 reconciliation).
      const sizeAliases = { small: "sm", large: "lg", medium: "default", compact: "sm", spacious: "lg" };
      if (typeof config.size === "string" && sizeAliases[config.size]) {
        const from = config.size;
        config.size = sizeAliases[config.size];
        migrated(from, config.size);
      }
      if (!Array.isArray(config.fields) && config.fields !== undefined) {
        warn("form-fields-type", "`fields` should be an array; left untouched for validation to report.");
      }
      break;
    }
    case "date-range-picker": {
      // Canonical placeholders are placeholderStart/placeholderEnd (descriptor
      // aliases handle generic migration). Preset shapes pass through:
      // canonical { label, start, end } and legacy { label, startOffset,
      // endOffset } both render (renderer dual-reads).
      break;
    }
    case "html": {
      // Legacy raw sandbox string -> capability flags when flags are unset.
      // The string itself is preserved (may carry tokens flags cannot).
      if (
        typeof config.sandbox === "string" &&
        config.sandbox.trim() !== "" &&
        config.allowScripts === undefined &&
        config.allowForms === undefined &&
        config.allowPopups === undefined
      ) {
        const tokens = config.sandbox.split(/\s+/);
        if (tokens.includes("allow-scripts")) config.allowScripts = true;
        if (tokens.includes("allow-forms")) config.allowForms = true;
        if (tokens.includes("allow-popups")) config.allowPopups = true;
        migrated("sandbox", "allowScripts/allowForms/allowPopups");
      }
      break;
    }
    default:
      break;
  }

  return { config, migrations, warnings };
};

/** Alias keys with intentional dual-write (both keys kept mirrored). */
const DUAL_WRITE = {
  stat: ["value", "trend"],
  "vega-lite": ["spec"],
  vega: ["spec"],
};

/** Aliases needing type coercion; migrated in the per-type block instead. */
const DEFERRED_ALIASES = {
  table: ["searchable", "exportable", "selectable", "bulkActions"],
};

/**
 * Normalize in place-check helper: true when a config is already canonical
 * (a second pass produces zero migrations and a deep-equal config).
 */
export const isNormalizedConfig = (widgetType, config) => {
  const once = normalizeWidgetConfig(widgetType, config);
  const twice = normalizeWidgetConfig(widgetType, once.config);
  return twice.migrations.length === 0 && deepEqual(once.config, twice.config);
};

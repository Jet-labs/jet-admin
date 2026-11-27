/**
 * AppPage URL ↔ variable sync
 *
 * Deep-linking for app pages:
 * - readVariablesFromUrl: seeds variable overrides from query params on load
 *   (`?search=foo&page=2` → variables.search / variables.page, coerced to the
 *   declared variable type).
 * - writeVariablesToUrl: mirrors non-default variable values back into the
 *   URL via history.replaceState, so any filtered view can be copied/shared.
 *   Only deltas from the defaults are written — URLs stay clean.
 *
 * Application routes can additionally bind a subset of page variables to
 * declared route query parameters. The route host passes an allowlist so
 * unrelated page variables never leak into the URL, and owns the actual
 * router navigation (instead of history.replaceState).
 */

const coerceParam = (raw, type) => {
  switch (type) {
    case "number": {
      if (raw === "" || raw === null) return undefined;
      const n = Number(raw);
      return Number.isNaN(n) ? undefined : n;
    }
    case "boolean": {
      if (raw === "true") return true;
      if (raw === "false") return false;
      return undefined;
    }
    case "object":
    case "array": {
      try {
        const parsed = JSON.parse(raw);
        return typeof parsed === "object" && parsed !== null ? parsed : undefined;
      } catch {
        return undefined;
      }
    }
    default:
      return raw;
  }
};

/**
 * Read variable overrides from the current URL query params.
 * Only variables declared in the page config are picked up; values that
 * fail type coercion are ignored.
 */
export const readVariablesFromUrl = (definitions) => {
  const overrides = {};
  if (typeof window === "undefined" || !Array.isArray(definitions)) {
    return overrides;
  }
  const params = new URLSearchParams(window.location.search);
  for (const def of definitions) {
    if (!def?.key || !params.has(def.key)) continue;
    const coerced = coerceParam(params.get(def.key), def.type);
    if (coerced !== undefined) {
      overrides[def.key] = coerced;
    }
  }
  return overrides;
};

const stringifyVariable = (value) => {
  if (value !== null && typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return String(value);
    }
  }
  return String(value);
};

/**
 * Apply non-default variable values to a URLSearchParams instance.
 * Returns true when at least one parameter changed. An optional `keys`
 * allowlist limits synchronization to specific variables (used by
 * application routes with declared query parameters).
 */
export const applyVariablesToSearchParams = (
  params,
  definitions,
  values,
  { keys } = {}
) => {
  if (!(params instanceof URLSearchParams) || !Array.isArray(definitions)) {
    return false;
  }
  const allowed = Array.isArray(keys) ? new Set(keys) : null;
  let changed = false;

  for (const def of definitions) {
    if (!def?.key) continue;
    if (allowed && !allowed.has(def.key)) continue;
    const current = values[def.key];
    const isDefault =
      current === undefined ||
      current === (def.defaultValue !== undefined ? def.defaultValue : null);

    if (isDefault) {
      if (params.has(def.key)) {
        params.delete(def.key);
        changed = true;
      }
      continue;
    }

    const serialized = stringifyVariable(current);
    if (params.get(def.key) !== serialized) {
      params.set(def.key, serialized);
      changed = true;
    }
  }
  return changed;
};

/**
 * Write non-default variable values into the URL (replaceState — no history
 * spam). Params equal to the variable's default are removed so shared links
 * only encode meaningful state. Unrelated query params are preserved.
 * Pass `keys` to restrict synchronization to an allowlist.
 */
export const writeVariablesToUrl = (definitions, values, options = {}) => {
  if (typeof window === "undefined" || !Array.isArray(definitions)) return;

  const params = new URLSearchParams(window.location.search);
  if (!applyVariablesToSearchParams(params, definitions, values, options)) {
    return;
  }

  const qs = params.toString();
  const nextUrl = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
  window.history.replaceState(null, "", nextUrl);
};

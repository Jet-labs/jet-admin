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
 * Write non-default variable values into the URL (replaceState — no history
 * spam). Params equal to the variable's default are removed so shared links
 * only encode meaningful state. Unrelated query params are preserved.
 */
export const writeVariablesToUrl = (definitions, values) => {
  if (typeof window === "undefined" || !Array.isArray(definitions)) return;

  const params = new URLSearchParams(window.location.search);
  let changed = false;

  for (const def of definitions) {
    if (!def?.key) continue;
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

  if (!changed) return;

  const qs = params.toString();
  const nextUrl = `${window.location.pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
  window.history.replaceState(null, "", nextUrl);
};

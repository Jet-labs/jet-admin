/**
 * Application state persistence.
 *
 * Persistence is opt-in per application definition:
 *   state.persistence = { mode: "none" | "session" | "local", resetOnRelease: true }
 *
 * Values are stored per tenant + application. With `resetOnRelease` the
 * storage key includes the release ID, so deploying a new release starts from
 * the declared defaults. Without it, compatible values survive releases.
 * Persisted values are filtered through the current declarations and the same
 * safe-JSON/type rules as live SET_APPLICATION_VARIABLE assignments.
 */
import {
  isSafeApplicationJSON,
  matchesApplicationType,
} from "@jet-admin/application-contracts";

export const APPLICATION_STATE_STORAGE_PREFIX = "jet-admin:application-state:v1";

export function normalizeApplicationStatePersistence(persistence) {
  const mode = ["none", "session", "local"].includes(persistence?.mode)
    ? persistence.mode
    : "none";
  return {
    mode,
    resetOnRelease: persistence?.resetOnRelease !== false,
  };
}

export function applicationStateStorageKey({
  tenantID,
  applicationID,
  releaseID,
  resetOnRelease,
  scope = null,
}) {
  const releaseScope = resetOnRelease ? `release:${releaseID || "unknown"}` : "shared";
  const principalScope = scope || "default";
  return `${APPLICATION_STATE_STORAGE_PREFIX}:${tenantID}:${applicationID}:${principalScope}:${releaseScope}`;
}

export function getApplicationStateStorage(mode) {
  if (typeof window === "undefined") return null;
  try {
    if (mode === "session") return window.sessionStorage;
    if (mode === "local") return window.localStorage;
  } catch {
    return null;
  }
  return null;
}

export function readPersistedApplicationState({ storage, key, declarations }) {
  if (!storage || !key || !declarations) return {};
  try {
    const raw = storage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const values = {};
    for (const [variableKey, declaration] of Object.entries(declarations)) {
      if (!Object.prototype.hasOwnProperty.call(parsed, variableKey)) continue;
      const value = parsed[variableKey];
      if (!isSafeApplicationJSON(value)) continue;
      if (!matchesApplicationType(value, declaration.type)) continue;
      values[variableKey] = value;
    }
    return values;
  } catch {
    return {};
  }
}

export function writePersistedApplicationState({
  storage,
  key,
  declarations,
  variables,
}) {
  if (!storage || !key || !declarations || !variables) return false;
  try {
    const values = {};
    for (const variableKey of Object.keys(declarations)) {
      if (!Object.prototype.hasOwnProperty.call(variables, variableKey)) continue;
      const value = variables[variableKey];
      if (!isSafeApplicationJSON(value)) continue;
      if (!matchesApplicationType(value, declarations[variableKey].type)) continue;
      values[variableKey] = value;
    }
    storage.setItem(key, JSON.stringify(values));
    return true;
  } catch {
    return false;
  }
}

export function clearPersistedApplicationState({ storage, key }) {
  if (!storage || !key) return false;
  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Clears every stored snapshot for an application across modes and releases.
 * Used by the Studio "clear saved state" control.
 */
export function clearAllPersistedApplicationState({
  tenantID,
  applicationID,
}) {
  if (typeof window === "undefined") return 0;
  const prefix = `${APPLICATION_STATE_STORAGE_PREFIX}:${tenantID}:${applicationID}:`;
  let removed = 0;
  for (const storage of [window.sessionStorage, window.localStorage]) {
    try {
      const keys = [];
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (key && key.startsWith(prefix)) keys.push(key);
      }
      keys.forEach((key) => {
        storage.removeItem(key);
        removed += 1;
      });
    } catch {
      /* storage unavailable */
    }
  }
  return removed;
}

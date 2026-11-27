import { createStore } from "zustand/vanilla";
import { matchesApplicationType, isSafeApplicationJSON } from "@jet-admin/application-contracts";
import {
  applicationStateStorageKey,
  clearPersistedApplicationState,
  getApplicationStateStorage,
  normalizeApplicationStatePersistence,
  readPersistedApplicationState,
  writePersistedApplicationState,
} from "./applicationStatePersistence";

// Factory, never a module-global session singleton. Stores no API data/secrets.
export function createApplicationStore(declarations = {}, options = {}) {
  const defaults = Object.fromEntries(
    Object.entries(declarations).map(([key, item]) => [key, structuredClone(item.default)])
  );
  const persistence = normalizeApplicationStatePersistence(options.persistence);
  const storage = getApplicationStateStorage(persistence.mode);
  const storageKey =
    storage && options.tenantID && options.applicationID
      ? applicationStateStorageKey({
          tenantID: options.tenantID,
          applicationID: options.applicationID,
          releaseID: options.releaseID,
          resetOnRelease: persistence.resetOnRelease,
          scope: options.scope,
        })
      : null;
  const persisted = readPersistedApplicationState({
    storage,
    key: storageKey,
    declarations,
  });
  const initial = { ...defaults, ...persisted };

  const store = createStore(set => ({
    variables: initial,
    setVariable(key, value) {
      if (!Object.prototype.hasOwnProperty.call(declarations, key) || !isSafeApplicationJSON(value) || !matchesApplicationType(value, declarations[key].type)) throw new Error("Invalid application variable assignment");
      set(state => ({ variables: { ...state.variables, [key]: structuredClone(value) } }));
    },
    reset: () => {
      set({ variables: structuredClone(defaults) });
      clearPersistedApplicationState({ storage, key: storageKey });
    },
  }));

  if (storage && storageKey) {
    store.subscribe(state => {
      writePersistedApplicationState({
        storage,
        key: storageKey,
        declarations,
        variables: state.variables,
      });
    });
  }

  return store;
}

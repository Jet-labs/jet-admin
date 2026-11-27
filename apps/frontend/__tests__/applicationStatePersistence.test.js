import { createApplicationStore } from "../src/logic/applicationRuntime/applicationStore";
import {
  applicationStateStorageKey,
  clearAllPersistedApplicationState,
  readPersistedApplicationState,
} from "../src/logic/applicationRuntime/applicationStatePersistence";

class MemoryStorage {
  constructor() {
    this.values = new Map();
  }

  get length() {
    return this.values.size;
  }

  key(index) {
    return Array.from(this.values.keys())[index] ?? null;
  }

  getItem(key) {
    return this.values.has(key) ? this.values.get(key) : null;
  }

  setItem(key, value) {
    this.values.set(String(key), String(value));
  }

  removeItem(key) {
    this.values.delete(key);
  }

  clear() {
    this.values.clear();
  }
}

const memorySessionStorage = new MemoryStorage();
const memoryLocalStorage = new MemoryStorage();
global.window = {
  sessionStorage: memorySessionStorage,
  localStorage: memoryLocalStorage,
};

const declarations = {
  selectedCustomer: { type: "string", default: "none" },
  count: { type: "number", default: 0 },
};

const identity = {
  tenantID: "tenant-1",
  applicationID: "app-1",
};

describe("application state persistence", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    window.localStorage.clear();
  });

  it("does not persist when mode is none", () => {
    const store = createApplicationStore(declarations, {
      ...identity,
      releaseID: "r1",
      persistence: { mode: "none" },
    });
    store.getState().setVariable("selectedCustomer", "acme");
    const key = applicationStateStorageKey({
      ...identity,
      releaseID: "r1",
      resetOnRelease: true,
    });
    expect(window.sessionStorage.getItem(key)).toBeNull();
    expect(window.localStorage.getItem(key)).toBeNull();
  });

  it("hydrates session state across reloads for the same release", () => {
    const store = createApplicationStore(declarations, {
      ...identity,
      releaseID: "r1",
      persistence: { mode: "session", resetOnRelease: true },
    });
    store.getState().setVariable("selectedCustomer", "acme");

    const restored = createApplicationStore(declarations, {
      ...identity,
      releaseID: "r1",
      persistence: { mode: "session", resetOnRelease: true },
    });
    expect(restored.getState().variables.selectedCustomer).toBe("acme");
  });

  it("resets on a new release when resetOnRelease is enabled", () => {
    const store = createApplicationStore(declarations, {
      ...identity,
      releaseID: "r1",
      persistence: { mode: "session", resetOnRelease: true },
    });
    store.getState().setVariable("selectedCustomer", "acme");

    const nextRelease = createApplicationStore(declarations, {
      ...identity,
      releaseID: "r2",
      persistence: { mode: "session", resetOnRelease: true },
    });
    expect(nextRelease.getState().variables.selectedCustomer).toBe("none");
  });

  it("keeps compatible values across releases when resetOnRelease is disabled", () => {
    const store = createApplicationStore(declarations, {
      ...identity,
      releaseID: "r1",
      persistence: { mode: "local", resetOnRelease: false },
    });
    store.getState().setVariable("selectedCustomer", "acme");

    const nextRelease = createApplicationStore(declarations, {
      ...identity,
      releaseID: "r2",
      persistence: { mode: "local", resetOnRelease: false },
    });
    expect(nextRelease.getState().variables.selectedCustomer).toBe("acme");
  });

  it("drops persisted values that no longer match the declared type", () => {
    const key = applicationStateStorageKey({
      ...identity,
      releaseID: "r2",
      resetOnRelease: false,
    });
    window.localStorage.setItem(
      key,
      JSON.stringify({ selectedCustomer: 42, count: 7, removed: "stale" })
    );
    const store = createApplicationStore(declarations, {
      ...identity,
      releaseID: "r2",
      persistence: { mode: "local", resetOnRelease: false },
    });
    expect(store.getState().variables.selectedCustomer).toBe("none");
    expect(store.getState().variables.count).toBe(7);
    expect(store.getState().variables.removed).toBeUndefined();
  });

  it("reset restores defaults and clears the saved snapshot", () => {
    const store = createApplicationStore(declarations, {
      ...identity,
      releaseID: "r1",
      persistence: { mode: "local", resetOnRelease: false },
    });
    store.getState().setVariable("selectedCustomer", "acme");
    store.getState().reset();
    expect(store.getState().variables.selectedCustomer).toBe("none");

    const key = applicationStateStorageKey({
      ...identity,
      releaseID: "r1",
      resetOnRelease: false,
    });
    expect(readPersistedApplicationState({
      storage: window.localStorage,
      key,
      declarations,
    })).toEqual({});
  });

  it("clears all snapshots for an application", () => {
    const store = createApplicationStore(declarations, {
      ...identity,
      releaseID: "r1",
      persistence: { mode: "local", resetOnRelease: true },
    });
    store.getState().setVariable("selectedCustomer", "acme");
    expect(
      clearAllPersistedApplicationState(identity)
    ).toBeGreaterThan(0);
  });
});

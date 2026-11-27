/**
 * Bounded in-memory cache for keep-alive application page runtimes.
 *
 * A cached entry stores the reducer snapshot (never widget method functions)
 * so returning to a route can restore variables, query results and widget
 * state without remounting the page. The cache lives for one application
 * runtime session and is discarded when the deployed release changes.
 */

export const DEFAULT_PAGE_STATE_CACHE_LIMIT = 20;

export function createPageStateCache({ limit = DEFAULT_PAGE_STATE_CACHE_LIMIT } = {}) {
  const entries = new Map();
  const maxEntries = Math.max(1, Math.min(Number(limit) || DEFAULT_PAGE_STATE_CACHE_LIMIT, 100));

  return {
    get(key) {
      if (!key || !entries.has(key)) return null;
      const value = entries.get(key);
      entries.delete(key);
      entries.set(key, value);
      return value;
    },
    set(key, state) {
      if (!key || !state) return;
      entries.delete(key);
      entries.set(key, state);
      while (entries.size > maxEntries) {
        entries.delete(entries.keys().next().value);
      }
    },
    delete(key) {
      entries.delete(key);
    },
    clear() {
      entries.clear();
    },
    get size() {
      return entries.size;
    },
  };
}

export function snapshotPageState(state) {
  if (!state || typeof state !== "object") return null;
  const snapshot = { ...state };
  delete snapshot.widgetMethods;
  return snapshot;
}

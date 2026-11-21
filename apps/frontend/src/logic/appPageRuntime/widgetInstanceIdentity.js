/**
 * widgetInstanceIdentity — B24 / F01 instance identity + F12 repeat scope.
 *
 * Three identities (never conflate them):
 * - resourceID: persisted widget resource, e.g. `123` from `widget_123_4`.
 *   Used for definition fetch (getWidgetByIDAPI), persistence, tenant
 *   boundaries, and bundle import remap (resource portion only, suffix kept).
 * - placementID: full persisted placement key, e.g. `widget_123_4`. Unique per
 *   placement on a page. This is the runtime instance key for non-repeated
 *   widgets.
 * - repeat instanceID: `${placementID}::repeat:${path}` where path joins
 *   `${nodeId}:${index}` segments for each enclosing repeat. Runtime-only,
 *   never persisted. Each repeat iteration gets isolated state/methods.
 *
 * New explicit reference form (deterministic, always preferred):
 * - state: `{{ state.widgets.<placementID>.value }}` e.g.
 *   `{{ state.widgets.widget_42_7.value }}`, repeat iterations via their full
 *   `::repeat:` instance key.
 * - methods: CALL_WIDGET_METHOD `targetWidgetID` = full placement/instance key.
 *
 * Legacy compatibility policy for `state.widgets.<resourceID>` and
 * CALL_WIDGET_METHOD targets holding a bare resourceID:
 * - exactly one live instance  -> resolves to it (deterministic, silent).
 * - zero live instances        -> missing (warn on method call, undefined binding).
 * - more than one live instance -> AMBIGUOUS: never silently reroute to an
 *   arbitrary placement. Bindings resolve to undefined; method calls are
 *   skipped with a console.warn naming the candidates. Authors must migrate
 *   to the explicit instance form.
 *
 * Inside a repeat iteration, a bare placement/resource ref in that iteration's
 * own config/actions resolves to the firing iteration (iteration-scoped view).
 * That is deterministic per iteration, not an arbitrary global pick.
 */

export const REPEAT_SEGMENT_SEPARATOR = "::repeat:";

/**
 * Extract the persisted resource ID from any placement/instance key.
 * Handles: `widget_<id>`, `widget_<id>_<n>`, `widget_<id>_<ts>`,
 * `<placement>::repeat:<path>`. Returns "" for missing/invalid keys.
 */
export const parseResourceID = (widgetKey) => {
  if (widgetKey === null || widgetKey === undefined) return "";
  const base = String(widgetKey).split("::")[0];
  const parts = base.split("_");
  return parts[1] || "";
};

/** Legacy alias kept for existing import sites. */
export const parseWidgetKey = parseResourceID;

/** True when the key already carries a repeat suffix (runtime-only). */
export const isRepeatInstanceID = (key) =>
  typeof key === "string" && key.includes(REPEAT_SEGMENT_SEPARATOR);

/** Normalize an optional repeatPath to an array of non-empty segments. */
export const normalizeRepeatPath = (repeatPath) => {
  if (!repeatPath) return [];
  const list = Array.isArray(repeatPath) ? repeatPath : [repeatPath];
  return list.map((s) => String(s)).filter((s) => s.length > 0);
};

/**
 * Derive the runtime instance ID for a placement, optionally repeat-scoped.
 * Pure + deterministic. Repeat suffixes are runtime-only (never persisted).
 */
export const getPlacementInstanceID = (widgetKey, repeatPath) => {
  const base = String(widgetKey || "");
  const segments = normalizeRepeatPath(repeatPath);
  if (segments.length === 0) return base;
  return `${base}${REPEAT_SEGMENT_SEPARATOR}${segments.join("/")}`;
};

/** Map a runtime instance ID back to its persisted placement key. */
export const getPlacementKeyOfInstance = (instanceID) =>
  String(instanceID || "").split("::")[0];

/**
 * Group live instance IDs by their resource ID.
 * @returns {{ [resourceID]: string[] }} (insertion-ordered, de-duplicated)
 */
export const groupInstancesByResource = (instanceIDs) => {
  const groups = {};
  for (const id of instanceIDs || []) {
    const resource = parseResourceID(id);
    if (!resource) continue;
    if (!groups[resource]) groups[resource] = [];
    if (!groups[resource].includes(id)) groups[resource].push(id);
  }
  return groups;
};

/**
 * Resolve a widget reference to a live instance.
 *
 * Resolution order:
 *  1. exact live instance match (new explicit form) -> { kind: "instance" }
 *  2. bare placement key matching exactly one repeat iteration of that
 *     placement (when repeatPath hint given) is handled by callers via
 *     buildIterationCandidates; here a bare placement key that is itself a
 *     live instance also hits rule 1.
 *  3. resourceID with exactly one live instance -> { kind: "instance" }
 *  4. resourceID with zero live instances -> { kind: "missing" }
 *  5. resourceID with several live instances -> { kind: "ambiguous" }
 *
 * Never picks an arbitrary placement for case 5.
 */
export const resolveLegacyWidgetReference = (ref, liveInstanceIDs) => {
  const target = String(ref || "").replace(/^state\.widgets\./, "");
  const live = Array.isArray(liveInstanceIDs) ? liveInstanceIDs : [];
  if (!target) return { kind: "missing", ref: target, candidates: [] };
  if (live.includes(target)) {
    return { kind: "instance", instanceID: target, ref: target };
  }
  const groups = groupInstancesByResource(live);
  const candidates = groups[target] || [];
  if (candidates.length === 1) {
    return { kind: "instance", instanceID: candidates[0], ref: target };
  }
  if (candidates.length === 0) {
    return { kind: "missing", ref: target, candidates: [] };
  }
  return { kind: "ambiguous", ref: target, candidates: [...candidates] };
};

/**
 * Build the iteration-scoped widgets view for config/action resolution.
 * Global instance keys stay intact; additionally, within this iteration:
 * - the bare placement key aliases to this iteration's state (when present)
 * - the bare resource ID aliases to this iteration's state ONLY when this
 *   placement is the resource's sole placement (repeat iterations of one
 *   placement), so same-row sibling bindings keep working without silently
 *   rerouting across different placements.
 */
export const buildIterationWidgetsView = ({
  globalWidgets = {},
  placementKey,
  resourceID,
  instanceID,
  solePlacementForResource = false,
}) => {
  const view = { ...globalWidgets };
  const current = globalWidgets[instanceID];
  if (current === undefined) return view;
  if (placementKey) view[placementKey] = current;
  if (resourceID && solePlacementForResource) view[resourceID] = current;
  return view;
};

/**
 * Derive the full slot identity exactly as AppPageWidgetSlot does.
 * Testable seam: unit tests lock placement vs repeat derivation here so a
 * future slot refactor cannot silently reintroduce resource-keyed state.
 */
export const deriveSlotIdentity = (widgetKey, repeatPath) => {
  const placementKey = String(widgetKey || "");
  const resourceID = parseResourceID(placementKey);
  const normalized = normalizeRepeatPath(repeatPath);
  return {
    resourceID,
    placementKey,
    repeatPath: normalized,
    instanceID: getPlacementInstanceID(placementKey, normalized),
  };
};

/**
 * Simulate the backend bundle-import resource remap for a placement key:
 * replaces the resource portion, preserves the placement suffix.
 * Repeat suffixes are runtime-only and never reach persisted keys.
 */
export const remapPlacementResource = (placementKey, newResourceID) => {
  if (typeof placementKey !== "string" || !newResourceID) return placementKey;
  const parts = placementKey.split("_");
  if (parts[0] !== "widget" || !parts[1]) return placementKey;
  return ["widget", String(newResourceID), ...parts.slice(2)].join("_");
};

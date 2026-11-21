/**
 * useWidgetState — single documented widget-state update contract (B01/F01).
 *
 * Contract:
 * - `setWidgetState(objectPatch)` shallow-merges the patch into the latest
 *   committed state for `widgetID`, preserving unrelated keys.
 * - `setWidgetState((prev) => partialPatch)` evaluates the updater inside the
 *   reducer against the latest committed widget state (never a stale render
 *   closure), then shallow-merges the returned partial patch the same way.
 * - Updaters must be pure and return a plain object; they run once per
 *   dispatch inside the reducer, keeping the reducer deterministic. The
 *   function itself is never stored: only the resolved plain-object patch is
 *   merged into `widgetStates`, so persisted config/state stays serializable.
 *
 * Date pickers use the object form; most inputs use the functional form.
 * Both forms are equivalent through this hook.
 *
 * B24 identity: `instanceID` is the runtime placement instance
 * (see widgetInstanceIdentity.getPlacementInstanceID), NOT the persisted
 * resource ID. Callers (AppPageWidgetSlot) derive it from the placement
 * widgetKey plus repeat scope so duplicate placements and repeat iterations
 * get isolated state. State is keyed opaquely; legacy resource aliases live
 * only in the built state tree for unambiguous singletons.
 */

import { useCallback, useEffect, useMemo } from "react";
import { useAppPageStateTree } from "./useAppPageStateTree";
import { useAppPageDispatch } from "./useAppPageDispatch";
import { appPageActions } from "./appPageActions";

export const useWidgetState = (instanceID) => {
  const stateTree = useAppPageStateTree();
  const dispatch = useAppPageDispatch();
  const lifetime = useMemo(() => ({ active: true }), [instanceID]);
  useEffect(() => {
    lifetime.active = true;
    return () => { lifetime.active = false; };
  }, [lifetime]);

  const widgetState = stateTree.widgets[instanceID] || {};

  // B01: accept both object patches ({ value }) and React-style
  // functional updaters ((prev) => ({ ...prev, value })). Functions are
  // forwarded untouched and evaluated atomically in the reducer against
  // the latest widget state, so sequential updates never go stale.
  const setWidgetState = useCallback(
    (updates) => {
      if (!lifetime.active) return;
      dispatch(appPageActions.setWidgetState(instanceID, updates));
    },
    [dispatch, instanceID, lifetime]
  );

  return { widgetState, setWidgetState };
};

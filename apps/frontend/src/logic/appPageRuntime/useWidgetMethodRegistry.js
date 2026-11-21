/**
 * useWidgetMethodRegistry
 *
 * Allows widgets to expose callable methods (e.g., modal.open(), table.refresh())
 * that other widgets can invoke via the command bus.
 *
 * Methods are registered on mount and cleaned up on unmount.
 *
 * B24 identity: registration is per runtime placement instance
 * (see widgetInstanceIdentity). Unmounting one placement unregisters only its
 * own instance key — sibling placements of the same resource keep their
 * methods and state.
 */

import { useCallback, useEffect } from "react";
import { useAppPageDispatch } from "./useAppPageDispatch";
import { appPageActions } from "./appPageActions";

export const useWidgetMethodRegistry = (instanceID) => {
  const dispatch = useAppPageDispatch();

  const registerWidgetMethods = useCallback(
    (methods) => {
      dispatch(appPageActions.registerWidgetMethods(instanceID, methods));
    },
    [dispatch, instanceID]
  );

  // Unregister on unmount (instance-scoped: siblings survive)
  useEffect(() => {
    return () => {
      dispatch(appPageActions.unregisterWidget(instanceID));
    };
  }, [dispatch, instanceID]);

  return { registerWidgetMethods };
};

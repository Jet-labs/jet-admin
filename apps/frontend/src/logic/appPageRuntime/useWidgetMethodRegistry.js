/**
 * useWidgetMethodRegistry
 *
 * Allows widgets to expose callable methods (e.g., modal.open(), table.refresh())
 * that other widgets can invoke via the command bus.
 *
 * Methods are registered on mount and cleaned up on unmount.
 */

import { useCallback, useEffect } from "react";
import { useAppPageDispatch } from "./useAppPageDispatch";
import { appPageActions } from "./appPageActions";

export const useWidgetMethodRegistry = (widgetID) => {
  const dispatch = useAppPageDispatch();

  const registerWidgetMethods = useCallback(
    (methods) => {
      dispatch(appPageActions.registerWidgetMethods(widgetID, methods));
    },
    [dispatch, widgetID]
  );

  // Unregister on unmount
  useEffect(() => {
    return () => {
      dispatch(appPageActions.unregisterWidget(widgetID));
    };
  }, [dispatch, widgetID]);

  return { registerWidgetMethods };
};

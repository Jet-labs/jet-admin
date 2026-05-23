/**
 * useWidgetState
 *
 * Manages widget-local UI state (selectedRow, isOpen, value, etc.)
 * within the AppPage runtime context.
 */

import { useCallback } from "react";
import { useAppPageStateTree } from "./useAppPageStateTree";
import { useAppPageDispatch } from "./useAppPageDispatch";
import { appPageActions } from "./appPageActions";

export const useWidgetState = (widgetID) => {
  const stateTree = useAppPageStateTree();
  const dispatch = useAppPageDispatch();

  const widgetState = stateTree.widgets[widgetID] || {};

  const setWidgetState = useCallback(
    (updates) => {
      dispatch(appPageActions.setWidgetState(widgetID, updates));
    },
    [dispatch, widgetID]
  );

  return { widgetState, setWidgetState };
};

/**
 * useAppPageVariables
 *
 * Returns page-level variables and a setter function.
 * Variables are scratch state shared across all widgets on the page.
 */

import { useCallback } from "react";
import { useAppPageStateTree } from "./useAppPageStateTree";
import { useAppPageDispatch } from "./useAppPageDispatch";
import { appPageActions } from "./appPageActions";

export const useAppPageVariables = () => {
  const stateTree = useAppPageStateTree();
  const dispatch = useAppPageDispatch();

  const variables = stateTree.variables;

  const setVariable = useCallback(
    (key, value) => {
      dispatch(appPageActions.setVariable(key, value));
    },
    [dispatch]
  );

  return { variables, setVariable };
};

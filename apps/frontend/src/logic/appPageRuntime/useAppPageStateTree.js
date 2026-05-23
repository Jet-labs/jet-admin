/**
 * useAppPageStateTree
 *
 * Returns the full state tree from the nearest AppPageRuntimeProvider.
 * Use this when you need the entire state tree (e.g., for expression resolution).
 * For specific slices, prefer useAppPageVariables or useAppPageQueries.
 */

import { useContext } from "react";
import { AppPageStateContext } from "./AppPageRuntimeProvider";

export const useAppPageStateTree = () => {
  const stateTree = useContext(AppPageStateContext);
  if (stateTree === null) {
    throw new Error(
      "useAppPageStateTree must be used within an AppPageRuntimeProvider"
    );
  }
  return stateTree;
};

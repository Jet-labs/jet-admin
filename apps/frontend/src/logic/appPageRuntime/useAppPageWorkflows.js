/**
 * useAppPageWorkflows
 *
 * Returns all data source workflow results from the page runtime.
 * Results are keyed by the data source alias.
 */

import { useAppPageStateTree } from "./useAppPageStateTree";

export const useAppPageWorkflows = () => {
  const stateTree = useAppPageStateTree();
  return stateTree.workflows;
};

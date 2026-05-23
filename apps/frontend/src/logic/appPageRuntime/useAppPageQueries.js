/**
 * useAppPageQueries
 *
 * Returns all data source query results from the page runtime.
 * Results are keyed by the data source alias.
 */

import { useAppPageStateTree } from "./useAppPageStateTree";

export const useAppPageQueries = () => {
  const stateTree = useAppPageStateTree();
  return stateTree.queries;
};

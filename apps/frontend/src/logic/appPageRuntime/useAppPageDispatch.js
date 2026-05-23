/**
 * useAppPageDispatch
 *
 * Returns the dispatch function from the nearest AppPageRuntimeProvider.
 * Use this to dispatch actions to the page-level reducer.
 */

import { useContext } from "react";
import { AppPageDispatchContext } from "./AppPageRuntimeProvider";

export const useAppPageDispatch = () => {
  const dispatch = useContext(AppPageDispatchContext);
  if (dispatch === null) {
    throw new Error(
      "useAppPageDispatch must be used within an AppPageRuntimeProvider"
    );
  }
  return dispatch;
};

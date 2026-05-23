/**
 * AppPageDataSourceBootstrapper
 *
 * Thin wrapper component that mounts the data source manager hook.
 * Must be rendered inside an AppPageRuntimeProvider.
 * This component renders nothing — it just bootstraps side-effects.
 */

import { useAppPageDataSourceManager } from "../../../logic/appPageRuntime";

export const AppPageDataSourceBootstrapper = () => {
  useAppPageDataSourceManager();
  return null;
};

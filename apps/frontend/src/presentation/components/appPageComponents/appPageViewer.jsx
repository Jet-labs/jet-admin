/**
 * AppPageViewer
 *
 * The top-level page viewer that:
 * 1. Fetches the page config via the appPage API
 * 2. Wraps children in AppPageRuntimeProvider
 * 3. Bootstraps the data source manager
 * 4. Renders the responsive grid layout with AppPageWidgetSlot instances
 *
 * This replaces the old DashboardViewer with runtime-aware architecture.
 */

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { CONSTANTS } from "../../../constants";
import { getAppPageByIDAPI } from "../../../data/apis/appPage";
import { AppPageRuntimeProvider } from "../../../logic/appPageRuntime/AppPageRuntimeProvider";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { AppPageDataSourceBootstrapper } from "./appPageDataSourceBootstrapper";
import { AppPageWidgetSlot } from "./appPageWidgetSlot";
import { AppPagePrintForm } from "./appPagePrintForm";
import { migrateV1ToV2, LayoutRenderer } from "./layout/index.js";
import { useAppPageStateTree } from "../../../logic/appPageRuntime";
import { resolveValue } from "../../../logic/evaluationEngine";

/**
 * Inner component rendered inside AppPageRuntimeProvider.
 * Accesses the state tree via hooks and threads it to the layout renderer
 * for conditional/iteration-based rendering.
 */
const AppPageViewerContent = ({ tenantID, appPageID, migratedPageConfig }) => {
  const stateTree = useAppPageStateTree();

  const renderWidget = React.useCallback(
    (widgetKey, sizing, scopedStateTree) => (
      <AppPageWidgetSlot
        tenantID={tenantID}
        widgetKey={widgetKey}
        editable={false}
        sizing={sizing}
        scopedStateTree={scopedStateTree}
      />
    ),
    [tenantID]
  );

  return (
    <>
      {/* Bootstrap data sources — fires auto/reactive/polling fetches */}
      <AppPageDataSourceBootstrapper />

      <div
        className="w-full overflow-y-auto bg-muted p-6"
        id={`printable-area-app-page-${appPageID}`}
      >
        {migratedPageConfig.layout && (
          <LayoutRenderer
            node={migratedPageConfig.layout}
            renderWidget={renderWidget}
            mode="view"
            stateTree={stateTree}
            resolveValue={resolveValue}
          />
        )}
      </div>
    </>
  );
};

export const AppPageViewer = ({ tenantID, appPageID }) => {
  AppPageViewer.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    appPageID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };



  const {
    isLoading: isLoadingAppPage,
    data: appPage,
    error: loadAppPageError,
    isFetching: isFetchingAppPage,
    isRefetching: isRefetchingAppPage,
    refetch: refetchAppPage,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.APP_PAGES(tenantID), appPageID],
    queryFn: () =>
      getAppPageByIDAPI({
        tenantID,
        appPageID,
      }),
    refetchOnWindowFocus: false,
  });



  const migratedPageConfig = React.useMemo(() => {
    if (!appPage?.appPageConfig) return null;
    return migrateV1ToV2(appPage.appPageConfig);
  }, [appPage]);

  return (
    <div className="w-full flex flex-col justify-start items-center h-full">
      <div className="flex flex-row justify-between items-center w-full px-3 py-2 border-b border-border">
        <div className="w-full flex flex-col justify-center items-start">
          {appPage && (
            <h1 className="text-2xl font-medium leading-tight tracking-tight text-foreground">
               {appPage.appPageTitle}
            </h1>
          )}
          {appPage && (
            <span className="text-xs text-primary mt-2">
              {`Page ID: ${appPage.appPageID}`}
            </span>
          )}
        </div>
        <div className="flex flex-row justify-end items-center">
          <AppPagePrintForm appPageID={appPageID} />
        </div>
      </div>
      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingAppPage}
        isFetching={isFetchingAppPage}
        error={loadAppPageError}
        refetch={refetchAppPage}
        isRefetching={isRefetchingAppPage}
      >
        {appPage && migratedPageConfig && (
          <AppPageRuntimeProvider
            pageID={appPageID}
            tenantID={tenantID}
            pageConfig={migratedPageConfig}
          >
            <AppPageViewerContent
              tenantID={tenantID}
              appPageID={appPageID}
              migratedPageConfig={migratedPageConfig}
            />
          </AppPageRuntimeProvider>
        )}
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};

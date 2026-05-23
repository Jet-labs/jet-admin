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
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";
import PropTypes from "prop-types";
import { CONSTANTS } from "../../../constants";
import { getAppPageByIDAPI } from "../../../data/apis/appPage";
import { AppPageRuntimeProvider } from "../../../logic/appPageRuntime/AppPageRuntimeProvider";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { AppPageDataSourceBootstrapper } from "./appPageDataSourceBootstrapper";
import { AppPageWidgetSlot } from "./appPageWidgetSlot";

const ResponsiveReactGridLayout = WidthProvider(Responsive);

export const AppPageViewer = ({ tenantID, appPageID }) => {
  AppPageViewer.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    appPageID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };

  const [currentBreakpoint, setCurrentBreakpoint] = useState("lg");

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

  const onBreakpointChange = (newBreakpoint) => {
    setCurrentBreakpoint(newBreakpoint);
  };

  const pageConfig = appPage?.appPageConfig || {};

  return (
    <div className="w-full flex flex-col justify-start items-center h-full">
      <div className="flex flex-row justify-between items-center w-full px-3 py-2 border-b border-border">
        <div className="w-full flex flex-col justify-center items-start">
          {appPage && (
            <h1 className="text-lg font-bold leading-tight tracking-tight text-foreground">
              {appPage.appPageTitle}
            </h1>
          )}
          {appPage && (
            <span className="text-xs text-primary mt-2">
              {`Page ID: ${appPage.appPageID}`}
            </span>
          )}
        </div>
      </div>
      <ReactQueryLoadingErrorWrapper
        isLoading={isLoadingAppPage}
        isFetching={isFetchingAppPage}
        error={loadAppPageError}
        refetch={refetchAppPage}
        isRefetching={isRefetchingAppPage}
      >
        {appPage && (
          <AppPageRuntimeProvider
            pageID={appPageID}
            tenantID={tenantID}
            pageConfig={pageConfig}
          >
            {/* Bootstrap data sources — fires auto/reactive/polling fetches */}
            <AppPageDataSourceBootstrapper />

            <div
              className="w-full overflow-y-auto bg-muted"
              id={`printable-area-app-page-${appPageID}`}
            >
              <ResponsiveReactGridLayout
                isDraggable={false}
                isResizable={false}
                style={{ minHeight: "100%" }}
                draggableCancel=".cancelSelectorName"
                layouts={pageConfig?.layouts}
                measureBeforeMount={false}
                breakpoints={{
                  lg: 1000,
                  md: 996,
                  sm: 768,
                  xs: 480,
                  xxs: 0,
                }}
                onBreakpointChange={onBreakpointChange}
                resizeHandles={["ne", "se", "nw", "sw"]}
                margin={[8, 8]}
                cols={{ lg: 8, md: 6, sm: 5, xs: 4, xxs: 3 }}
                rowHeight={32}
                allowOverlap={false}
              >
                {pageConfig?.widgets?.map((widgetKey, index) => (
                  <div key={widgetKey} draggable={false}>
                    <AppPageWidgetSlot
                      tenantID={tenantID}
                      widgetKey={widgetKey}
                      index={index}
                      editable={false}
                    />
                  </div>
                ))}
              </ResponsiveReactGridLayout>
            </div>
          </AppPageRuntimeProvider>
        )}
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};

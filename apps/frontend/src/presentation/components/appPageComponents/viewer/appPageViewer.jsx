/**
 * AppPageViewer
 *
 * The top-level standalone page viewer. Fetches the page config and renders
 * it through the shared AppPageView (single view-mode implementation —
 * see ./AppPageView.jsx). This component only owns the page header.
 */

import React from "react";
import { useQuery } from "@tanstack/react-query";
import PropTypes from "prop-types";
import { CONSTANTS } from "../../../../constants";
import { getAppPageByIDAPI } from "../../../../data/apis/appPage";
import { ReactQueryLoadingErrorWrapper } from "../../ui/reactQueryLoadingErrorWrapper";
import { AppPagePrintForm } from "../forms/appPagePrintForm";
import { AppPageView } from "./AppPageView";

export const AppPageViewer = ({ tenantID, appPageID }) => {
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

  return (
    <div className="w-full flex flex-col justify-start items-center h-full">
      <div className="flex flex-row justify-between items-center w-full p-2 border-b border-border">
        <div className="w-full flex flex-col justify-center items-start">
          {appPage && (
            <h1 className="text-2xl font-medium leading-tight tracking-tight text-foreground">
               {appPage.appPageTitle}
            </h1>
          )}
          {appPage && (
            <span className="text-xs text-primary">
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
        {appPage?.appPageConfig && (
          <AppPageView
            tenantID={tenantID}
            pageID={appPageID}
            pageConfig={appPage.appPageConfig}
            syncVariablesToUrl={true}
            scrollerClassName="w-full overflow-y-auto bg-muted p-2"
          />
        )}
      </ReactQueryLoadingErrorWrapper>
    </div>
  );
};

AppPageViewer.propTypes = {
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  appPageID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
};

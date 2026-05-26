import React, { useState } from "react";
import { LayoutDashboard, Maximize2, PinOff } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../../constants";
import {
  getAllAppPagesAPI,
  getAppPageByIDAPI,
} from "../../../data/apis/appPage";
import {
  useAuthActions,
  useAuthState,
} from "../../../logic/hooks/useAuth";
import PropTypes from "prop-types";
import { ReactQueryLoadingErrorWrapper } from "./reactQueryLoadingErrorWrapper";
import { AppPageWidgetSlot } from "../appPageComponents/appPageWidgetSlot";
import { AppPageRuntimeProvider } from "../../../logic/appPageRuntime/AppPageRuntimeProvider";
import { AppPageDataSourceBootstrapper } from "../appPageComponents/appPageDataSourceBootstrapper";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { Button, Spinner, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";
import { migrateV1ToV2, LayoutRenderer } from "../appPageComponents/layout/index.js";

export const DefaultAppPageSelectionLayout = ({
  tenantID,
  userConfigKey,
}) => {
  DefaultAppPageSelectionLayout.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    userConfigKey: PropTypes.string.isRequired,
  };
  const fullScreenHandle = useFullScreenHandle();
  const { userConfig, isFetchingUserConfig, isUpdatingUserConfig } =
    useAuthState();
  const { updateUserConfigKey } = useAuthActions();
  const pinnedAppPageID =
    userConfig && userConfig[userConfigKey]
      ? userConfig[userConfigKey]
      : null;

  const {
    isLoading: isLoadingAppPages,
    data: appPages,
    error: loadAppPagesError,
    isFetching: isFetchingAppPages,
    isRefetching: isRefetchingAppPages,
    refetch: refetchAppPages,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.APP_PAGES(tenantID)],
    queryFn: () => getAllAppPagesAPI({ tenantID }),
    refetchOnWindowFocus: false,
  });

  const {
    isLoading: isLoadingAppPage,
    data: appPage,
    error: loadAppPageError,
    isFetching: isFetchingAppPage,
    isRefetching: isRefetchingAppPage,
    refetch: refetchAppPage,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.APP_PAGES(tenantID),
      pinnedAppPageID,
    ],
    queryFn: () =>
      getAppPageByIDAPI({
        tenantID,
        appPageID: pinnedAppPageID,
      }),
    enabled: !!pinnedAppPageID,
    refetchOnWindowFocus: false,
  });

  const _handleSetDefaultAppPage = (appPageID) => {
    updateUserConfigKey({
      tenantID,
      key: userConfigKey,
      value: appPageID,
    });
  };
  const migratedPageConfig = React.useMemo(() => {
    if (!appPage?.appPageConfig) return null;
    return migrateV1ToV2(appPage.appPageConfig);
  }, [appPage]);

  const renderWidget = React.useCallback(
    (widgetKey, sizing) => (
      <AppPageWidgetSlot
        tenantID={tenantID}
        widgetKey={widgetKey}
        editable={false}
        sizing={sizing}
      />
    ),
    [tenantID]
  );

  return (
    <div className="w-full h-full">
      {pinnedAppPageID && appPage ? (
        <div className="w-full flex flex-col justify-start items-center h-full">
          <div className="flex flex-row justify-between items-center w-full px-4 py-3 border-b border-border ">
            <div className="w-full flex flex-col justify-center items-start">
              {appPage && (
                <h1 className="text-2xl font-medium leading-tight tracking-tight text-foreground">
                  {appPage.appPageTitle}
                </h1>
              )}

              {appPage && (
                <span className="text-xs text-primary mt-2">{`Page ID: ${appPage.appPageID} `}</span>
              )}
            </div>
            <div className="flex flex-row justify-center items-center gap-2">
              {isUpdatingUserConfig ? (
                <Spinner size={16} className="text-primary" />
              ) : (
                <>
                  <Select value={String(pinnedAppPageID)} onValueChange={(val) => _handleSetDefaultAppPage(val)}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select an app page" />
                    </SelectTrigger>
                    <SelectContent>
                      {appPages?.map((page) => (
                        <SelectItem
                          key={page.appPageID}
                          value={String(page.appPageID)}
                        >
                          {page.appPageTitle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={() => _handleSetDefaultAppPage(null)}
                    variant="primary-ghost" className="w-fit text-nowrap"
                  >
                    <PinOff className="!w-3.5 !h-3.5 !text-primary" />
                  </Button>
                  <Button
                    onClick={fullScreenHandle.enter}
                    variant="primary-ghost" className="w-fit text-nowrap"
                  >
                    <Maximize2 className="text-primary h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          <FullScreen handle={fullScreenHandle} className="w-full h-full">
            <ReactQueryLoadingErrorWrapper
              isLoading={isLoadingAppPage}
              isFetching={isFetchingAppPage}
              error={loadAppPageError}
              refetch={refetchAppPage}
              isRefetching={isRefetchingAppPage}
            >
              {migratedPageConfig && (
                <AppPageRuntimeProvider
                  pageID={pinnedAppPageID}
                  tenantID={tenantID}
                  pageConfig={migratedPageConfig}
                >
                  <AppPageDataSourceBootstrapper />
                  <div
                    className="w-full overflow-y-auto bg-muted h-full p-2"
                    id={`printable-area-app-page-${pinnedAppPageID}`}
                  >
                    {migratedPageConfig.layout && (
                      <LayoutRenderer
                        node={migratedPageConfig.layout}
                        renderWidget={renderWidget}
                        mode="view"
                      />
                    )}
                  </div>
                </AppPageRuntimeProvider>
              )}
            </ReactQueryLoadingErrorWrapper>
          </FullScreen>
        </div>
      ) : (
        <ReactQueryLoadingErrorWrapper
          isLoading={
            isLoadingAppPages ||
            isFetchingAppPage ||
            isFetchingUserConfig ||
            (pinnedAppPageID && isLoadingAppPages)
          }
          error={loadAppPagesError}
          isFetching={isFetchingAppPages}
          isRefetching={isRefetchingAppPages}
          refetch={refetchAppPages}
        >
          <div className="h-full w-full flex justify-center items-center p-6">
            <div className="bg-background p-8 max-w-md text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <LayoutDashboard className="text-primary text-4xl" />
                </div>
              </div>
              <h2 className="text-xl font-medium text-foreground mb-2">
                {CONSTANTS.STRINGS.APP_PAGE_VIEWER_NO_PINNED_APP_PAGE_TITLE}
              </h2>
              <p className="text-foreground mb-6">
                {
                  CONSTANTS.STRINGS
                    .APP_PAGE_VIEWER_NO_PINNED_APP_PAGE_DESCRIPTION
                }
              </p>
              <div className="flex flex-row justify-center items-center gap-2">
                {isUpdatingUserConfig ? (
                  <Spinner size={16} className="text-primary" />
                ) : (
                  <Select value={String(pinnedAppPageID || '')} onValueChange={(val) => _handleSetDefaultAppPage(val)}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select an app page" />
                    </SelectTrigger>
                    <SelectContent>
                      {appPages?.map((page) => (
                        <SelectItem
                          key={page.appPageID}
                          value={String(page.appPageID)}
                        >
                          {page.appPageTitle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </div>
        </ReactQueryLoadingErrorWrapper>
      )}
    </div>
  );
};

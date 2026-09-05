import React from "react";
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
import { AppPageView } from "../appPageComponents/viewer/AppPageView";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { Button, Spinner, SearchSelect } from "@jet-admin/ui";

export const DefaultAppPageSelectionLayout = ({
  tenantID,
  userConfigKey,
}) => {
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
    data: appPagesData,
    error: loadAppPagesError,
    isFetching: isFetchingAppPages,
    isRefetching: isRefetchingAppPages,
    refetch: refetchAppPages,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.APP_PAGES(tenantID)],
    queryFn: () => getAllAppPagesAPI({ tenantID }),
    refetchOnWindowFocus: false,
  });

  const appPages = Array.isArray(appPagesData)
    ? appPagesData
    : appPagesData?.appPages || [];

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
  const hasPageConfig = !!appPage?.appPageConfig;

  return (
    <div className="w-full h-full min-h-0">
      {pinnedAppPageID && appPage ? (
        <div className="w-full flex flex-col justify-start items-center h-full min-h-0">
          <div className="flex flex-row justify-between items-center w-full p-2 border-b border-border ">
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
                  <SearchSelect
                    value={pinnedAppPageID ? String(pinnedAppPageID) : ""}
                    onChange={(val) => _handleSetDefaultAppPage(val)}
                    options={(appPages || []).map((page) => ({
                      value: String(page.appPageID),
                      label: page.appPageTitle,
                    }))}
                    placeholder="Select an app page"
                    className="text-xs"
                      size="sm"
                  />
                  <Button
                    onClick={() => _handleSetDefaultAppPage(null)}
                      variant="secondary" className="w-7 h-7 p-2"
                  >
                      <PinOff className="!w-4 !h-4 !text-primary" />
                  </Button>
                  <Button
                    onClick={fullScreenHandle.enter}

                      variant="secondary" className="w-7 h-7 p-2"
                  >
                      <Maximize2 className="text-primary h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
          <FullScreen handle={fullScreenHandle} className="w-full flex-1 min-h-0 flex flex-col">
            <ReactQueryLoadingErrorWrapper
              isLoading={isLoadingAppPage}
              isFetching={isFetchingAppPage}
              error={loadAppPageError}
              refetch={refetchAppPage}
              isRefetching={isRefetchingAppPage}
            >
              {hasPageConfig && (
                <AppPageView
                  tenantID={tenantID}
                  pageID={pinnedAppPageID}
                  pageConfig={appPage.appPageConfig}
                  syncVariablesToUrl={true}
                />
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
                  <SearchSelect
                    value={pinnedAppPageID ? String(pinnedAppPageID) : ""}
                    onChange={(val) => _handleSetDefaultAppPage(val)}
                    options={(appPages || []).map((page) => ({
                      value: String(page.appPageID),
                      label: page.appPageTitle,
                    }))}
                    placeholder="Select an app page"
                    className="text-xs"
                  />
                )}
              </div>
            </div>
          </div>
        </ReactQueryLoadingErrorWrapper>
      )}
    </div>
  );
};

DefaultAppPageSelectionLayout.propTypes = {
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  userConfigKey: PropTypes.string.isRequired,
};

import React, {  useState } from "react";
import { LayoutDashboard, Maximize2, PinOff } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../../constants";
import {
  getAllDashboardsAPI,
  getDashboardByIDAPI,
} from "../../../data/apis/dashboard";
import {
  useAuthActions,
  useAuthState,
} from "../../../logic/hooks/useAuth";
import { Responsive, WidthProvider } from "react-grid-layout";
import PropTypes from "prop-types";
import { ReactQueryLoadingErrorWrapper } from "./reactQueryLoadingErrorWrapper";
import { DashboardRenderWidget } from "../dashboardComponents/dashboardRenderWidget";
import { FullScreen, useFullScreenHandle } from "react-full-screen";
import { Button, Spinner, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@jet-admin/ui";
const ResponsiveReactGridLayout = WidthProvider(Responsive);

export const DefaultDashboardSelectionLayout = ({
  tenantID,
  userConfigKey,
}) => {
  DefaultDashboardSelectionLayout.propTypes = {
    tenantID: PropTypes.number.isRequired,
    userConfigKey: PropTypes.string.isRequired,
  };
  const fullScreenHandle = useFullScreenHandle();
  const { userConfig, isFetchingUserConfig, isUpdatingUserConfig } =
    useAuthState();
  const { updateUserConfigKey } = useAuthActions();
  // eslint-disable-next-line no-unused-vars
  const [currentBreakpoint, setCurrentBreakpoint] = useState("lg");
  const pinnedDashboardID =
    userConfig && userConfig[userConfigKey]
      ? userConfig[userConfigKey]
      : null;
  const {
    isLoading: isLoadingDashboards,
    data: dashboards,
    error: loadDashboardsError,
    isFetching: isFetchingDashboards,
    isRefetching: isRefetechingDashboards,
    refetch: refetchDashboards,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DASHBOARDS(tenantID)],
    queryFn: () => getAllDashboardsAPI({ tenantID }),
    refetchOnWindowFocus: false,
  });

  const {
    isLoading: isLoadingDashboard,
    data: dashboard,
    error: loadDashboardError,
    isFetching: isFetchingDashboard,
    isRefetching: isRefetechingDashboard,
    refetch: refetchDashboard,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DASHBOARDS(tenantID),
      pinnedDashboardID,
    ],
    queryFn: () =>
      getDashboardByIDAPI({
        tenantID,
        dashboardID: pinnedDashboardID,
      }),
    enabled: !!pinnedDashboardID,
    refetchOnWindowFocus: false,
  });

  const _handleSetDefaultDashboard = (dashboardID) => {
    console.log("dashboardID", dashboardID);
    updateUserConfigKey({
      tenantID,
      key: userConfigKey,
      value: dashboardID,
    });
  };
  const onBreakpointChange = (newBreakpoint) => {
    setCurrentBreakpoint(newBreakpoint);
  };

  return (
    <div className="w-full h-full">
      {pinnedDashboardID && dashboard ? (
        <div className="w-full flex flex-col justify-start items-center h-full">
          <div className="flex flex-row justify-between items-center w-full px-4 py-3 border-b border-border ">
            <div className="w-full  flex flex-col justify-center items-start">
              {dashboard && (
                <h1 className="text-lg font-bold leading-tight tracking-tight text-foreground">
                  {dashboard.dashboardTitle}
                </h1>
              )}

              {dashboard && (
                <span className="text-xs text-primary mt-2">{`Dashboard ID: ${dashboard.dashboardID} `}</span>
              )}
            </div>
            <div className="flex flex-row justify-center items-center gap-2">
              {isUpdatingUserConfig ? (
                <Spinner size={16} className="text-primary" />
              ) : (
                <>
                    <Select value={String(pinnedDashboardID)} onValueChange={(val) => _handleSetDefaultDashboard(val)}>
                      <SelectTrigger className="text-xs">
                        <SelectValue placeholder="Select a dashboard" />
                      </SelectTrigger>
                      <SelectContent>
                        {dashboards?.map((dashboard) => (
                        <SelectItem
                          key={dashboard.dashboardID}
                          value={String(dashboard.dashboardID)}
                        >
                          {dashboard.dashboardTitle}
                        </SelectItem>
                      ))}
                      </SelectContent>
                    </Select>
                    <Button
                    onClick={() => _handleSetDefaultDashboard(null)}
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
          <FullScreen handle={fullScreenHandle} className="w-full h-full"><ReactQueryLoadingErrorWrapper
            isLoading={isLoadingDashboard}
            isFetching={isFetchingDashboard}
            error={loadDashboardError}
            refetch={refetchDashboard}
            isRefetching={isRefetechingDashboard}
          >
            <div
              className="w-full overflow-y-auto bg-muted h-full"
              id={`printable-area-dashboard-${pinnedDashboardID}`}
            >
              {dashboard && (
                <ResponsiveReactGridLayout
                  isDraggable={false}
                  isResizable={false}
                  style={{ minHeight: "100%" }}
                  draggableCancel=".cancelSelectorName"
                  layouts={dashboard?.dashboardConfig?.layouts}
                  measureBeforeMount={false}
                  breakpoints={{ lg: 1000, md: 996, sm: 768, xs: 480, xxs: 0 }}
                  onBreakpointChange={onBreakpointChange}
                  resizeHandles={["ne", "se", "nw", "sw"]}
                  margin={[8, 8]}
                  cols={{ lg: 8, md: 6, sm: 5, xs: 4, xxs: 3 }}
                  rowHeight={32}
                  allowOverlap={false}
                >
                  {dashboard?.dashboardConfig?.widgets.map((widget, index) => (
                    <div key={widget} draggable={false}>
                      <DashboardRenderWidget
                        tenantID={tenantID}
                        widget={widget}
                        index={index}
                        editable={false}
                      />
                    </div>
                  ))}
                </ResponsiveReactGridLayout>
              )}
            </div>
          </ReactQueryLoadingErrorWrapper></FullScreen>

        </div>
      ) : (
        <ReactQueryLoadingErrorWrapper
          isLoading={
            isLoadingDashboards ||
            isFetchingDashboard ||
            isFetchingUserConfig ||
            (pinnedDashboardID && isLoadingDashboards)
          }
          error={loadDashboardsError}
          isFetching={isFetchingDashboards}
          isRefetching={isRefetechingDashboards}
          refetch={refetchDashboards}
        >
          <div className="h-full w-full flex justify-center items-center p-6">
            <div className="bg-background p-8 max-w-md text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <LayoutDashboard className="text-primary text-4xl" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                {CONSTANTS.STRINGS.DASHBOARD_VIEWER_NO_PINNED_DASHBOARD_TITLE}
              </h2>
              <p className="text-foreground mb-6">
                {
                  CONSTANTS.STRINGS
                    .DASHBOARD_VIEWER_NO_PINNED_DASHBOARD_DESCRIPTION
                }
              </p>
              <div className="flex flex-row justify-center items-center gap-2">
                {isUpdatingUserConfig ? (
                    <Spinner size={16} className="text-primary" />
                ) : (
                      <Select value={String(pinnedDashboardID || '')} onValueChange={(val) => _handleSetDefaultDashboard(val)}>
                        <SelectTrigger className="text-xs">
                          <SelectValue placeholder="Select a dashboard" />
                        </SelectTrigger>
                        <SelectContent>
                          {dashboards?.map((dashboard) => (
                        <SelectItem
                          key={dashboard.dashboardID}
                          value={String(dashboard.dashboardID)}
                        >
                          {dashboard.dashboardTitle}
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

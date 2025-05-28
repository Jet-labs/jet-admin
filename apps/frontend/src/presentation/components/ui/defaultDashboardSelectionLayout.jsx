import React, {  useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../../constants";
import {
  getAllDashboardsAPI,
  getDashboardByIDAPI,
} from "../../../data/apis/dashboard";
import {
  useAuthActions,
  useAuthState,
} from "../../../logic/contexts/authContext";
import { Responsive, WidthProvider } from "react-grid-layout";
import PropTypes from "prop-types";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { ReactQueryLoadingErrorWrapper } from "./reactQueryLoadingErrorWrapper";
import { DashboardRenderWidget } from "../dashboardComponents/dashboardRenderWidget";
import { CircularProgress } from "@mui/material";
const ResponsiveReactGridLayout = WidthProvider(Responsive);

export const DefaultDashboardSelectionLayout = ({
  tenantID,
  userConfigKey,
}) => {
  DefaultDashboardSelectionLayout.propTypes = {
    tenantID: PropTypes.number.isRequired,
    userConfigKey: PropTypes.string.isRequired,
  };
  const { userConfig, isFetchingUserConfig, isUpdatingUserConfig } =
    useAuthState();
  const { updateUserConfigKey } = useAuthActions();
  // eslint-disable-next-line no-unused-vars
  const [currentBreakpoint, setCurrentBreakpoint] = useState("lg");
  const pinnedDashboardID =
    userConfig && userConfig[userConfigKey]
      ? parseInt(userConfig[userConfigKey])
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
          <div className="flex flex-row justify-between items-center w-full px-3 py-2 border-b border-gray-200 ">
            <div className="w-full  flex flex-col justify-center items-start">
              {dashboard && (
                <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-700">
                  {dashboard.dashboardTitle}
                </h1>
              )}

              {dashboard && (
                <span className="text-xs text-[#646cff] mt-2">{`Dashboard ID: ${dashboard.dashboardID} `}</span>
              )}
            </div>
            <div className="flex flex-row justify-center items-center gap-2">
              {isUpdatingUserConfig ? (
                <CircularProgress size={16} className="!text-[#646cff]" />
              ) : (
                <select
                  className="p-1 text-xs text-gray-700 bg-white border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  value={pinnedDashboardID}
                  onChange={(e) =>
                    _handleSetDefaultDashboard(Number(e.target.value))
                  }
                >
                  <option value="" disabled selected>
                    Select a dashboard
                  </option>
                  {dashboards?.map((dashboard) => (
                    <option
                      key={dashboard.dashboardID}
                      value={dashboard.dashboardID}
                    >
                      {dashboard.dashboardTitle}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <ReactQueryLoadingErrorWrapper
            isLoading={isLoadingDashboard}
            isFetching={isFetchingDashboard}
            error={loadDashboardError}
            refetch={refetchDashboard}
            isRefetching={isRefetechingDashboard}
          >
            <div
              className="w-full overflow-y-auto bg-slate-100 "
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
          </ReactQueryLoadingErrorWrapper>
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
            <div className="bg-white p-8 max-w-md text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-[#646cff]/10 p-4 rounded-full">
                  <MdOutlineSpaceDashboard className="text-[#646cff] text-4xl" />
                </div>
              </div>
              <h2 className="text-xl font-bold text-slate-700 mb-2">
                {CONSTANTS.STRINGS.DASHBOARD_VIEWER_NO_PINNED_DASHBOARD_TITLE}
              </h2>
              <p className="text-slate-600 mb-6">
                {
                  CONSTANTS.STRINGS
                    .DASHBOARD_VIEWER_NO_PINNED_DASHBOARD_DESCRIPTION
                }
              </p>
              <div className="flex flex-row justify-center items-center gap-2">
                {isUpdatingUserConfig ? (
                  <CircularProgress size={16} className="!text-[#646cff]" />
                ) : (
                  <select
                    className="p-1 text-xs text-gray-700 bg-white border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                    value={pinnedDashboardID}
                    onChange={(e) =>
                      _handleSetDefaultDashboard(Number(e.target.value))
                    }
                  >
                    <option value="" disabled selected>
                      Select a dashboard
                    </option>
                    {dashboards?.map((dashboard) => (
                      <option
                        key={dashboard.dashboardID}
                        value={dashboard.dashboardID}
                      >
                        {dashboard.dashboardTitle}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        </ReactQueryLoadingErrorWrapper>
      )}
    </div>
  );
};

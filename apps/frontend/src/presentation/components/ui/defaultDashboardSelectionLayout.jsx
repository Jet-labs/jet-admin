import React, {  useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CONSTANTS } from "../../../constants";
import {
  getAllDatabaseDashboardsAPI,
  getDatabaseDashboardByIDAPI,
} from "../../../data/apis/databaseDashboard";
import {
  useAuthActions,
  useAuthState,
} from "../../../logic/contexts/authContext";
import { Responsive, WidthProvider } from "react-grid-layout";
import PropTypes from "prop-types";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { ReactQueryLoadingErrorWrapper } from "./reactQueryLoadingErrorWrapper";
import { DatabaseDashboardRenderWidget } from "../databaseDashboardComponents/databaseDashboardRenderWidget";
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
    isLoading: isLoadingDatabaseDashboards,
    data: databaseDashboards,
    error: loadDatabaseDashboardsError,
    isFetching: isFetchingDatabaseDashboards,
    isRefetching: isRefetechingDatabaseDashboards,
    refetch: refetchDatabaseDashboards,
  } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.DATABASE_DASHBOARDS(tenantID)],
    queryFn: () => getAllDatabaseDashboardsAPI({ tenantID }),
    refetchOnWindowFocus: false,
  });

  const {
    isLoading: isLoadingDatabaseDashboard,
    data: databaseDashboard,
    error: loadDatabaseDashboardError,
    isFetching: isFetchingDatabaseDashboard,
    isRefetching: isRefetechingDatabaseDashboard,
    refetch: refetchDatabaseDashboard,
  } = useQuery({
    queryKey: [
      CONSTANTS.REACT_QUERY_KEYS.DATABASE_DASHBOARDS(tenantID),
      pinnedDashboardID,
    ],
    queryFn: () =>
      getDatabaseDashboardByIDAPI({
        tenantID,
        databaseDashboardID: pinnedDashboardID,
      }),
    enabled: !!pinnedDashboardID,
    refetchOnWindowFocus: false,
  });

  const _handleSetDefaultDashboard = (dashboardID) => {
    console.log({ dashboardID });
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
      {pinnedDashboardID && databaseDashboard ? (
        <div className="w-full flex flex-col justify-start items-center h-full">
          <div className="flex flex-row justify-between items-center w-full px-3 py-2 border-b border-gray-200 ">
            <div className="w-full  flex flex-col justify-center items-start">
              {databaseDashboard && (
                <h1 className="text-lg font-bold leading-tight tracking-tight text-slate-700">
                  {databaseDashboard.databaseDashboardName}
                </h1>
              )}

              {databaseDashboard && (
                <span className="text-xs text-[#646cff] mt-2">{`Dashboard ID: ${databaseDashboard.databaseDashboardID} `}</span>
              )}
            </div>
            <div className="flex flex-row justify-center items-center gap-2">
              {isUpdatingUserConfig ? (
                <CircularProgress size={20} className="!text-[#646cff]" />
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
                  {databaseDashboards?.map((dashboard) => (
                    <option
                      key={dashboard.databaseDashboardID}
                      value={dashboard.databaseDashboardID}
                    >
                      {dashboard.databaseDashboardName}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <ReactQueryLoadingErrorWrapper
            isLoading={isLoadingDatabaseDashboard}
            isFetching={isFetchingDatabaseDashboard}
            error={loadDatabaseDashboardError}
            refetch={refetchDatabaseDashboard}
            isRefetching={isRefetechingDatabaseDashboard}
          >
            <div
              className="w-full overflow-y-auto bg-slate-100 "
              id={`printable-area-dashboard-${pinnedDashboardID}`}
            >
              {databaseDashboard && (
                <ResponsiveReactGridLayout
                  isDraggable={false}
                  isResizable={false}
                  style={{ minHeight: "100%" }}
                  draggableCancel=".cancelSelectorName"
                  layouts={databaseDashboard?.databaseDashboardConfig?.layouts}
                  measureBeforeMount={false}
                  breakpoints={{ lg: 1000, md: 996, sm: 768, xs: 480, xxs: 0 }}
                  onBreakpointChange={onBreakpointChange}
                  resizeHandles={["ne", "se", "nw", "sw"]}
                  margin={[8, 8]}
                  cols={{ lg: 8, md: 6, sm: 5, xs: 4, xxs: 3 }}
                  rowHeight={32}
                  allowOverlap={false}
                >
                  {databaseDashboard?.databaseDashboardConfig?.widgets.map(
                    (widget, index) => (
                      <div key={widget} draggable={false}>
                        <DatabaseDashboardRenderWidget
                          tenantID={tenantID}
                          widget={widget}
                          index={index}
                          editable={false}
                        />
                      </div>
                    )
                  )}
                </ResponsiveReactGridLayout>
              )}
            </div>
          </ReactQueryLoadingErrorWrapper>
        </div>
      ) : (
        <ReactQueryLoadingErrorWrapper
          isLoading={
            isLoadingDatabaseDashboards ||
            isFetchingDatabaseDashboard ||
            isFetchingUserConfig ||
            (pinnedDashboardID && isLoadingDatabaseDashboards)
          }
          error={loadDatabaseDashboardsError}
          isFetching={isFetchingDatabaseDashboards}
          isRefetching={isRefetechingDatabaseDashboards}
          refetch={refetchDatabaseDashboards}
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
                  <CircularProgress size={20} className="!text-[#646cff]" />
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
                    {databaseDashboards?.map((dashboard) => (
                      <option
                        key={dashboard.databaseDashboardID}
                        value={dashboard.databaseDashboardID}
                      >
                        {dashboard.databaseDashboardName}
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

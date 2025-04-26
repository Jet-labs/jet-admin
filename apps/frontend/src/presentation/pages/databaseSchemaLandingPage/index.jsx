import React from "react";
import { useAuthActions, useAuthState } from "../../../logic/contexts/authContext";
import { CONSTANTS } from "../../../constants";
import { MdOutlineDelete, MdOutlineSpaceDashboard } from "react-icons/md";
import { DatabaseDashboardViewer } from "../../components/databaseDashboardComponents/databaseDashboardViewer";
import { useParams } from "react-router-dom";
import { getAllDatabaseDashboardsAPI } from "../../../data/apis/databaseDashboard";
import { useQuery } from "@tanstack/react-query";
import { ReactQueryLoadingErrorWrapper } from "../../components/ui/reactQueryLoadingErrorWrapper";



const DatabaseSchemaLandingPage = () => {
    const { tenantID } = useParams();
    const { userConfig} = useAuthState();
    const {updateUserConfigKey} = useAuthActions();
    const pinnedDashboardID =
      userConfig &&
      userConfig[CONSTANTS.USER_CONFIG_KEYS.DEFAULT_SCHEMA_DASHBAORD_ID]?
      parseInt(
        userConfig[CONSTANTS.USER_CONFIG_KEYS.DEFAULT_SCHEMA_DASHBAORD_ID]
      ): null;
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
    const _handleSetDefaultDashboard = (dashboardID) => {
        updateUserConfigKey({
            tenantID,
            key: CONSTANTS.USER_CONFIG_KEYS.DEFAULT_SCHEMA_DASHBAORD_ID,
            value: dashboardID,
          });
    };
  return (
    <div className="w-full h-full">
      {pinnedDashboardID ? (
        <DatabaseDashboardViewer
          tenantID={tenantID}
          databaseDashboardID={pinnedDashboardID}
        />
      ) : (
        <ReactQueryLoadingErrorWrapper
          isLoading={isLoadingDatabaseDashboards}
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
                <button
                  onClick={() => _handleSetDefaultDashboard(null)}
                  className="px-2.5 py-1.5 text-sm text-white bg-red-500 rounded hover:bg-red-600 transition-all duration-200 flex items-center"
                  
                >
                  <MdOutlineDelete className="text-base" />
                  
                </button>

              </div>
            </div>
          </div>
        </ReactQueryLoadingErrorWrapper>
      )}
    </div>
  );
};

export default DatabaseSchemaLandingPage;

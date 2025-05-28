import React from "react";
import { FaPlus } from "react-icons/fa";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { useDashboardsState } from "../../../../logic/contexts/dashboardsContext";
import { NoEntityUI } from "../../ui/noEntityUI";
export const DashboardDrawerList = () => {
  const { isLoadingDashboards, dashboards, isFetchingDashboards } =
    useDashboardsState();
  const routeParam = useParams();
  const { tenantID } = useParams();
  const navigate = useNavigate();
  const _navigateToAddMoreDashboard = () => {
    navigate(CONSTANTS.ROUTES.ADD_DASHBOARD.path(tenantID));
  };
  return (
    <div className=" bg-white   h-[calc(100vh-48px)] overflow-hidden p-2 w-full">
      <button
        onClick={_navigateToAddMoreDashboard}
        className="flex mb-2 flex-row items-center justify-center rounded bg-[#646cff]/10 px-3 py-1.5 text-sm text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50 w-full outline-none focus:outline-none"
      >
        <FaPlus className="!w-4 !h-4 !text-[#646cff] mr-1" />
        {CONSTANTS.STRINGS.ADD_DASHBOARD_BUTTON_TEXT}
      </button>
      {isLoadingDashboards || isFetchingDashboards ? (
        <div role="status" className=" animate-pulse w-full">
          <div className="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
          <div className="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
          <div className="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
          <div className="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
        </div>
      ) : dashboards && dashboards.length > 0 ? (
        <div className="h-full w-full overflow-y-auto">
          {dashboards.map((dashboard) => {
            const key = `dashboard_${dashboard.dashboardID}`;
            const isActive = routeParam?.dashboardID == dashboard.dashboardID;
            return (
              <Link
                to={CONSTANTS.ROUTES.UPDATE_DASHBOARD_BY_ID.path(
                  tenantID,
                  dashboard.dashboardID
                )}
                key={key}
                className="block mb-2 focus:outline-none "
              >
                <div
                  className={`flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 ${
                    isActive ? "bg-[#eaebff]" : "bg-white text-gray-700"
                  }`}
                >
                  <div className="!w-[16px]">
                    <MdOutlineSpaceDashboard
                      className={`w-[16px] h-[16px] ${
                        isActive ? "text-primary" : "text-slate-600"
                      }`}
                    />
                  </div>

                  <span
                    className={`font-medium text-sm truncate ${
                      isActive ? "font-bold" : ""
                    } `}
                  >
                    {/* {StringUtils.truncateName(dashboard.dashboardTitle, 15)} */}
                    {`${dashboard.dashboardTitle}`}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className=" text-gray-500 dark:text-gray-400">
          <NoEntityUI
            message={CONSTANTS.STRINGS.DASHBOARD_DRAWER_LIST_NO_DASHBOARD}
          />
        </div>
      )}

      {/* Dashboard List */}
    </div>
  );
};

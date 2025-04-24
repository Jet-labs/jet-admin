import { FaPlus } from "react-icons/fa";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { RiPushpinFill } from "react-icons/ri";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { useAuthState } from "../../../../logic/contexts/authContext";
import { useDatabaseDashboardsState } from "../../../../logic/contexts/databaseDashboardsContext";
import { NoEntityUI } from "../../ui/noEntityUI";
import React from "react";
export const DatabaseDashboardDrawerList = () => {
  const {
    isLoadingDatabaseDashboards,
    databaseDashboards,
    isFetchingDatabaseDashboards,
  } = useDatabaseDashboardsState();
  const routeParam = useParams();
  const { userConfig } = useAuthState();
  const { tenantID } = useParams();
  const navigate = useNavigate();
  const _navigateToAddMoreDashboard = () => {
    navigate(CONSTANTS.ROUTES.ADD_DATABASE_DASHBOARD.path(tenantID));
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
      {isLoadingDatabaseDashboards || isFetchingDatabaseDashboards ? (
        <div role="status" className=" animate-pulse w-full">
          <div className="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
          <div className="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
          <div className="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
          <div className="h-6 bg-gray-200 rounded   mb-2 w-full"></div>
        </div>
      ) : databaseDashboards && databaseDashboards.length > 0 ? (
        <div className="h-full w-full overflow-y-auto">
          {databaseDashboards.map((databaseDashboard) => {
            const key = `databaseDashboard_${databaseDashboard.databaseDashboardID}`;
            const isActive =
              routeParam?.databaseDashboardID ==
              databaseDashboard.databaseDashboardID;

            const isDashboardPinned =
              userConfig &&
              databaseDashboard &&
              parseInt(
                userConfig[CONSTANTS.USER_CONFIG_KEYS.DEFAULT_DASHBOARD_ID]
              ) === databaseDashboard.databaseDashboardID;
            return (
              <Link
                to={CONSTANTS.ROUTES.UPDATE_DATABASE_DASHBOARD_BY_ID.path(
                  tenantID,
                  databaseDashboard.databaseDashboardID
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
                    {/* {StringUtils.truncateName(databaseDashboard.databaseDashboardName, 15)} */}
                    {`${databaseDashboard.databaseDashboardName}`}
                  </span>
                  <div>
                    {isDashboardPinned && <RiPushpinFill className="text-sm" />}
                  </div>
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

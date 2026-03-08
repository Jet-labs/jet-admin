import React from "react";
import { FaPlus } from "react-icons/fa";
import { MdOutlineSpaceDashboard } from "react-icons/md";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { useDashboardsState } from "../../../../logic/contexts/dashboardsContext";
import { NoEntityUI } from "../../ui/noEntityUI";
import { Button } from "@jet-admin/ui";
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
    <div className="bg-background flex h-full w-full flex-col gap-3 overflow-hidden p-3">
      <Button
        onClick={_navigateToAddMoreDashboard}
        variant="primary-ghost"
        className="w-full justify-start"
      >
        <FaPlus className="mr-2 h-4 w-4" />
        {CONSTANTS.STRINGS.ADD_DASHBOARD_BUTTON_TEXT}
      </Button>

      {isLoadingDashboards || isFetchingDashboards ? (
        <div role="status" className="animate-pulse w-full space-y-2">
          <div className="h-9 w-full rounded-md bg-muted" />
          <div className="h-9 w-full rounded-md bg-muted" />
          <div className="h-9 w-full rounded-md bg-muted" />
          <div className="h-9 w-full rounded-md bg-muted" />
        </div>
      ) : dashboards && dashboards.length > 0 ? (
          <div className="flex-1 w-full overflow-y-auto pb-10 space-y-1">
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
                className="block focus:outline-none"
              >
                <div
                  className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div className="flex-shrink-0">
                    <MdOutlineSpaceDashboard
                      className="h-4 w-4"
                    />
                  </div>

                  <span
                    className={`truncate text-sm ${isActive ? "font-semibold" : "font-medium"
                      }`}
                  >
                    {dashboard.dashboardTitle}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
            <div className="flex flex-1 items-center justify-center p-4 text-muted-foreground">
          <NoEntityUI
            message={CONSTANTS.STRINGS.DASHBOARD_DRAWER_LIST_NO_DASHBOARD}
          />
        </div>
      )}
    </div>
  );
};

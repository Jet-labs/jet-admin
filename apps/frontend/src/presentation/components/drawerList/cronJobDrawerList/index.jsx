import React from "react";
import { CalendarClock, Plus } from 'lucide-react';
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { useCronJobs } from "../../../../logic/hooks/useCronJobs";
import { NoEntityUI } from "../../ui/noEntityUI";

import { Button } from "@jet-admin/ui";
export const CronJobDrawerList = () => {
  const { tenantID } = useParams();
  const navigate = useNavigate();
  const routeParam = useParams();
  const { isLoadingCronJobs, cronJobs, isFetchingCronJobs } = useCronJobs(tenantID);

  const _navigateToAddNotification = () => {
    navigate(CONSTANTS.ROUTES.ADD_CRON_JOB.path(tenantID));
  };

  return (
    <div className="bg-background flex h-full w-full flex-col gap-3 overflow-hidden p-3">
      <Button
        onClick={_navigateToAddNotification}
        variant="secondary"
        className="w-full justify-start"
      >
        <Plus className="mr-2 h-4 w-4" />
        {CONSTANTS.STRINGS.ADD_CRON_JOB_BUTTON_TEXT}
      </Button>

      {isLoadingCronJobs || isFetchingCronJobs ? (
        <div role="status" className="animate-pulse w-full space-y-2">
          <div className="h-9 rounded-md bg-muted" />
          <div className="h-9 rounded-md bg-muted" />
          <div className="h-9 rounded-md bg-muted" />
        </div>
      ) : cronJobs && cronJobs.length > 0 ? (
          <div className="flex-1 w-full overflow-y-auto pb-10 space-y-1">
          {cronJobs.map((cronJob) => {
            const key = `cronJob_${cronJob.cronJobID}`;
            const isActive = routeParam?.cronJobID == cronJob.cronJobID;

            return (
              <Link
                to={CONSTANTS.ROUTES.UPDATE_CRON_JOB_BY_ID.path(
                  tenantID,
                  cronJob.cronJobID
                )}
                key={key}
                className="block focus:outline-none"
              >
                <div
                  className={`flex items-center gap-2 rounded-md px-3 py-2 transition-colors ${isActive
                    ? "bg-primary/5 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div className="flex-shrink-0">
                    <CalendarClock className="h-4 w-4" />
                  </div>

                  <span
                    className={`truncate text-sm ${isActive ? "font-semibold" : "font-medium"
                      }`}
                  >
                    {cronJob.cronJobTitle}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
            <div className="flex flex-1 items-center justify-center p-4 text-muted-foreground">
          <NoEntityUI
            message={CONSTANTS.STRINGS.CRON_JOB_DRAWER_LIST_NO_CRON_JOB_FOUND}
          />
        </div>
      )}
    </div>
  );
};

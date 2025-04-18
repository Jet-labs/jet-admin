import { useQuery } from "@tanstack/react-query";
import React from "react";
import { FaPlus } from "react-icons/fa";
import { Link, NavLink, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import {
  useCronJobsActions,
  useCronJobsState,
} from "../../../../logic/contexts/cronJobsContext";
import { NoEntityUI } from "../../ui/noEntityUI";
import { MdNotificationsNone } from "react-icons/md";
import { IoKeyOutline } from "react-icons/io5";

export const CronJobDrawerList = () => {
  const { tenantID } = useParams();
  const navigate = useNavigate();
  const routeParam = useParams();
  const {
    isLoadingCronJobs,
    cronJobs,
    isFetchingCronJobs,
  } = useCronJobsState();
  const { refetchCronJobs } = useCronJobsActions();

  const _navigateToAddNotification = () => {
    navigate(CONSTANTS.ROUTES.ADD_CRON_JOB.path(tenantID));
  };

  return (
    <div className="bg-white h-[calc(100vh-48px)] overflow-hidden p-2 w-full">
      <button
        onClick={_navigateToAddNotification}
        className="flex mb-2 flex-row items-center justify-center rounded bg-[#646cff]/10 px-3 py-1.5 text-sm text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50 w-full outline-none focus:outline-none"
      >
        <FaPlus className="!w-4 !h-4 !text-[#646cff] mr-1" />
        {CONSTANTS.STRINGS.ADD_CRON_JOB_BUTTON_TEXT}
      </button>

      {isLoadingCronJobs || isFetchingCronJobs ? (
        <div role="status" className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
        </div>
      ) : cronJobs && cronJobs.length > 0 ? (
        <div className="h-full w-full overflow-y-auto">
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
                className="block mb-2 focus:outline-none "
              >
                <div
                  className={`flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-100 ${
                    isActive ? "bg-[#eaebff]" : "bg-white text-gray-700"
                  }`}
                >
                  <div className="!w-[16px]">
                    <IoKeyOutline
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
                    {/* {StringUtils.truncateName(cronJob.cronJobTitle, 15)} */}
                    {`${cronJob.cronJobTitle}`}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className=" text-gray-500 dark:text-gray-400">
          <NoEntityUI
            message={CONSTANTS.STRINGS.CRON_JOB_DRAWER_LIST_NO_CRON_JOB_FOUND}
          />
        </div>
      )}
    </div>
  );
};

import React from "react";
import { FaPlus } from "react-icons/fa";
import { MdNotificationsNone } from "react-icons/md";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { useDatabaseNotificationsState } from "../../../../logic/contexts/databaseNotificationsContext";
import { NoEntityUI } from "../../ui/noEntityUI";

export const DatabaseNotificationDrawerList = () => {
  const { tenantID } = useParams();
  const navigate = useNavigate();
  const routeParam = useParams();
  const {
    isLoadingDatabaseNotifications,
    databaseNotifications,
    isFetchingDatabaseNotifications,
  } = useDatabaseNotificationsState();

  const _navigateToAddNotification = () => {
    navigate(CONSTANTS.ROUTES.ADD_DATABASE_NOTIFICATION.path(tenantID));
  };

  return (
    <div className="bg-white h-[calc(100vh-48px)] overflow-hidden p-2 w-full">
      <button
        onClick={_navigateToAddNotification}
        className="flex mb-2 flex-row items-center justify-center rounded bg-[#646cff]/10 px-3 py-1.5 text-sm text-[#646cff] hover:bg-[#646cff]/20 focus:ring-2 focus:ring-[#646cff]/50 w-full outline-none focus:outline-none"
      >
        <FaPlus className="!w-4 !h-4 !text-[#646cff] mr-1" />
        {CONSTANTS.STRINGS.ADD_NOTIFICATION_BUTTON_TEXT}
      </button>

      {isLoadingDatabaseNotifications || isFetchingDatabaseNotifications ? (
        <div role="status" className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
        </div>
      ) : databaseNotifications && databaseNotifications.length > 0 ? (
        <div className="h-full w-full overflow-y-auto">
          {databaseNotifications.map((databaseNotification) => {
            const key = `databaseNotification_${databaseNotification.databaseNotificationID}`;
            const isActive =
              routeParam?.databaseNotificationID ==
              databaseNotification.databaseNotificationID;

            return (
              <Link
                to={CONSTANTS.ROUTES.UPDATE_DATABASE_NOTIFICATION_BY_ID.path(
                  tenantID,
                  databaseNotification.databaseNotificationID
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
                    <MdNotificationsNone
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
                    {/* {StringUtils.truncateName(databaseNotification.databaseNotificationTitle, 15)} */}
                    {`${databaseNotification.databaseNotificationName}`}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className=" text-gray-500 dark:text-gray-400">
          <NoEntityUI
            message={CONSTANTS.STRINGS.NOTIFICATION_DRAWER_LIST_NO_NOTIFICATION}
          />
        </div>
      )}
    </div>
  );
};

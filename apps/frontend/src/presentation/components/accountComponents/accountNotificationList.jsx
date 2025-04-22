import React from "react";
import { Link } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { useAuthState } from "../../../logic/contexts/authContext";

export const AccountNotificationList = () => {
  const { user } = useAuthState();
  return (
    <div className="w-full mt-10 flex flex-col justify-start items-stretch gap-2">
      {user?.notifications?.length > 0 ? (
        <span className="text-slate-700 font-semibold text-sm">
          {CONSTANTS.STRINGS.USER_NOTIFICATIONS_TITLE}
        </span>
      ) : null}
      {user?.notifications?.map((notification, index) => {
        const key = `notification_${index}`;
        return (
          <div
            key={key}
            className="p-2  border-slate-200 border rounded flex flex-col justify-start items-start gap-1 border-l-2 border-l-[#646cff]"
          >
            <span className="text-slate-600 text-sm font-medium">
              {notification.title}
            </span>
            {notification.description && (
              <span className="text-slate-600 text-xs font-light">
                {notification.description}
              </span>
            )}
            {notification.actionType && notification.actionType == "link" ? (
              <Link to={notification.action} className="text-xs">
                {notification.actionText}
              </Link>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};

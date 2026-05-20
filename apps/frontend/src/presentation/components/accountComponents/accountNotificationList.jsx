import React from "react";
import { Link } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { useAuthState } from "../../../logic/hooks/useAuth";

export const AccountNotificationList = () => {
  const { user } = useAuthState();
  return (
    <div className="w-full mt-10 flex flex-col justify-start items-stretch gap-2">
      {user?.notifications?.length > 0 ? (
        <span className="text-foreground font-semibold text-sm">
          {CONSTANTS.STRINGS.USER_NOTIFICATIONS_TITLE}
        </span>
      ) : null}
      {user?.notifications?.map((notification, index) => {
        const key = `notification_${index}`;
        return (
          <div
            key={key}
            className="p-2  border-border border rounded-sm flex flex-col justify-start items-start gap-1 border-l-2 border-l-primary"
          >
            <span className="text-foreground text-sm font-medium">
              {notification.title}
            </span>
            {notification.description && (
              <span className="text-foreground text-xs font-light">
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

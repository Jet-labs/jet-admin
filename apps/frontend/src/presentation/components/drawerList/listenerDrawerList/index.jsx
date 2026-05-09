import { FaPlus } from "react-icons/fa";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { NoEntityUI } from "../../ui/noEntityUI";
import React from "react";
import { useListeners } from "../../../../logic/hooks/useListeners";
import { TbCloudDataConnection } from "react-icons/tb";

import { Button } from "@jet-admin/ui";

const STATUS_COLORS = {
  active: "bg-emerald-500",
  inactive: "bg-zinc-500",
  error: "bg-red-500",
};

export const ListenerDrawerList = () => {
  const { tenantID } = useParams();
  const {
    isLoadingListeners,
    listeners,
    isFetchingListeners,
  } = useListeners(tenantID);
  const routeParam = useParams();

  const navigate = useNavigate();

  const _navigateToAddListener = () => {
    navigate(CONSTANTS.ROUTES.ADD_LISTENER.path(tenantID));
  };

  return (
    <div className="bg-brand-dark flex h-full w-full flex-col gap-3 overflow-hidden p-3">
      <Button
        onClick={_navigateToAddListener}
        variant="primary-ghost"
        className="w-full justify-start"
      >
        <FaPlus className="w-4 h-4 mr-2" />
        {CONSTANTS.STRINGS.ADD_LISTENER_BUTTON_TEXT}
      </Button>

      {isLoadingListeners || isFetchingListeners ? (
        <div role="status" className="animate-pulse w-full space-y-2">
          <div className="h-9 bg-muted rounded-md w-full" />
          <div className="h-9 bg-muted rounded-md w-full" />
          <div className="h-9 bg-muted rounded-md w-full" />
        </div>
      ) : listeners && listeners.length > 0 ? (
        <div className="flex-1 w-full overflow-y-auto pb-10 space-y-1">
          {listeners.map((listener) => {
            const key = `listener_${listener.listenerID}`;
            const isActive =
              routeParam?.listenerID === listener.listenerID;

            return (
              <Link
                to={CONSTANTS.ROUTES.UPDATE_LISTENER_BY_ID.path(
                  tenantID,
                  listener.listenerID
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
                  <div className="flex-shrink-0 relative">
                    <TbCloudDataConnection
                      className={`w-4 h-4 ${isActive ? "text-primary" : "text-muted-foreground"}`}
                    />
                    <span
                      className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border border-brand-dark ${STATUS_COLORS[listener.status] || STATUS_COLORS.inactive}`}
                    />
                  </div>

                  <span
                    className={`text-sm truncate ${isActive ? "font-semibold" : "font-medium"}`}
                  >
                    {listener.listenerTitle}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center p-4 text-muted-foreground">
          <NoEntityUI
            message={CONSTANTS.STRINGS.LISTENER_DRAWER_LIST_NO_LISTENER_FOUND}
          />
        </div>
      )}
    </div>
  );
};

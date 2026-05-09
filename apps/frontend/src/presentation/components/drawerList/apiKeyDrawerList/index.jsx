import React from "react";
import { FaPlus } from "react-icons/fa";
import { IoKeyOutline } from "react-icons/io5";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { useAPIKeys } from "../../../../logic/hooks/useAPIKeys";
import { NoEntityUI } from "../../ui/noEntityUI";

import { Button } from "@jet-admin/ui";
export const APIKeyDrawerList = () => {
  const { tenantID } = useParams();
  const navigate = useNavigate();
  const routeParam = useParams();
  const { isLoadingAPIKeys, apiKeys, isFetchingAPIKeys } = useAPIKeys(tenantID);

  const _navigateToAddNotification = () => {
    navigate(CONSTANTS.ROUTES.ADD_API_KEY.path(tenantID));
  };

  return (
    <div className="bg-brand-dark flex h-full w-full flex-col gap-3 overflow-hidden p-3">
      <Button
        onClick={_navigateToAddNotification}
        variant="primary-ghost"
        className="w-full justify-start"
      >
        <FaPlus className="mr-2 h-4 w-4" />
        {CONSTANTS.STRINGS.ADD_API_KEY_BUTTON_TEXT}
      </Button>

      {isLoadingAPIKeys || isFetchingAPIKeys ? (
        <div role="status" className="animate-pulse w-full space-y-2">
          <div className="h-9 rounded-md bg-muted" />
          <div className="h-9 rounded-md bg-muted" />
          <div className="h-9 rounded-md bg-muted" />
        </div>
      ) : apiKeys && apiKeys.length > 0 ? (
          <div className="flex-1 w-full overflow-y-auto pb-10 space-y-1">
          {apiKeys.map((apiKey) => {
            const key = `apiKey_${apiKey.apiKeyID}`;
            const isActive = routeParam?.apiKeyID == apiKey.apiKeyID;

            return (
              <Link
                to={CONSTANTS.ROUTES.UPDATE_API_KEY_BY_ID.path(
                  tenantID,
                  apiKey.apiKeyID
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
                    <IoKeyOutline className="h-4 w-4" />
                  </div>

                  <span
                    className={`truncate text-sm ${isActive ? "font-semibold" : "font-medium"
                      }`}
                  >
                    {apiKey.apiKeyTitle}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
            <div className="flex flex-1 items-center justify-center p-4 text-muted-foreground">
          <NoEntityUI
            message={CONSTANTS.STRINGS.API_KEY_DRAWER_LIST_NO_API_KEY}
          />
        </div>
      )}
    </div>
  );
};

import React from "react";
import { Key, Plus } from 'lucide-react';

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
    <div className="bg-background flex h-full w-full flex-col gap-2 overflow-hidden">
      <div className="p-2 pb-0">
        <Button
        onClick={_navigateToAddNotification}
        variant="secondary"
        className="w-full justify-start"
      >
        <Plus className="mr-2 h-4 w-4" />
        {CONSTANTS.STRINGS.ADD_API_KEY_BUTTON_TEXT}
      </Button>
      </div>

      {isLoadingAPIKeys || isFetchingAPIKeys ? (
        <div role="status" className="animate-pulse w-full space-y-2 p-2">
          <div className="h-9 rounded bg-muted" />
          <div className="h-9 rounded bg-muted" />
          <div className="h-9 rounded bg-muted" />
        </div>
      ) : apiKeys && apiKeys.length > 0 ? (
          <div className="flex-1 w-full overflow-y-auto p-2 pt-0 pb-10 space-y-2">
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
                  className={`flex items-center gap-2 rounded px-2 py-1.5 transition-colors ${isActive
                    ? "bg-primary/5 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <div className="flex-shrink-0">
                    <Key className="h-4 w-4" />
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

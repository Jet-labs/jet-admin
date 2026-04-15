import React from "react";
import { FaPlus } from "react-icons/fa";
import { TbCloudDataConnection } from "react-icons/tb";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { useWebhooksState } from "../../../../logic/contexts/webhookContext";
import { NoEntityUI } from "../../ui/noEntityUI";

import { Button } from "@jet-admin/ui";
export const WebhookDrawerList = () => {
  const { tenantID } = useParams();
  const navigate = useNavigate();
  const routeParam = useParams();
  const { isLoadingWebhooks, webhooks, isFetchingWebhooks } =
    useWebhooksState();

  const _navigateToAddWebhook = () => {
    navigate(CONSTANTS.ROUTES.ADD_WEBHOOK.path(tenantID));
  };

  return (
    <div className="bg-background flex h-full w-full flex-col gap-3 overflow-hidden p-3">
      <Button
        onClick={_navigateToAddWebhook}
        variant="primary-ghost"
        className="w-full justify-start"
      >
        <FaPlus className="mr-2 h-4 w-4" />
        {CONSTANTS.STRINGS.ADD_WEBHOOK_BUTTON_TEXT}
      </Button>

      {isLoadingWebhooks || isFetchingWebhooks ? (
        <div role="status" className="animate-pulse w-full space-y-2">
          <div className="h-9 rounded-md bg-muted" />
          <div className="h-9 rounded-md bg-muted" />
          <div className="h-9 rounded-md bg-muted" />
        </div>
      ) : webhooks && webhooks.length > 0 ? (
        <div className="flex-1 w-full overflow-y-auto pb-10 space-y-1">
          {webhooks.map((webhook) => {
            const key = `webhook_${webhook.webhookID}`;
            const isActive = routeParam?.webhookID == webhook.webhookID;

            return (
              <Link
                to={CONSTANTS.ROUTES.UPDATE_WEBHOOK_BY_ID.path(
                  tenantID,
                  webhook.webhookID
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
                    <TbCloudDataConnection className="h-4 w-4" />
                  </div>

                  <span
                    className={`truncate text-sm ${isActive ? "font-semibold" : "font-medium"
                      }`}
                  >
                    {webhook.webhookTitle}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center p-4 text-muted-foreground">
          <NoEntityUI
            message={CONSTANTS.STRINGS.WEBHOOK_DRAWER_LIST_NO_WEBHOOK_FOUND}
          />
        </div>
      )}
    </div>
  );
};

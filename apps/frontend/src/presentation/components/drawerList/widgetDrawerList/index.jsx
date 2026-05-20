import { WIDGETS_MAP } from "@jet-admin/widgets-ui";
import { Plus } from 'lucide-react';
import React from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { useWidgets } from "../../../../logic/hooks/useWidgets";
import { NoEntityUI } from "../../ui/noEntityUI";

import { Button } from "@jet-admin/ui";
export const WidgetDrawerList = () => {
  const { tenantID } = useParams();
  const { isLoadingWidgets, widgets, isFetchingWidgets } = useWidgets(tenantID);
  const routeParam = useParams();
  const navigate = useNavigate();
  const _navigateToAddMoreWidget = () => {
    navigate(CONSTANTS.ROUTES.ADD_WIDGET.path(tenantID));
  };
  const _renderWidgetIcon = (widgetType, isActive) => {
    const widgetConfig = WIDGETS_MAP[widgetType];
    if (!widgetConfig || !widgetConfig.icon) {
      // Fallback for legacy widget types that no longer exist
      return (
        <span className={`text-xl ${isActive ? "text-primary" : "text-muted-foreground"}`}>
          📊
        </span>
      );
    }
    return widgetConfig.icon({
      className: `!text-xl ${
        isActive ? "!text-primary" : "!text-muted-foreground"
      }`,
    });
  };

  return (
    <div className="bg-background flex h-full w-full flex-col gap-3 overflow-hidden p-3">
      <Button
        onClick={_navigateToAddMoreWidget}
        variant="secondary"
        className="w-full justify-start"
      >
        <Plus className="!w-4 !h-4 !text-primary mr-1" />
        {CONSTANTS.STRINGS.ADD_WIDGET_BUTTON_TEXT}
      </Button>
      {isLoadingWidgets || isFetchingWidgets ? (
        <div role="status" className="animate-pulse w-full space-y-2">
          <div className="h-9 bg-muted rounded-md w-full" />
          <div className="h-9 bg-muted rounded-md w-full" />
          <div className="h-9 bg-muted rounded-md w-full" />
          <div className="h-9 bg-muted rounded-md w-full" />
        </div>
      ) : widgets && widgets.length > 0 ? (
          <div className="flex-1 h-full w-full overflow-y-auto pb-10 space-y-1">
          {widgets.map((widget) => {
            const key = `widget_${widget.widgetID}`;
            const isActive = routeParam?.widgetID == widget.widgetID;

            return (
              <Link
                to={CONSTANTS.ROUTES.UPDATE_WIDGET_BY_ID.path(
                  tenantID,
                  widget.widgetID
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
                  {_renderWidgetIcon(widget.widgetType, isActive)}

                  <span
                    className={`text-sm truncate ${isActive ? "font-semibold" : "font-medium"
                      }`}
                  >
                    {`${widget.widgetTitle}`}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
            <div className="flex flex-1 items-center justify-center p-4 text-muted-foreground">
          <NoEntityUI
            message={CONSTANTS.STRINGS.WIDGET_DRAWER_LIST_NO_WIDGET}
          />
        </div>
      )}

      {/* Widget List */}
    </div>
  );
};

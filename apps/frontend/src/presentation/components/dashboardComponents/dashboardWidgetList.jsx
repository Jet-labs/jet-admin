import { WIDGETS_MAP } from "@jet-admin/widgets-ui";
import PropTypes from "prop-types";
import React from "react";
import { FiExternalLink } from "react-icons/fi";
import { GoGrabber } from "react-icons/go";
import { Link } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { useWidgets } from "../../../logic/hooks/useWidgets";
import { NoEntityUI } from "../ui/noEntityUI";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { Button } from "@jet-admin/ui";

export const DashboardWidgetList = ({ tenantID }) => {
  DashboardWidgetList.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };

  const { isLoadingWidgets, loadWidgetsError, widgets } = useWidgets(tenantID);

  const _handleDragStart = (e, id) => {
    // Set the data transfer with the widget ID
    e.dataTransfer.setData("widget", `${id}_${Date.now()}`);

    // Create a custom drag image using the parent element
    const parentElement = document.getElementById(id);
    if (parentElement) {
      // Create a clone of the element to use as drag image
      const clone = parentElement.cloneNode(true);

      // Apply styles to make it look solid
      clone.style.opacity = "1";
      clone.style.transform = "translateX(-9999px)";
      clone.style.position = "absolute";
      clone.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
      clone.style.background = "hsl(var(--muted))";
      clone.style.border = "1px solid hsl(var(--border))";
      clone.style.borderRadius = "0.5rem";

      // Add to DOM temporarily
      document.body.appendChild(clone);

      // Use the clone as drag image
      e.dataTransfer.setDragImage(clone, 0, 0);

      // Remove the clone after drag starts
      setTimeout(() => {
        document.body.removeChild(clone);
      }, 0);
    }
  };

  const _renderWidgetIcon = (widgetType) => {
    const widgetConfig = WIDGETS_MAP[widgetType];
    if (!widgetConfig || !widgetConfig.icon) {
      return (
        <span className="mr-3 text-sm text-muted-foreground">
          📊
        </span>
      );
    }

    return widgetConfig.icon({
      className: "mr-3 h-4 w-4 text-foreground",
    });
  };

  const _renderWidgetLinkIcon = (widgetID) => {
    return (
      <Button
        asChild
        type="button"
        variant="ghost"
        size="sm"
        square
        className="shrink-0 text-muted-foreground hover:text-foreground"
      >
        <Link
          to={CONSTANTS.ROUTES.UPDATE_WIDGET_BY_ID.path(tenantID, widgetID)}
          target="_blank"
        >
          <FiExternalLink className="h-4 w-4" />
        </Link>
      </Button>
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto border-t border-border p-3">
      <span className="text-sm font-semibold text-foreground">
        {CONSTANTS.STRINGS.DASHBOARD_WIDGET_LIST_WIDGETS_TITLE}
      </span>
      <div className="flex w-full flex-1 flex-col gap-2">
        <ReactQueryLoadingErrorWrapper
          isLoading={isLoadingWidgets}
          error={loadWidgetsError}
        >
          {widgets?.length > 0 ? (
            widgets.map((widget) => {
              const key = `widget_${widget.widgetID}`;
              return (
                <div
                  key={key}
                  id={key}
                  className="flex items-center justify-between gap-2 rounded-md border border-border bg-muted/50 px-3 py-2"
                >
                  <div className="flex min-w-0 items-center">
                    <div
                      draggable
                      onDragStart={(e) => _handleDragStart(e, key)}
                      className="cursor-grab"
                    >
                      <GoGrabber className="mr-2 h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>{_renderWidgetIcon(widget.widgetType)}</div>
                    <span className="truncate text-sm font-medium text-foreground">
                      {widget.widgetTitle}
                    </span>
                  </div>
                  {_renderWidgetLinkIcon(widget.widgetID)}
                </div>
              );
            })
          ) : (
            <NoEntityUI
                message={CONSTANTS.STRINGS.WIDGET_DRAWER_LIST_NO_WIDGET}
            />
          )}
        </ReactQueryLoadingErrorWrapper>
      </div>
    </div>
  );
};

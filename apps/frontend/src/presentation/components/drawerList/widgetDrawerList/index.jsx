import { WIDGETS_MAP } from "@jet-admin/widgets-ui";
import { Plus, Search } from 'lucide-react';
import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { useInfiniteWidgets } from "../../../../logic/hooks/useWidgets";
import { NoEntityUI } from "../../ui/noEntityUI";
import { Button, Input } from "@jet-admin/ui";
import { useDebounce } from "@uidotdev/usehooks";

export const WidgetDrawerList = () => {
  const { tenantID } = useParams();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const {
    widgets,
    isLoadingWidgets,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    loadWidgetsError,
  } = useInfiniteWidgets(tenantID, debouncedSearchQuery);

  const routeParam = useParams();
  const navigate = useNavigate();

  const _navigateToAddMoreWidget = () => {
    navigate(CONSTANTS.ROUTES.ADD_WIDGET.path(tenantID));
  };

  const _handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight < 30) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  };

  const _renderWidgetIcon = (widgetType, isActive) => {
    const widgetConfig = WIDGETS_MAP[widgetType];
    if (!widgetConfig || !widgetConfig.icon) {
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
    <div className="bg-background flex h-full w-full flex-col gap-2 overflow-hidden">
      <div className="p-2 pb-0">
        <Button
        onClick={_navigateToAddMoreWidget}
        variant="secondary"
        className="w-full justify-start"
      >
        <Plus className="!w-4 !h-4 !text-primary mr-1" />
        {CONSTANTS.STRINGS.ADD_WIDGET_BUTTON_TEXT}
      </Button>
      </div>

      {/* Search Input - Small Size (size="sm") per Section 29 */}
      <div className="px-2 py-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 z-10" />
          <Input
            type="text"
            size="sm"
            placeholder="Search widgets..."
            className="pl-8 w-full border-border/50 focus:border-primary/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {isLoadingWidgets ? (
        <div role="status" className="animate-pulse w-full space-y-2 p-2">
          <div className="h-9 bg-muted rounded w-full" />
          <div className="h-9 bg-muted rounded w-full" />
          <div className="h-9 bg-muted rounded w-full" />
          <div className="h-9 bg-muted rounded w-full" />
        </div>
      ) : widgets && widgets.length > 0 ? (
        <div 
          onScroll={_handleScroll}
          className="flex-1 h-full w-full overflow-y-auto p-2 pb-10 space-y-1"
        >
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
                  className={`flex items-center gap-2 rounded px-2 py-1.5 transition-colors ${
                    isActive
                      ? "bg-primary/5 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {_renderWidgetIcon(widget.widgetType, isActive)}

                  <span
                    className={`text-sm truncate ${
                      isActive ? "font-semibold" : "font-medium"
                    }`}
                  >
                    {`${widget.widgetTitle}`}
                  </span>
                </div>
              </Link>
            );
          })}
          {isFetchingNextPage && (
            <div className="flex justify-center p-2 text-xs text-muted-foreground animate-pulse">
              Loading more...
            </div>
          )}
        </div>
      ) : (
        <div className="flex flex-1 items-center justify-center p-4 text-muted-foreground">
          <NoEntityUI
            message={
              searchQuery
                ? "No matching widgets found"
                : CONSTANTS.STRINGS.WIDGET_DRAWER_LIST_NO_WIDGET
            }
          />
        </div>
      )}
    </div>
  );
};

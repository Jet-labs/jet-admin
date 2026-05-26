import { WIDGETS_MAP } from "@jet-admin/widgets-ui";
import { ExternalLink, GripVertical, Plus, Edit2, Search } from 'lucide-react';
import PropTypes from "prop-types";
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { CONSTANTS } from "../../../constants";
import { useInfiniteWidgets } from "../../../logic/hooks/useWidgets";
import { NoEntityUI } from "../ui/noEntityUI";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { Button, Input } from "@jet-admin/ui";
import { WidgetIdeModal } from "./WidgetIdeModal";
import { useDebounce } from "@uidotdev/usehooks";

export const AppPageWidgetList = ({
  tenantID,
  placedWidgets,
  onAddWidget,
  appPageEditorForm,
}) => {
  AppPageWidgetList.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    placedWidgets: PropTypes.array,
    onAddWidget: PropTypes.func,
    appPageEditorForm: PropTypes.object.isRequired,
  };

  const [isIdeOpen, setIsIdeOpen] = useState(false);
  const [selectedWidgetID, setSelectedWidgetID] = useState(null);
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

  const _handleScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    // Load more when user scrolls within 30px of the bottom
    if (scrollHeight - scrollTop - clientHeight < 30) {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    }
  };

  const _handleDragStart = (e, id) => {
    e.dataTransfer.setData("widget", `${id}_${Date.now()}`);

    const parentElement = document.getElementById(id);
    if (parentElement) {
      const clone = parentElement.cloneNode(true);
      clone.style.opacity = "1";
      clone.style.transform = "translateX(-9999px)";
      clone.style.position = "absolute";
      clone.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.1)";
      clone.style.background = "hsl(var(--muted))";
      clone.style.border = "1px solid hsl(var(--border))";
      clone.style.borderRadius = "0.5rem";

      document.body.appendChild(clone);
      e.dataTransfer.setDragImage(clone, 0, 0);

      setTimeout(() => {
        document.body.removeChild(clone);
      }, 0);
    }
  };

  const _renderWidgetIcon = (widgetType) => {
    const widgetConfig = WIDGETS_MAP[widgetType];
    if (!widgetConfig || !widgetConfig.icon) {
      return (
        <span className="text-xs text-muted-foreground select-none shrink-0">
          📊
        </span>
      );
    }

    return widgetConfig.icon({
      className: "h-3.5 w-3.5 text-foreground shrink-0",
    });
  };

  const _renderWidgetEditIcon = (widgetID) => {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        square
        className="shrink-0 text-muted-foreground hover:text-foreground"
        onClick={() => {
          setSelectedWidgetID(widgetID);
          setIsIdeOpen(true);
        }}
      >
        <Edit2 className="h-4 w-4" />
      </Button>
    );
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
          <ExternalLink className="h-4 w-4" />
        </Link>
      </Button>
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-3 bg-background">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {CONSTANTS.STRINGS.APP_PAGE_WIDGET_LIST_WIDGETS_TITLE}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1 border-border/50 font-medium"
          onClick={() => {
            setSelectedWidgetID(null);
            setIsIdeOpen(true);
          }}
        >
          <Plus className="h-3.5 w-3.5 text-primary" />
          Create Inline
        </Button>
      </div>

      {/* Search Input - Small Size (size="sm") per Section 29 */}
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

      <div 
        onScroll={_handleScroll}
        className="flex w-full flex-1 flex-col gap-2 min-h-0 overflow-y-auto"
      >
        <ReactQueryLoadingErrorWrapper
          isLoading={isLoadingWidgets}
          error={loadWidgetsError}
        >
          {widgets?.length > 0 ? (
            <>
              {widgets.map((widget) => {
                const key = `widget_${widget.widgetID}`;
                const widgetLabel = WIDGETS_MAP[widget.widgetType]?.label || widget.widgetType;
                const widgetDesc = WIDGETS_MAP[widget.widgetType]?.description || "Custom component";
                
                return (
                  <div
                    key={key}
                    id={key}
                    className="flex items-center justify-between gap-3 rounded-md border border-border bg-card p-2 shadow-sm hover:border-border/80 transition-all duration-200 group"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2">
                      <div
                        draggable
                        onDragStart={(e) => _handleDragStart(e, key)}
                        className="cursor-grab text-muted-foreground/30 hover:text-foreground active:cursor-grabbing shrink-0"
                      >
                        <GripVertical className="h-4 w-4" />
                      </div>
                      
                      {/* Icon container - xs radius per Section 6 */}
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted border border-border/50 shadow-inner">
                        {_renderWidgetIcon(widget.widgetType)}
                      </div>
                      
                      <div className="min-w-0 flex-1">
                        <span className="truncate text-sm font-medium text-foreground block">
                          {widget.widgetTitle}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-[9px] font-mono font-semibold uppercase tracking-wider text-muted-foreground/60 shrink-0">
                            {widgetLabel}
                          </span>
                          <span className="text-[9px] text-muted-foreground/30 select-none shrink-0">•</span>
                          <span className="text-[9px] text-muted-foreground truncate">
                            {widgetDesc}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
                      {_renderWidgetEditIcon(widget.widgetID)}
                      {_renderWidgetLinkIcon(widget.widgetID)}
                    </div>
                  </div>
                );
              })}
              {isFetchingNextPage && (
                <div className="flex justify-center p-2 text-xs text-muted-foreground animate-pulse">
                  Loading more...
                </div>
              )}
            </>
          ) : (
            <NoEntityUI
              message={
                searchQuery
                  ? "No matching widgets found"
                  : CONSTANTS.STRINGS.WIDGET_DRAWER_LIST_NO_WIDGET
              }
            />
          )}
        </ReactQueryLoadingErrorWrapper>
      </div>

      <WidgetIdeModal
        isOpen={isIdeOpen}
        onClose={() => setIsIdeOpen(false)}
        tenantID={tenantID}
        widgetID={selectedWidgetID}
        appPageEditorForm={appPageEditorForm}
        onAddWidget={onAddWidget}
      />
    </div>
  );
};

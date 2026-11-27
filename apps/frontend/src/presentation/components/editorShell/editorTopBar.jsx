import React from "react";
import PropTypes from "prop-types";
import { ChevronLeft, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button, cn } from "@jet-admin/ui";

/**
 * Compact editor chrome shared by App Page Builder and Application Studio.
 *
 * Four stacked bars (global nav, page header, draft banner, editor toolbar)
 * used to consume most of the viewport before the canvas. This bar keeps the
 * page identity, focus toggle and primary actions in a single 48px row.
 */
export const EditorTopBar = ({
  title,
  subtitle,
  badge,
  onBack,
  backLabel = "Back",
  backText,
  focusMode = false,
  onToggleFocus,
  actions,
  className,
}) => (
  <div
    className={cn(
      "editor-top-bar flex w-full h-12 shrink-0 items-center justify-between gap-2 border-b border-border bg-background px-2",
      className
    )}
  >
    <div className="flex min-w-0 flex-1 items-center gap-1">
      {onBack && (
        <Button
          type="button"
          variant="ghost"
          size={backText ? "sm" : "icon"}
          className={cn("h-8 shrink-0 gap-1", backText ? "px-2" : "w-8")}
          onClick={onBack}
          aria-label={backLabel}
          title={backLabel}
        >
          <ChevronLeft className="h-4 w-4" />
          {backText && <span className="ml-1 hidden text-xs sm:inline">{backText}</span>}
        </Button>
      )}

      {onToggleFocus && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground"
          onClick={onToggleFocus}
          aria-label={focusMode ? "Show navigation" : "Focus editor"}
          title={
            focusMode
              ? "Show navigation"
              : "Focus editor — hide navigation and maximize canvas"
          }
        >
          {focusMode ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </Button>
      )}

      <div className="min-w-0 pl-0.5">
        <div className="flex min-w-0 items-center gap-2">
          <h1 className="truncate text-sm font-medium leading-none text-foreground">
            {title}
          </h1>
          {badge}
        </div>
        {subtitle && (
          <p className="mt-1 hidden truncate text-[10px] leading-none text-muted-foreground sm:block">
            {subtitle}
          </p>
        )}
      </div>
    </div>

    <div className="flex max-w-[62%] shrink-0 items-center gap-0.5 overflow-x-auto sm:max-w-none">
      {actions}
    </div>
  </div>
);

EditorTopBar.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.node,
  badge: PropTypes.node,
  onBack: PropTypes.func,
  backLabel: PropTypes.string,
  backText: PropTypes.string,
  focusMode: PropTypes.bool,
  onToggleFocus: PropTypes.func,
  actions: PropTypes.node,
  className: PropTypes.string,
};

import * as React from "react";
import { AlertTriangle, Inbox, RefreshCw } from "lucide-react";
import { Button } from "./button";
import { Spinner } from "./spinner";
import { cn } from "../lib/utils";

/**
 * WidgetBusy — in-place refresh overlay with correct live-region semantics.
 * The surrounding widget should also set aria-busy when it owns the region.
 */
export const WidgetBusy = ({ label = "Updating…", className, inline = false }) => {
  if (inline) {
    return (
      <div
        role="status"
        aria-live="polite"
        className={cn("inline-flex items-center gap-1.5 text-xs text-muted-foreground", className)}
      >
        <Spinner size={12} />
        {label}
      </div>
    );
  }
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "absolute inset-0 z-20 flex items-center justify-center rounded-card bg-background/65 backdrop-blur-[1px]",
        className
      )}
    >
      <div className="flex items-center gap-2 rounded-control border border-border bg-card px-3 py-1.5 text-xs text-foreground shadow-soft">
        <Spinner size={13} />
        <span>{label}</span>
      </div>
    </div>
  );
};

/**
 * WidgetEmpty — friendly, optional-action empty state. No outer click target.
 */
export const WidgetEmpty = ({
  icon: Icon = Inbox,
  title = "Nothing here yet",
  description,
  action,
  className,
}) => (
  <div className={cn("flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center", className)}>
    <div className="flex h-9 w-9 items-center justify-center rounded-card border border-border bg-muted/40 text-muted-foreground/70">
      <Icon className="h-4 w-4" aria-hidden="true" />
    </div>
    <div className="space-y-0.5">
      <p className="text-xs font-medium text-foreground">{title}</p>
      {description && <p className="max-w-[36ch] text-[11px] leading-snug text-muted-foreground">{description}</p>}
    </div>
    {action}
  </div>
);

/**
 * WidgetError — recoverable inline error with focusable retry.
 */
export const WidgetError = ({
  title = "Could not load this widget",
  message,
  onRetry,
  retryLabel = "Try again",
  className,
}) => (
  <div role="alert" className={cn("flex h-full w-full flex-col items-center justify-center gap-2 p-6 text-center", className)}>
    <div className="flex h-9 w-9 items-center justify-center rounded-card border border-destructive/30 bg-destructive/10 text-destructive">
      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
    </div>
    <div className="space-y-0.5">
      <p className="text-xs font-medium text-foreground">{title}</p>
      {message && <p className="max-w-[42ch] text-[11px] leading-snug text-muted-foreground">{message}</p>}
    </div>
    {onRetry && (
      <Button type="button" variant="outline" size="sm" className="mt-1 h-7 gap-1 text-[11px]" onClick={onRetry}>
        <RefreshCw className="h-3 w-3" />
        {retryLabel}
      </Button>
    )}
  </div>
);

/**
 * WidgetSurface — density-aware inner container. Widgets can opt in without
 * changing their outer page chrome.
 */
export const WidgetSurface = ({ density = "comfortable", className, children, ...props }) => (
  <div
    className={cn(`widget-density-${density}`, "widget-surface", className)}
    data-density={density}
    {...props}
  >
    {children}
  </div>
);

import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { Skeleton, WidgetSurface, cn } from "@jet-admin/ui";
import { normalizeFieldBoolean } from "../_shared/fieldContracts";
import { resolveConditionalStyle } from "../config/conditionalStyle";

const STATUS_CLASS = {
  default: "bg-primary",
  primary: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-destructive",
  danger: "bg-destructive",
  info: "bg-info",
};

const STATUS_TEXT = {
  default: "text-primary",
  success: "text-success",
  warning: "text-warning",
  error: "text-destructive",
  danger: "text-destructive",
  info: "text-info",
};

export const ProgressWidget = ({ widgetConfig, fireWidgetEvent }) => {
  const label = widgetConfig?.label || "";
  const variant = widgetConfig?.variant || "bar";
  const showValue = widgetConfig?.showValue !== false;
  const status = widgetConfig?.status || "default";
  const labelPosition = widgetConfig?.labelPosition || "above";
  const indeterminate = normalizeFieldBoolean(widgetConfig?.indeterminate, false);
  const striped = normalizeFieldBoolean(widgetConfig?.striped, false);
  const animated = widgetConfig?.animated !== false;
  const decimals = Math.max(0, Math.min(6, Number(widgetConfig?.decimals) || 0));
  const unit = widgetConfig?.unit ?? "%";
  const density = widgetConfig?.properties?.density || "comfortable";
  const isLoading = normalizeFieldBoolean(widgetConfig?.isLoading, false);
  const value = useMemo(() => {
    const raw = widgetConfig?.valueTemplate ?? widgetConfig?.value;
    const number = Number(raw);
    if (!Number.isFinite(number)) return 0;
    return Math.min(100, Math.max(0, number));
  }, [widgetConfig?.valueTemplate, widgetConfig?.value]);
  const displayValue = `${value.toFixed(decimals)}${unit}`;
  const conditional = resolveConditionalStyle(widgetConfig?.styleRules, { value, ...widgetConfig });
  const effectiveStatus = conditional?.tone && conditional.tone !== "neutral" ? conditional.tone : status;
  const barColor = STATUS_CLASS[effectiveStatus] || STATUS_CLASS.default;
  const textColor = conditional?.textClass || STATUS_TEXT[effectiveStatus] || STATUS_TEXT.default;
  const clickable = Array.isArray(widgetConfig?.events?.onClick) && widgetConfig.events.onClick.length > 0;

  if (isLoading) {
    return (
      <WidgetSurface density={density} className="flex h-full w-full flex-col justify-center gap-2">
        <Skeleton className="h-2.5 w-24" />
        <Skeleton className="h-2 w-full rounded-full" />
      </WidgetSurface>
    );
  }

  const labelNode = label ? (
    <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
  ) : null;
  const valueNode = showValue ? (
    <span className={cn("text-xs font-semibold tabular-nums", textColor)}>{displayValue}</span>
  ) : null;

  return (
    <WidgetSurface
      density={density}
      className={cn("relative flex h-full w-full flex-col justify-center gap-2", clickable && "cursor-pointer")}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? () => fireWidgetEvent?.("onClick", { value }) : undefined}
      onKeyDown={
        clickable
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                fireWidgetEvent?.("onClick", { value });
              }
            }
          : undefined
      }
    >
      {(labelPosition === "above" || labelPosition === "inline") && (
        <div className="flex items-center justify-between gap-2">
          {labelNode}
          {valueNode}
        </div>
      )}

      {variant === "ring" ? (
        <div className="flex items-center justify-center">
          <div
            className="relative h-[110px] w-[110px]"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={indeterminate ? undefined : Math.round(value)}
            aria-valuetext={indeterminate ? "In progress" : displayValue}
            aria-label={label || "Progress"}
          >
            <svg width="110" height="110" viewBox="0 0 110 110" aria-hidden="true">
              <circle cx="55" cy="55" r="44" className="stroke-muted" strokeWidth="10" fill="none" />
              <circle
                cx="55"
                cy="55"
                r="44"
                className={cn(animated && "transition-[stroke-dashoffset] duration-300 motion-reduce:transition-none", STATUS_TEXT[status] || "text-primary")}
                stroke="currentColor"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 44}
                strokeDashoffset={indeterminate ? 2 * Math.PI * 44 * 0.7 : 2 * Math.PI * 44 * (1 - value / 100)}
                transform="rotate(-90 55 55)"
              />
            </svg>
            {(showValue || indeterminate) && (
              <span className="absolute inset-0 flex items-center justify-center text-xl font-medium tabular-nums text-foreground">
                {indeterminate ? "…" : Math.round(value)}
                {!indeterminate && <span className="text-xs text-muted-foreground">{unit}</span>}
              </span>
            )}
          </div>
        </div>
      ) : variant === "segmented" ? (
        <div
          className="flex w-full gap-1"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(value)}
          aria-label={label || "Progress"}
        >
          {Array.from({ length: 10 }).map((_, index) => (
            <span
              key={index}
              className={cn(
                "h-2.5 flex-1 rounded-[2px] transition-colors",
                value >= (index + 1) * 10 ? barColor : "bg-muted",
                animated && "duration-300 motion-reduce:transition-none"
              )}
            />
          ))}
        </div>
      ) : (
        <div className="w-full">
          <div
            className="h-2.5 w-full overflow-hidden rounded-full border border-border bg-muted"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={indeterminate ? undefined : Math.round(value)}
            aria-valuetext={indeterminate ? "In progress" : displayValue}
            aria-label={label || "Progress"}
          >
            <div
              className={cn(
                "h-full rounded-full",
                barColor,
                indeterminate && "animate-pulse",
                striped && "jet-progress-striped",
                animated && !indeterminate && "transition-[width] duration-300 motion-reduce:transition-none"
              )}
              style={{ width: indeterminate ? "35%" : `${value}%` }}
            />
          </div>
        </div>
      )}

      {labelPosition === "below" && (
        <div className="flex items-center justify-between gap-2">
          {labelNode}
          {valueNode}
        </div>
      )}
    </WidgetSurface>
  );
};

ProgressWidget.propTypes = { widgetConfig: PropTypes.object, fireWidgetEvent: PropTypes.func };
export default ProgressWidget;

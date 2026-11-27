import React from "react";
import PropTypes from "prop-types";
import { Skeleton, WidgetSurface, cn } from "@jet-admin/ui";
import { getIconComponent } from "../config/IconPicker";
import { resolveConditionalStyle } from "../config/conditionalStyle";
import { normalizeFieldBoolean } from "../_shared/fieldContracts";

const VARIANT_CLASS = {
  default: "border-transparent bg-primary text-brand-black",
  soft: "status-info",
  outline: "border-border bg-transparent text-foreground",
  success: "status-success",
  warning: "status-warning",
  danger: "status-danger",
  info: "status-info",
  neutral: "status-neutral",
};

export const BadgeWidget = ({ widgetConfig, fireWidgetEvent }) => {
  const text = widgetConfig?.text ?? "Badge";
  const variant = widgetConfig?.variant || "default";
  const size = widgetConfig?.size || "default";
  const isLoading = normalizeFieldBoolean(widgetConfig?.isLoading, false);
  const dot = normalizeFieldBoolean(widgetConfig?.dot, false);
  const Icon = getIconComponent(widgetConfig?.icon);
  const shape = widgetConfig?.shape || "pill";
  const alignment = widgetConfig?.alignment || "center";
  const maxWidth = widgetConfig?.maxWidth || "";
  const density = widgetConfig?.properties?.density || "comfortable";
  const conditional = resolveConditionalStyle(widgetConfig?.styleRules, { value: text, text, ...widgetConfig });

  if (isLoading) {
    return (
      <WidgetSurface density={density} className="flex h-full w-full items-center justify-center">
        <Skeleton className="h-5 w-20 rounded-full" />
      </WidgetSurface>
    );
  }

  const iconSize = size === "lg" ? "h-4 w-4" : "h-3.5 w-3.5";
  const sizeClass = size === "sm" ? "text-[10px] px-1.5 py-0" : size === "lg" ? "text-sm px-3 py-1" : "";
  const alignClass = alignment === "left" ? "justify-start" : alignment === "right" ? "justify-end" : "justify-center";
  const interactive = Array.isArray(widgetConfig?.events?.onClick) && widgetConfig.events.onClick.length > 0;

  return (
    <WidgetSurface density={density} className={cn("flex h-full w-full items-center p-1", alignClass)}>
      <span
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        onClick={interactive ? () => fireWidgetEvent?.("onClick", { text }) : undefined}
        onKeyDown={
          interactive
            ? (event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  fireWidgetEvent?.("onClick", { text });
                }
              }
            : undefined
        }
        className={cn(
          "inline-flex max-w-full items-center gap-1 border px-2 py-0.5 text-xs font-medium",
          sizeClass,
          shape === "pill" ? "rounded-full" : "rounded-control",
          conditional ? conditional.className : VARIANT_CLASS[variant] || VARIANT_CLASS.default,
          interactive && "cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
        )}
        style={maxWidth ? { maxWidth } : undefined}
        title={String(text)}
      >
        {dot && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />}
        {Icon && <Icon className={cn(iconSize, "shrink-0")} aria-hidden="true" />}
        <span className="truncate">{String(text)}</span>
      </span>
    </WidgetSurface>
  );
};

BadgeWidget.propTypes = { widgetConfig: PropTypes.object, fireWidgetEvent: PropTypes.func };
export default BadgeWidget;

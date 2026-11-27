import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Check, Copy } from "lucide-react";
import { WidgetSurface, cn } from "@jet-admin/ui";
import { normalizeFieldBoolean } from "../_shared/fieldContracts";

const prettify = (key) => String(key).replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
const stringify = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

export const KeyValueWidget = ({ widgetConfig, fireWidgetEvent }) => {
  const emptyText = widgetConfig?.emptyText || "No data";
  const layout = widgetConfig?.layout || "grid";
  const columns = Math.min(3, Math.max(1, Number(widgetConfig?.columns || 1)));
  const labelWidth = widgetConfig?.labelWidth || "";
  const copyable = normalizeFieldBoolean(widgetConfig?.copyable, false);
  const dividers = normalizeFieldBoolean(widgetConfig?.dividers, false);
  const truncate = normalizeFieldBoolean(widgetConfig?.truncate, false);
  const isLoading = normalizeFieldBoolean(widgetConfig?.isLoading, false);
  const density = widgetConfig?.properties?.density || "comfortable";
  const [copiedKey, setCopiedKey] = useState("");

  const entries = useMemo(() => {
    const template = widgetConfig?.dataTemplate;
    if (template && typeof template === "object" && !Array.isArray(template)) {
      return Object.entries(template).map(([key, value]) => ({ label: prettify(key), value: stringify(value), raw: value }));
    }
    if (Array.isArray(widgetConfig?.items) && widgetConfig.items.length) {
      return widgetConfig.items.map((item) => ({
        label: item.label || item.key || "",
        value: stringify(item.value),
        raw: item.value,
      }));
    }
    return [];
  }, [widgetConfig?.dataTemplate, widgetConfig?.items]);

  const copyValue = async (entry) => {
    try {
      await navigator.clipboard.writeText(String(entry.raw ?? entry.value));
      setCopiedKey(entry.label);
      setTimeout(() => setCopiedKey(""), 1200);
    } catch {
      setCopiedKey("");
    }
  };

  const clickable = Array.isArray(widgetConfig?.events?.onClick) && widgetConfig.events.onClick.length > 0;

  return (
    <WidgetSurface
      density={density}
      className={cn("relative flex h-full w-full flex-col overflow-auto", clickable && "cursor-pointer")}
      role={clickable ? "button" : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={clickable ? () => fireWidgetEvent?.("onClick", {}) : undefined}
      onKeyDown={
        clickable
          ? (event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                fireWidgetEvent?.("onClick", {});
              }
            }
          : undefined
      }
      aria-busy={isLoading || undefined}
    >
      {entries.length === 0 ? (
        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">{emptyText}</div>
      ) : (
        <dl
          className={cn(
            layout === "grid" ? "grid gap-2" : "flex flex-col gap-1",
            layout === "inline" && "gap-1"
          )}
          style={layout === "grid" ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined}
        >
          {entries.map((entry, index) => (
            <div
              key={`${entry.label}-${index}`}
              className={cn(
                "group/detail min-w-0",
                layout === "grid" && "rounded-card border border-border bg-card p-2",
                layout !== "grid" && dividers && index > 0 && "border-t border-border/60 pt-1",
                layout === "stacked" && "flex flex-col gap-0.5",
                layout === "inline" && "flex items-baseline gap-2"
              )}
            >
              <dt
                className={cn("shrink-0 text-[10px] font-medium uppercase tracking-wider text-muted-foreground", truncate && "truncate")}
                style={labelWidth ? { width: labelWidth } : undefined}
              >
                {entry.label}
              </dt>
              <dd className={cn("min-w-0 text-xs text-foreground", truncate ? "truncate" : "break-words", layout === "grid" && "mt-0.5")}>
                <span className="inline-flex max-w-full items-center gap-1">
                  <span className={truncate ? "truncate" : "break-words"}>{entry.value}</span>
                  {copyable && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        copyValue(entry);
                      }}
                      className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-control text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground focus-visible:opacity-100 group-hover/detail:opacity-100"
                      aria-label={`Copy ${entry.label}`}
                      title="Copy value"
                    >
                      {copiedKey === entry.label ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                    </button>
                  )}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      )}
    </WidgetSurface>
  );
};

KeyValueWidget.propTypes = { widgetConfig: PropTypes.object, fireWidgetEvent: PropTypes.func };
export default KeyValueWidget;

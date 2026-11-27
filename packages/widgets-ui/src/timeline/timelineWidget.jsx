import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";
import { Skeleton, WidgetEmpty, WidgetSurface, cn } from "@jet-admin/ui";
import { getIconComponent } from "../config/IconPicker";
import { normalizeFieldBoolean } from "../_shared/fieldContracts";

const toDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return isValid(value) ? value : null;
  const date = /^\d{4}-\d{2}-\d{2}$/.test(String(value)) ? new Date(`${value}T00:00:00`) : parseISO(String(value));
  return isValid(date) ? date : null;
};

const STATUS_DOT = { success: "bg-success", warning: "bg-warning", error: "bg-destructive", danger: "bg-destructive", info: "bg-info", neutral: "bg-muted-foreground" };

export const TimelineWidget = ({ widgetConfig, fireWidgetEvent }) => {
  const emptyText = widgetConfig?.emptyText || "No activity yet";
  const titleKey = widgetConfig?.titleKey || "title";
  const timeKey = widgetConfig?.timeKey || "time";
  const descKey = widgetConfig?.descriptionKey || "description";
  const iconKey = widgetConfig?.iconKey || "";
  const colorKey = widgetConfig?.colorKey || "";
  const statusKey = widgetConfig?.statusKey || "";
  const relativeTime = normalizeFieldBoolean(widgetConfig?.relativeTime, false);
  const groupByDay = normalizeFieldBoolean(widgetConfig?.groupByDay, false);
  const compact = widgetConfig?.variant === "compact";
  const isLoading = normalizeFieldBoolean(widgetConfig?.isLoading, false);
  const density = widgetConfig?.properties?.density || "comfortable";

  const events = useMemo(() => (Array.isArray(widgetConfig?.dataTemplate) ? widgetConfig.dataTemplate : []), [widgetConfig?.dataTemplate]);
  const groups = useMemo(() => {
    if (!groupByDay) return [["", events]];
    const map = new Map();
    for (const event of events) {
      const date = toDate(event?.[timeKey]);
      const key = date ? format(date, "PPP") : "Unknown date";
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(event);
    }
    return Array.from(map.entries());
  }, [events, groupByDay, timeKey]);

  if (isLoading) {
    return (
      <WidgetSurface density={density} className="flex h-full w-full flex-col gap-2">
        <Skeleton className="h-3 w-1/4" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-full" />
        <Skeleton className="h-9 w-4/5" />
      </WidgetSurface>
    );
  }

  return (
    <WidgetSurface density={density} className="flex h-full w-full flex-col overflow-auto">
      {events.length === 0 ? (
        <WidgetEmpty title={emptyText} />
      ) : (
        <div className="space-y-2">
          {groups.map(([group, groupEvents]) => (
            <div key={group || "__all"}>
              {group && <p className="mb-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{group}</p>}
              <ol className={cn("relative ml-1.5 border-l border-border", compact ? "space-y-1.5" : "space-y-2.5")}>
                {groupEvents.map((event, index) => {
                  const date = toDate(event?.[timeKey]);
                  const timeLabel = date ? (relativeTime ? formatDistanceToNow(date, { addSuffix: true }) : format(date, "MMM d, yyyy · HH:mm")) : String(event?.[timeKey] ?? "");
                  const Icon = getIconComponent(event?.[iconKey]);
                  const color = event?.[colorKey];
                  const status = event?.[statusKey];
                  return (
                    <li key={`${event?.id ?? index}`} className="relative ml-3">
                      <span className={cn("absolute -left-[19px] top-2 h-2 w-2 rounded-full border border-background", STATUS_DOT[status] || "bg-primary")} aria-hidden="true" />
                      <button
                        type="button"
                        onClick={() => fireWidgetEvent?.("onItemClick", { item: event, index })}
                        className={cn(
                          "w-full rounded-control border border-border bg-card text-left transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                          compact ? "px-2 py-1" : "p-2"
                        )}
                      >
                        <div className="flex items-start gap-2">
                          {Icon && (
                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-control border border-border bg-muted/40" style={color ? { color } : undefined}>
                              <Icon className="h-3 w-3" aria-hidden="true" />
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-baseline justify-between gap-x-2">
                              <span className="text-xs font-semibold text-foreground">{String(event?.[titleKey] ?? event?.title ?? `Event ${index + 1}`)}</span>
                              {timeLabel && <time className="text-[10px] tabular-nums text-muted-foreground">{timeLabel}</time>}
                            </div>
                            {(event?.[descKey] || event?.body) && !compact && (
                              <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{String(event?.[descKey] ?? event?.body)}</p>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      )}
    </WidgetSurface>
  );
};

TimelineWidget.propTypes = { widgetConfig: PropTypes.object, fireWidgetEvent: PropTypes.func };
export default TimelineWidget;

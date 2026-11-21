import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Button } from "@jet-admin/ui";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { addMonths, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek } from "date-fns";

const parseValue = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const raw = String(value);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(`${raw}T00:00:00`) : parseISO(raw);
  return date && !Number.isNaN(date.getTime()) ? date : null;
};

const display = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

/**
 * Generic month calendar widget.
 *
 * Config: { dateKey, endDateKey?, titleKey, subtitleKey, groupKey, emptyText,
 *          isLoading }
 * Data: the resolved `data` array from the page runtime.
 *
 * Selecting an event fires onEventSelect. Editing is intentionally left to the
 * record detail page so all writes go through audited queries.
 */
export function CalendarWidget({ widgetConfig = {}, data, widgetState, setWidgetState, fireWidgetEvent }) {
  const rows = Array.isArray(data) ? data : [];
  const dateKey = widgetConfig.dateKey || "due_at";
  const titleKey = widgetConfig.titleKey || "name";
  const subtitleKey = widgetConfig.subtitleKey;
  const groupKey = widgetConfig.groupKey;
  const isLoading = widgetConfig.isLoading === true || widgetConfig.isLoading === "true";
  const emptyText = widgetConfig.emptyText || "No dated records.";

  const initialMonth = useMemo(() => {
    for (const row of rows) {
      const date = parseValue(row?.[dateKey]);
      if (date) return startOfMonth(date);
    }
    return startOfMonth(new Date());
  }, [rows, dateKey]);
  const [month, setMonth] = useState(initialMonth);
  const [selected, setSelected] = useState(null);

  const eventsByDay = useMemo(() => {
    const map = new Map();
    for (const row of rows) {
      const date = parseValue(row?.[dateKey]);
      if (!date) continue;
      const key = format(date, "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key).push({ row, date });
    }
    return map;
  }, [rows, dateKey]);

  const days = useMemo(() => {
    const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [month]);

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const today = new Date();

  return (
    <div className="relative flex h-full min-h-[360px] w-full flex-col overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded bg-background/60 backdrop-blur-[1px]">
          <div className="rounded border border-border bg-muted/60 px-4 py-2 text-sm">Loading calendar…</div>
        </div>
      )}
      <div className="flex items-center justify-between border-b border-border px-2 py-2">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <h3 className="text-sm font-semibold text-foreground">{format(month, "MMMM yyyy")}</h3>
        </div>
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMonth((m) => addMonths(m, -1))} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button type="button" variant="outline" size="sm" className="h-7 text-xs" onClick={() => setMonth(startOfMonth(new Date()))}>Today</Button>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => setMonth((m) => addMonths(m, 1))} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {!rows.length && !isLoading ? (
        <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">{emptyText}</div>
      ) : (
        <div className="flex-1 overflow-auto p-2">
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div key={day} className="px-1 py-1 text-center text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{day}</div>
            ))}
            {days.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const events = eventsByDay.get(key) || [];
              const outside = !isSameMonth(day, month);
              const isToday = isSameDay(day, today);
              return (
                <div key={key} className={`min-h-[92px] rounded border p-1 ${outside ? "border-transparent bg-muted/10 opacity-60" : "border-border bg-background"}`}>
                  <div className={`mb-1 flex items-center justify-between px-0.5 text-[11px] ${isToday ? "font-bold text-primary" : "text-muted-foreground"}`}>
                    <span>{format(day, "d")}</span>
                    {events.length > 0 && <span className="rounded-full bg-muted px-1.5 text-[10px]">{events.length}</span>}
                  </div>
                  <div className="space-y-1">
                    {events.slice(0, 3).map(({ row }, index) => {
                      const isSelected = selected === `${key}-${index}`;
                      return (
                        <button
                          key={`${key}-${index}`}
                          type="button"
                          onClick={() => {
                            setSelected(`${key}-${index}`);
                            if (setWidgetState) setWidgetState((prev) => ({ ...prev, selectedEvent: row }));
                            if (fireWidgetEvent) fireWidgetEvent("onEventSelect", { event: row, date: key });
                          }}
                          className={`w-full truncate rounded px-1.5 py-0.5 text-left text-[11px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isSelected ? "bg-primary text-primary-foreground" : "bg-primary/10 text-foreground hover:bg-primary/20"}`}
                          title={`${display(row?.[titleKey])}${subtitleKey && row?.[subtitleKey] ? ` · ${display(row[subtitleKey])}` : ""}`}
                        >
                          {display(row?.[titleKey])}
                          {groupKey && row?.[groupKey] ? ` · ${display(row[groupKey])}` : ""}
                        </button>
                      );
                    })}
                    {events.length > 3 && <p className="px-1 text-[10px] text-muted-foreground">+{events.length - 3} more</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

CalendarWidget.propTypes = {
  widgetConfig: PropTypes.object,
  data: PropTypes.array,
  widgetState: PropTypes.object,
  setWidgetState: PropTypes.func,
  fireWidgetEvent: PropTypes.func,
};

export default CalendarWidget;

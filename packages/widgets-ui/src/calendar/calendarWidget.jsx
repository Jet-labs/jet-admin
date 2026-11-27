import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button, Skeleton, WidgetEmpty, WidgetSurface, cn } from "@jet-admin/ui";
import { addMonths, addWeeks, eachDayOfInterval, endOfMonth, endOfWeek, format, isSameDay, isSameMonth, parseISO, startOfMonth, startOfWeek } from "date-fns";
import { normalizeFieldBoolean } from "../_shared/fieldContracts";

const parseValue = (value) => {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const raw = String(value);
  const date = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? new Date(`${raw}T00:00:00`) : parseISO(raw);
  return date && !Number.isNaN(date.getTime()) ? date : null;
};
const display = (value) => (value === null || value === undefined || value === "" ? "—" : typeof value === "object" ? JSON.stringify(value) : String(value));

export function CalendarWidget({ widgetConfig = {}, data, widgetState, setWidgetState, fireWidgetEvent }) {
  const rows = Array.isArray(data) ? data : Array.isArray(widgetConfig.dataArrayTemplate) ? widgetConfig.dataArrayTemplate : [];
  const dateKey = widgetConfig.dateKey || "due_at";
  const titleKey = widgetConfig.titleKey || "name";
  const subtitleKey = widgetConfig.subtitleKey;
  const groupKey = widgetConfig.groupKey;
  const view = widgetConfig.view || "month";
  const weekStartsOn = Number(widgetConfig.weekStartsOn) === 0 ? 0 : 1;
  const showWeekends = widgetConfig.showWeekends !== false;
  const allowDrag = normalizeFieldBoolean(widgetConfig.allowDrag, false);
  const allowCreate = normalizeFieldBoolean(widgetConfig.allowCreate, false);
  const showMiniCalendar = normalizeFieldBoolean(widgetConfig.showMiniCalendar, false);
  const itemKey = widgetConfig.itemKey || "id";
  const isLoading = normalizeFieldBoolean(widgetConfig.isLoading, false);
  const density = widgetConfig?.properties?.density || "comfortable";
  const emptyText = widgetConfig.emptyText || "No dated records.";
  const groupColors = useMemo(() => {
    const map = new Map();
    for (const entry of Array.isArray(widgetConfig.groupColors) ? widgetConfig.groupColors : []) {
      if (entry?.label) map.set(String(entry.label), entry.value || "");
    }
    return map;
  }, [widgetConfig.groupColors]);

  const initialMonth = useMemo(() => {
    for (const row of rows) {
      const date = parseValue(row?.[dateKey]);
      if (date) return startOfMonth(date);
    }
    return startOfMonth(new Date());
  }, [rows, dateKey]);
  const [cursor, setCursor] = useState(initialMonth);
  const [selected, setSelected] = useState(null);
  const [moves, setMoves] = useState({});
  const [dragOverDay, setDragOverDay] = useState(null);

  const eventId = (row, index) => String(row?.[itemKey] ?? `${dateKey}-${index}`);

  const events = useMemo(
    () =>
      rows
        .map((row, index) => ({
          row,
          index,
          id: eventId(row, index),
          date: parseValue(moves[eventId(row, index)] ?? row?.[dateKey]),
        }))
        .filter((entry) => entry.date)
        .sort((a, b) => a.date - b.date),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, dateKey, moves, itemKey]
  );
  const eventsByDay = useMemo(() => {
    const map = new Map();
    for (const entry of events) {
      const key = format(entry.date, "yyyy-MM-dd");
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(entry);
    }
    return map;
  }, [events]);

  const days = useMemo(() => {
    if (view === "week") {
      const start = startOfWeek(cursor, { weekStartsOn });
      return eachDayOfInterval({ start, end: endOfWeek(cursor, { weekStartsOn }) });
    }
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn });
    return eachDayOfInterval({ start, end });
  }, [cursor, view, weekStartsOn]);
  const visibleDays = showWeekends ? days : days.filter((day) => day.getDay() !== 0 && day.getDay() !== 6);
  const weekDays = weekStartsOn === 0 ? ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const shift = (direction) => setCursor((current) => (view === "week" ? addWeeks(current, direction) : addMonths(current, direction)));

  const selectEvent = (entry) => {
    setSelected(entry.id);
    if (setWidgetState) setWidgetState((prev) => ({ ...prev, selectedEvent: entry.row }));
    fireWidgetEvent?.("onEventSelect", { event: entry.row, date: format(entry.date, "yyyy-MM-dd") });
  };

  const moveEvent = (id, targetDay) => {
    if (!allowDrag) return;
    const entry = events.find((item) => item.id === id);
    if (!entry) return;
    const from = format(entry.date, "yyyy-MM-dd");
    const to = format(targetDay, "yyyy-MM-dd");
    if (from === to) return;
    setMoves((prev) => ({ ...prev, [id]: to }));
    setSelected(id);
    fireWidgetEvent?.("onEventMove", {
      event: entry.row,
      id,
      from,
      to,
      fromDate: from,
      toDate: to,
    });
  };

  const createOnDay = (day) => {
    if (!allowCreate) return;
    const date = format(day, "yyyy-MM-dd");
    fireWidgetEvent?.("onDateClick", { date, dateKey });
    fireWidgetEvent?.("onEventCreate", { date, dateKey });
  };

  const dropProps = (day) => ({
    onDragOver: (event) => {
      if (!allowDrag) return;
      event.preventDefault();
      setDragOverDay(format(day, "yyyy-MM-dd"));
    },
    onDragLeave: () => setDragOverDay((current) => (current === format(day, "yyyy-MM-dd") ? null : current)),
    onDrop: (event) => {
      if (!allowDrag) return;
      event.preventDefault();
      setDragOverDay(null);
      const id = event.dataTransfer.getData("text/jet-calendar-event");
      if (id) moveEvent(id, day);
    },
  });

  const miniDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor), { weekStartsOn });
    const end = endOfWeek(endOfMonth(cursor), { weekStartsOn });
    return eachDayOfInterval({ start, end });
  }, [cursor, weekStartsOn]);

  const createButton = (day) =>
    allowCreate ? (
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          createOnDay(day);
        }}
        className="inline-flex h-4 w-4 items-center justify-center rounded-control text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 group-hover/day:opacity-100"
        aria-label={`Add event on ${format(day, "PPP")}`}
        title="Add event"
      >
        <Plus className="h-3 w-3" />
      </button>
    ) : null;

  const chip = (entry, index) => {
    const id = entry.id || `${format(entry.date, "yyyy-MM-dd")}-${entry.index}`;
    const groupValue = groupKey ? String(entry.row?.[groupKey] ?? "") : "";
    const color = groupColors.get(groupValue);
    return (
      <button
        key={id}
        type="button"
        draggable={allowDrag}
        onDragStart={(event) => {
          if (!allowDrag) return;
          event.dataTransfer.setData("text/jet-calendar-event", id);
          event.dataTransfer.effectAllowed = "move";
        }}
        onClick={() => selectEvent(entry)}
        onDoubleClick={() => selectEvent(entry)}
        className={cn(
          "w-full truncate rounded-control px-1.5 py-0.5 text-left text-[10px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          selected === id ? "bg-primary text-primary-foreground" : "bg-primary/10 text-foreground hover:bg-primary/20",
          allowDrag && "cursor-grab active:cursor-grabbing"
        )}
        style={color ? { backgroundColor: color, color: "hsl(var(--foreground))" } : undefined}
        title={`${display(entry.row?.[titleKey])}${subtitleKey && entry.row?.[subtitleKey] ? ` · ${display(entry.row[subtitleKey])}` : ""}`}
      >
        {display(entry.row?.[titleKey])}
        {groupKey && entry.row?.[groupKey] ? ` · ${display(entry.row[groupKey])}` : ""}
      </button>
    );
  };

  if (isLoading) {
    return (
      <WidgetSurface density={density} className="flex h-full w-full flex-col gap-2">
        <Skeleton className="h-7 w-48" />
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 21 }).map((_, index) => <Skeleton key={index} className="h-16" />)}
        </div>
      </WidgetSurface>
    );
  }

  return (
    <WidgetSurface density={density} className="relative flex h-full w-full flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-2 py-1.5">
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <h3 className="text-sm font-medium text-foreground">
            {view === "week" ? `Week of ${format(startOfWeek(cursor, { weekStartsOn }), "MMM d, yyyy")}` : view === "agenda" ? "Agenda" : format(cursor, "MMMM yyyy")}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          {view !== "agenda" && (
            <>
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => shift(-1)} aria-label="Previous period"><ChevronLeft className="h-4 w-4" /></Button>
              <Button type="button" variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => setCursor(startOfMonth(new Date()))}>Today</Button>
              <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={() => shift(1)} aria-label="Next period"><ChevronRight className="h-4 w-4" /></Button>
            </>
          )}
        </div>
      </div>

      <div className="flex min-h-0 flex-1">
        {showMiniCalendar && view !== "month" && (
          <aside className="hidden w-44 shrink-0 overflow-auto border-r border-border p-2 lg:block" aria-label="Mini calendar">
            <div className="mb-1 flex items-center justify-between">
              <span className="text-[11px] font-medium text-foreground">{format(cursor, "MMM yyyy")}</span>
              <div className="flex items-center gap-0.5">
                <button type="button" onClick={() => setCursor((current) => addMonths(current, -1))} className="inline-flex h-5 w-5 items-center justify-center rounded-control text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Previous month"><ChevronLeft className="h-3 w-3" /></button>
                <button type="button" onClick={() => setCursor((current) => addMonths(current, 1))} className="inline-flex h-5 w-5 items-center justify-center rounded-control text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Next month"><ChevronRight className="h-3 w-3" /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-0.5">
              {weekDays.map((day) => <span key={day} className="py-0.5 text-center text-[8px] font-semibold uppercase text-muted-foreground">{day.slice(0, 1)}</span>)}
              {miniDays.map((day) => {
                const inMonth = isSameMonth(day, cursor);
                const isToday = isSameDay(day, new Date());
                const selectedDay = isSameDay(day, cursor);
                return (
                  <button
                    key={`mini-${format(day, "yyyy-MM-dd")}`}
                    type="button"
                    onClick={() => setCursor(day)}
                    className={cn(
                      "inline-flex h-5 w-5 items-center justify-center rounded-full text-[9px] tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                      !inMonth && "text-muted-foreground/40",
                      inMonth && !isToday && !selectedDay && "text-foreground hover:bg-muted",
                      isToday && "bg-primary text-primary-foreground",
                      selectedDay && !isToday && "bg-primary/15 font-semibold text-primary"
                    )}
                    aria-label={format(day, "PPP")}
                    aria-current={isToday ? "date" : undefined}
                  >
                    {format(day, "d")}
                  </button>
                );
              })}
            </div>
          </aside>
        )}
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {events.length === 0 ? (
        <WidgetEmpty title={emptyText} />
      ) : view === "agenda" ? (
        <div className="min-h-0 flex-1 overflow-auto p-2">
          <div className="space-y-2">
            {Array.from(eventsByDay.entries()).map(([key, entries]) => (
              <div key={key}>
                <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{format(new Date(`${key}T00:00:00`), "EEEE, MMM d")}</p>
                <div className="space-y-1">{entries.map(chip)}</div>
              </div>
            ))}
          </div>
        </div>
      ) : view === "week" ? (
        <div className="grid min-h-0 flex-1 auto-cols-fr grid-flow-col gap-1 overflow-auto p-2">
          {visibleDays.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const entries = eventsByDay.get(key) || [];
            return (
              <div
                key={key}
                className={cn(
                  "group/day min-h-[120px] rounded-control border bg-card p-1 transition-colors",
                  dragOverDay === key ? "border-primary bg-primary/5" : "border-border"
                )}
                {...dropProps(day)}
              >
                <div className={cn("mb-1 flex items-center justify-between px-0.5 text-[10px]", isSameDay(day, new Date()) ? "font-bold text-primary" : "text-muted-foreground")}>
                  <span>{format(day, "EEE d")}</span>
                  <span className="flex items-center gap-1">
                    {entries.length > 0 && <span className="rounded-full bg-muted px-1.5">{entries.length}</span>}
                    {createButton(day)}
                  </span>
                </div>
                <div className="space-y-1">{entries.map(chip)}</div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="min-h-0 flex-1 overflow-auto p-2">
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => <div key={day} className="px-1 py-0.5 text-center text-[9px] font-semibold uppercase tracking-wide text-muted-foreground">{day}</div>)}
            {visibleDays.map((day) => {
              const key = format(day, "yyyy-MM-dd");
              const entries = eventsByDay.get(key) || [];
              const outside = !isSameMonth(day, cursor);
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={key}
                  className={cn(
                    "group/day min-h-[80px] rounded-control border p-1 transition-colors",
                    outside ? "border-transparent bg-muted/10 opacity-60" : "border-border bg-background",
                    dragOverDay === key && "border-primary bg-primary/5 opacity-100"
                  )}
                  {...dropProps(day)}
                >
                  <div className={cn("mb-1 flex items-center justify-between px-0.5 text-[10px]", isToday ? "font-bold text-primary" : "text-muted-foreground")}>
                    <span>{format(day, "d")}</span>
                    <span className="flex items-center gap-1">
                      {entries.length > 0 && <span className="rounded-full bg-muted px-1.5 text-[9px]">{entries.length}</span>}
                      {createButton(day)}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {entries.slice(0, 3).map(chip)}
                    {entries.length > 3 && <p className="px-1 text-[9px] text-muted-foreground">+{entries.length - 3} more</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
        </div>
      </div>
    </WidgetSurface>
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

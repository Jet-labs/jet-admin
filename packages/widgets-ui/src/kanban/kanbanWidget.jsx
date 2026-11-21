import React from "react";
import PropTypes from "prop-types";

const titleCase = (value) =>
  String(value ?? "")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

const display = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

/**
 * Generic Kanban board widget.
 *
 * Config: { groupBy, titleKey, subtitleKey, valueKey, dateKey, badgeKey,
 *          columns, emptyText, isLoading }
 * Data: the resolved `data` array from the page runtime.
 *
 * Drag-and-drop is intentionally not implemented: status transitions must run
 * through the page's audited transition query. Selecting a card is supported.
 */
export function KanbanWidget({ widgetConfig = {}, data, widgetState, setWidgetState, fireWidgetEvent }) {
  const rows = Array.isArray(data) ? data : [];
  const groupBy = widgetConfig.groupBy || "status";
  const titleKey = widgetConfig.titleKey || "name";
  const subtitleKey = widgetConfig.subtitleKey;
  const valueKey = widgetConfig.valueKey;
  const dateKey = widgetConfig.dateKey;
  const badgeKey = widgetConfig.badgeKey || groupBy;
  const isLoading = widgetConfig.isLoading === true || widgetConfig.isLoading === "true";
  const emptyText = widgetConfig.emptyText || "No cards in this pipeline.";

  const columns = React.useMemo(() => {
    const configured = Array.isArray(widgetConfig.columns) ? widgetConfig.columns.filter(Boolean) : [];
    const present = [...new Set(rows.map((row) => String(row?.[groupBy] ?? "unassigned")))];
    const ordered = [...configured.map(String)];
    for (const value of present) if (!ordered.includes(value)) ordered.push(value);
    return ordered.length ? ordered : present;
  }, [rows, groupBy, widgetConfig.columns]);

  const grouped = React.useMemo(() => {
    const map = new Map(columns.map((column) => [column, []]));
    for (const row of rows) {
      const key = String(row?.[groupBy] ?? "unassigned");
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
    }
    return map;
  }, [rows, groupBy, columns]);

  const selected = widgetState?.selectedCard;

  return (
    <div className="relative flex h-full min-h-[320px] w-full flex-col overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center rounded bg-background/60 backdrop-blur-[1px]">
          <div className="rounded border border-border bg-muted/60 px-4 py-2 text-sm">Loading board…</div>
        </div>
      )}
      {!rows.length && !isLoading ? (
        <div className="flex flex-1 items-center justify-center p-8 text-sm text-muted-foreground">{emptyText}</div>
      ) : (
        <div className="flex flex-1 gap-3 overflow-x-auto p-1">
          {columns.map((column) => {
            const cards = grouped.get(column) || [];
            return (
              <section key={column} className="flex min-w-[240px] flex-1 flex-col rounded-lg border border-border bg-muted/20" aria-label={`${titleCase(column)} column`}>
                <header className="flex items-center justify-between border-b border-border px-3 py-2">
                  <h3 className="truncate text-xs font-semibold uppercase tracking-wide text-foreground">{titleCase(column)}</h3>
                  <span className="rounded-full bg-background px-2 py-0.5 text-[11px] text-muted-foreground">{cards.length}</span>
                </header>
                <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-2">
                  {cards.length === 0 && <p className="px-2 py-4 text-xs text-muted-foreground">No cards</p>}
                  {cards.map((card) => {
                    const isSelected = selected && selected.id === card.id;
                    return (
                      <button
                        key={card.id ?? `${column}-${card[titleKey]}`}
                        type="button"
                        onClick={() => {
                          if (setWidgetState) setWidgetState((prev) => ({ ...prev, selectedCard: card }));
                          if (fireWidgetEvent) fireWidgetEvent("onCardSelect", { card, group: column });
                        }}
                        className={`w-full rounded-md border p-3 text-left shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${isSelected ? "border-primary bg-primary/5" : "border-border bg-background hover:border-primary/40"}`}
                        aria-pressed={!!isSelected}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="line-clamp-2 text-sm font-semibold text-foreground">{display(card[titleKey])}</span>
                          {badgeKey && <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] uppercase text-muted-foreground">{display(card[badgeKey])}</span>}
                        </div>
                        {subtitleKey && card[subtitleKey] !== undefined && <p className="mt-1 truncate text-xs text-muted-foreground">{display(card[subtitleKey])}</p>}
                        <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                          {valueKey && card[valueKey] !== undefined ? <span className="font-medium text-foreground">{display(card[valueKey])}</span> : <span />}
                          {dateKey && card[dateKey] !== undefined && <span>{display(card[dateKey])}</span>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

KanbanWidget.propTypes = {
  widgetConfig: PropTypes.object,
  data: PropTypes.array,
  widgetState: PropTypes.object,
  setWidgetState: PropTypes.func,
  fireWidgetEvent: PropTypes.func,
};

export default KanbanWidget;

import React, { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { ChevronDown, ChevronLeft, ChevronRight, Plus, Search, X } from "lucide-react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
  WidgetEmpty,
  WidgetSurface,
  cn,
} from "@jet-admin/ui";
import { normalizeFieldBoolean } from "../_shared/fieldContracts";

const titleCase = (value) => String(value ?? "").replace(/[_-]+/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
const display = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

export function KanbanWidget({ widgetConfig = {}, widgetID, data, widgetState, setWidgetState, fireWidgetEvent }) {
  const rows = Array.isArray(data) ? data : Array.isArray(widgetConfig.dataArrayTemplate) ? widgetConfig.dataArrayTemplate : [];
  const groupBy = widgetConfig.groupBy || "status";
  const titleKey = widgetConfig.titleKey || "name";
  const subtitleKey = widgetConfig.subtitleKey;
  const valueKey = widgetConfig.valueKey;
  const dateKey = widgetConfig.dateKey;
  const badgeKey = widgetConfig.badgeKey || groupBy;
  const swimlaneKey = widgetConfig.swimlaneKey || "";
  const isLoading = normalizeFieldBoolean(widgetConfig.isLoading, false);
  const density = widgetConfig?.properties?.density || (widgetConfig?.variant === "compact" ? "compact" : "comfortable");
  const compact = widgetConfig?.variant === "compact" || density === "compact";
  const showCounts = widgetConfig?.showCounts !== false;
  const allowDrag = normalizeFieldBoolean(widgetConfig?.allowDrag, false);
  const collapsible = widgetConfig?.collapsible !== false;
  const searchable = normalizeFieldBoolean(widgetConfig?.searchable, false);
  const quickAdd = normalizeFieldBoolean(widgetConfig?.quickAdd, false);
  const detailDrawer = normalizeFieldBoolean(widgetConfig?.detailDrawer, true);
  const savedFiltersEnabled = normalizeFieldBoolean(widgetConfig?.savedFilters, false);
  const savedFiltersKey = `jet.kanban.filters.${widgetConfig?.filterStorageKey || widgetID || "default"}`;
  const emptyText = widgetConfig.emptyText || "No cards in this pipeline.";
  const [search, setSearch] = useState("");
  const [laneFilter, setLaneFilter] = useState("");
  const [collapsed, setCollapsed] = useState({});
  const [dragData, setDragData] = useState(null);
  const [overColumn, setOverColumn] = useState(null);
  const [moves, setMoves] = useState({});
  const [createdCards, setCreatedCards] = useState([]);
  const [quickAddColumn, setQuickAddColumn] = useState("");
  const [quickAddTitle, setQuickAddTitle] = useState("");
  const [detailCard, setDetailCard] = useState(null);
  const [savedFilters, setSavedFilters] = useState([]);
  const [savedFilterName, setSavedFilterName] = useState("");
  const selected = widgetState?.selectedCard;
  const allRows = useMemo(() => [...rows, ...createdCards], [rows, createdCards]);
  const cardId = (card, index) => String(card?.id ?? card?.[titleKey] ?? `card-${index}`);

  const columnDefs = useMemo(() => {
    const configured = Array.isArray(widgetConfig.columns) ? widgetConfig.columns : [];
    const map = new Map();
    for (const column of configured) {
      if (column && typeof column === "object") {
        const value = String(column.value ?? column.label ?? "");
        if (value) map.set(value, { value, label: column.label || titleCase(value), color: column.color || "", wip: Number(column.wip) || 0 });
      } else if (column) {
        map.set(String(column), { value: String(column), label: titleCase(column), color: "", wip: 0 });
      }
    }
    for (const row of allRows) {
      const value = String(row?.[groupBy] ?? "unassigned");
      if (!map.has(value)) map.set(value, { value, label: titleCase(value), color: "", wip: 0 });
    }
    return Array.from(map.values());
  }, [allRows, groupBy, widgetConfig.columns]);

  const laneValues = useMemo(() => {
    if (!swimlaneKey) return [""];
    return Array.from(new Set(allRows.map((row) => String(row?.[swimlaneKey] ?? "Unassigned"))));
  }, [allRows, swimlaneKey]);

  useEffect(() => {
    if (!savedFiltersEnabled || typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(savedFiltersKey);
      const parsed = raw ? JSON.parse(raw) : [];
      setSavedFilters(Array.isArray(parsed) ? parsed : []);
    } catch {
      setSavedFilters([]);
    }
  }, [savedFiltersEnabled, savedFiltersKey]);

  const persistFilters = (next) => {
    setSavedFilters(next);
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(savedFiltersKey, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const filteredRows = useMemo(() => {
    return allRows.filter((row) => {
      if (laneFilter && swimlaneKey && String(row?.[swimlaneKey] ?? "Unassigned") !== laneFilter) return false;
      if (!search.trim()) return true;
      return JSON.stringify(row).toLowerCase().includes(search.toLowerCase());
    });
  }, [allRows, search, laneFilter, swimlaneKey]);

  const grouped = useMemo(() => {
    const map = new Map(columnDefs.map((column) => [column.value, []]));
    for (const row of filteredRows) {
      const id = cardId(row, 0);
      const key = String(moves[id] ?? row?.[groupBy] ?? "unassigned");
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(row);
    }
    return map;
  }, [filteredRows, groupBy, columnDefs, moves]);

  const moveCard = (card, id, from, to) => {
    if (!to || to === from) return;
    setMoves((prev) => ({ ...prev, [id]: to }));
    setDetailCard((current) => (current && cardId(current, 0) === id ? { ...current, [groupBy]: to } : current));
    fireWidgetEvent?.("onCardMove", { card, id, from, to });
  };

  const handleDrop = (columnValue, laneKey) => {
    if (!allowDrag || !dragData) return;
    moveCard(dragData.card, dragData.id, dragData.from, columnValue);
    setDragData(null);
    setOverColumn(null);
  };

  const submitQuickAdd = (columnValue) => {
    const title = quickAddTitle.trim();
    if (!title) return;
    const card = {
      id: `local-${Date.now()}`,
      [titleKey]: title,
      [groupBy]: columnValue,
      ...(swimlaneKey && laneFilter ? { [swimlaneKey]: laneFilter } : {}),
      __local: true,
    };
    setCreatedCards((prev) => [...prev, card]);
    fireWidgetEvent?.("onCardCreate", { card, column: columnValue, title });
    setQuickAddTitle("");
  };

  const openDetail = (card, columnValue) => {
    if (!detailDrawer) return;
    setDetailCard(card);
    if (setWidgetState) setWidgetState((prev) => ({ ...prev, selectedCard: card }));
    fireWidgetEvent?.("onCardSelect", { card, group: columnValue });
  };

  const saveFilter = () => {
    const name = savedFilterName.trim();
    if (!name) return;
    const next = [...savedFilters.filter((item) => item.name !== name), { id: `filter_${Date.now()}`, name, search, lane: laneFilter }];
    persistFilters(next);
    setSavedFilterName("");
  };

  const applyFilter = (id) => {
    if (!id) {
      setSearch("");
      setLaneFilter("");
      return;
    }
    const filter = savedFilters.find((item) => item.id === id);
    if (!filter) return;
    setSearch(filter.search || "");
    setLaneFilter(filter.lane || "");
  };

  const moveByKeyboard = (card, id, from, direction) => {
    const index = columnDefs.findIndex((column) => column.value === from);
    const next = columnDefs[index + direction];
    if (next) moveCard(card, id, from, next.value);
  };

  const renderCard = (card, columnValue, index) => {
    const id = cardId(card, index);
    const isSelected = selected && (selected.id ?? selected[titleKey]) === (card.id ?? card[titleKey]);
    return (
      <button
        key={id}
        type="button"
        draggable={allowDrag}
        onDragStart={() => setDragData({ card, id, from: columnValue })}
        onDragEnd={() => {
          setDragData(null);
          setOverColumn(null);
        }}
        onClick={() => {
          if (setWidgetState) setWidgetState((prev) => ({ ...prev, selectedCard: card }));
          fireWidgetEvent?.("onCardSelect", { card, group: columnValue });
        }}
        onDoubleClick={() => openDetail(card, columnValue)}
        onKeyDown={(event) => {
          if (event.altKey && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
            event.preventDefault();
            moveByKeyboard(card, id, columnValue, event.key === "ArrowLeft" ? -1 : 1);
          }
          if (event.key === "Enter" && detailDrawer) {
            event.preventDefault();
            openDetail(card, columnValue);
          }
        }}
        aria-pressed={!!isSelected}
        className={cn(
          "w-full rounded-control border bg-background text-left shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
          compact ? "p-1.5" : "p-2",
          isSelected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
          allowDrag && "cursor-grab active:cursor-grabbing"
        )}
      >
        <div className="flex items-start justify-between gap-1.5">
          <span className="line-clamp-2 text-xs font-semibold text-foreground">{display(card[titleKey])}</span>
          {badgeKey && <span className="max-w-[90px] shrink-0 truncate rounded-full bg-muted px-1.5 py-0.5 text-[9px] uppercase text-muted-foreground">{display(card[badgeKey])}</span>}
        </div>
        {subtitleKey && card[subtitleKey] !== undefined && <p className="mt-0.5 truncate text-[10px] text-muted-foreground">{display(card[subtitleKey])}</p>}
        {swimlaneKey && card[swimlaneKey] !== undefined && <p className="mt-0.5 truncate text-[9px] uppercase tracking-wide text-muted-foreground/80">{display(card[swimlaneKey])}</p>}
        <div className="mt-1 flex items-center justify-between text-[10px] text-muted-foreground">
          {valueKey && card[valueKey] !== undefined ? <span className="font-medium text-foreground">{display(card[valueKey])}</span> : <span />}
          {dateKey && card[dateKey] !== undefined && <span>{display(card[dateKey])}</span>}
        </div>
      </button>
    );
  };

  const renderColumn = (column, cards, laneKey = "") => {
    const isCollapsed = collapsed[`${laneKey}:${column.value}`];
    const overLimit = column.wip > 0 && cards.length > column.wip;
    const dropKey = `${laneKey}:${column.value}`;
    return (
      <section
        key={dropKey}
        aria-label={`${column.label} column${laneKey ? ` in ${laneKey}` : ""}`}
        onDragOver={(event) => {
          if (!allowDrag) return;
          event.preventDefault();
          setOverColumn(dropKey);
        }}
        onDragLeave={() => setOverColumn(null)}
        onDrop={(event) => {
          event.preventDefault();
          handleDrop(column.value, laneKey);
        }}
        className={cn(
          "flex min-w-[220px] flex-1 flex-col rounded-card border bg-muted/20 transition-colors",
          overColumn === dropKey ? "border-primary/60 bg-primary/5" : "border-border",
          isCollapsed && "max-w-[72px]"
        )}
      >
        <header className="flex items-center justify-between gap-1 border-b border-border/70 px-2 py-1.5">
          <button
            type="button"
            onClick={() => collapsible && setCollapsed((prev) => ({ ...prev, [dropKey]: !prev[dropKey] }))}
            className="flex min-w-0 items-center gap-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            aria-expanded={!isCollapsed}
          >
            {collapsible && (isCollapsed ? <ChevronRight className="h-3 w-3 text-muted-foreground" /> : <ChevronDown className="h-3 w-3 text-muted-foreground" />)}
            {column.color && <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: column.color }} aria-hidden="true" />}
            {!isCollapsed && <h3 className="truncate text-[11px] font-semibold uppercase tracking-wide text-foreground">{column.label}</h3>}
          </button>
          {showCounts && (
            <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] tabular-nums", overLimit ? "bg-destructive/10 text-destructive" : "bg-background text-muted-foreground")}>
              {cards.length}{column.wip ? `/${column.wip}` : ""}
            </span>
          )}
        </header>
        {!isCollapsed && (
          <div className="flex flex-1 flex-col gap-1.5 overflow-y-auto p-1.5">
            {cards.length === 0 && <p className="px-1 py-3 text-[10px] text-muted-foreground">No cards</p>}
            {cards.map((card, index) => renderCard(card, column.value, index))}
            {quickAdd && (
              <div className="mt-auto pt-1">
                {quickAddColumn === dropKey ? (
                  <div className="space-y-1 rounded-control border border-border bg-background p-1.5">
                    <Input
                      autoFocus
                      value={quickAddTitle}
                      onChange={(event) => setQuickAddTitle(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          submitQuickAdd(column.value);
                        }
                        if (event.key === "Escape") {
                          setQuickAddColumn("");
                          setQuickAddTitle("");
                        }
                      }}
                      placeholder="Card title"
                      aria-label={`New card in ${column.label}`}
                      className="h-7 text-xs"
                    />
                    <div className="flex justify-end gap-1">
                      <Button type="button" variant="ghost" size="sm" className="h-6 px-1.5 text-[10px]" onClick={() => { setQuickAddColumn(""); setQuickAddTitle(""); }}>Cancel</Button>
                      <Button type="button" size="sm" className="h-6 px-1.5 text-[10px]" onClick={() => submitQuickAdd(column.value)} disabled={!quickAddTitle.trim()}>Add</Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setQuickAddColumn(dropKey);
                      setQuickAddTitle("");
                    }}
                    className="flex w-full items-center justify-center gap-1 rounded-control border border-dashed border-border px-2 py-1.5 text-[10px] text-muted-foreground hover:border-primary/40 hover:bg-muted/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                  >
                    <Plus className="h-3 w-3" /> Add card
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    );
  };

  if (isLoading) {
    return (
      <WidgetSurface density={density} className="flex h-full w-full gap-2 overflow-x-auto">
        {[0, 1, 2].map((index) => (
          <div key={index} className="flex min-w-[220px] flex-1 flex-col gap-1.5 rounded-card border border-border bg-muted/20 p-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ))}
      </WidgetSurface>
    );
  }

  return (
    <WidgetSurface density={density} className="relative flex h-full w-full flex-col overflow-hidden">
      {(searchable || savedFiltersEnabled) && (
        <div className="shrink-0 space-y-1 border-b border-border p-2">
          {searchable && (
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" aria-hidden="true" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter cards…" aria-label="Filter cards" className="h-7 pl-8 text-xs" />
            </div>
          )}
          {savedFiltersEnabled && (
            <div className="flex items-center gap-1">
              <Select value={laneFilter ? `lane:${laneFilter}` : "__all"} onValueChange={(value) => setLaneFilter(value.startsWith("lane:") ? value.slice(5) : "")}>
                <SelectTrigger className="h-6 w-32 text-[10px]" aria-label="Filter by swimlane">
                  <SelectValue placeholder="All lanes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all">All lanes</SelectItem>
                  {laneValues.filter(Boolean).map((lane) => <SelectItem key={lane} value={`lane:${lane}`}>{lane}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value="__saved" onValueChange={applyFilter}>
                <SelectTrigger className="h-6 w-32 text-[10px]" aria-label="Saved filters">
                  <SelectValue placeholder="Saved filters" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__saved">Saved filters</SelectItem>
                  {savedFilters.map((filter) => <SelectItem key={filter.id} value={filter.id}>{filter.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <Input
                value={savedFilterName}
                onChange={(event) => setSavedFilterName(event.target.value)}
                onKeyDown={(event) => { if (event.key === "Enter") saveFilter(); }}
                placeholder="Filter name"
                aria-label="Saved filter name"
                className="h-6 w-24 text-[10px]"
              />
              <Button type="button" variant="outline" size="sm" className="h-6 px-1.5 text-[10px]" onClick={saveFilter} disabled={!savedFilterName.trim()}>Save</Button>
            </div>
          )}
        </div>
      )}
      {rows.length === 0 ? (
        <WidgetEmpty title={emptyText} />
      ) : swimlaneKey ? (
        <div className="min-h-0 flex-1 space-y-3 overflow-y-auto p-1">
          {laneValues
            .filter((lane) => !laneFilter || lane === laneFilter)
            .map((lane) => (
              <section key={lane || "__lane"} aria-label={`Lane ${lane || "Unassigned"}`}>
                <div className="mb-1 flex items-center justify-between px-1">
                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{lane || "Unassigned"}</h3>
                  <span className="text-[10px] text-muted-foreground">{filteredRows.filter((row) => String(row?.[swimlaneKey] ?? "Unassigned") === lane).length}</span>
                </div>
                <div className="flex gap-2 overflow-x-auto">
                  {columnDefs.map((column) => {
                    const cards = (grouped.get(column.value) || []).filter((card) => String(card?.[swimlaneKey] ?? "Unassigned") === lane);
                    return renderColumn(column, cards, lane);
                  })}
                </div>
              </section>
            ))}
        </div>
      ) : (
        <div className="flex min-h-0 flex-1 gap-2 overflow-x-auto p-1">
          {columnDefs.map((column) => renderColumn(column, grouped.get(column.value) || []))}
        </div>
      )}

      {detailDrawer && (
        <Dialog open={!!detailCard} onOpenChange={(open) => { if (!open) setDetailCard(null); }}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="pr-6">{detailCard ? display(detailCard[titleKey]) : "Card details"}</DialogTitle>
            </DialogHeader>
            {detailCard && (
              <div className="space-y-3">
                <dl className="grid max-h-[50vh] gap-x-4 gap-y-2 overflow-y-auto sm:grid-cols-2">
                  {Object.entries(detailCard).filter(([key]) => !key.startsWith("__")).map(([key, value]) => (
                    <div key={key} className="min-w-0">
                      <dt className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground">{key.replace(/_/g, " ")}</dt>
                      <dd className="truncate text-xs text-foreground">{display(value)}</dd>
                    </div>
                  ))}
                </dl>
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-2">
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px]"
                      onClick={() => moveByKeyboard(detailCard, cardId(detailCard, 0), String(detailCard[groupBy] ?? "unassigned"), -1)}
                    >
                      <ChevronLeft className="mr-1 h-3 w-3" /> Move left
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px]"
                      onClick={() => moveByKeyboard(detailCard, cardId(detailCard, 0), String(detailCard[groupBy] ?? "unassigned"), 1)}
                    >
                      Move right <ChevronRight className="ml-1 h-3 w-3" />
                    </Button>
                  </div>
                  <Button type="button" variant="ghost" size="sm" className="h-7 text-[11px]" onClick={() => setDetailCard(null)}>
                    <X className="mr-1 h-3 w-3" /> Close
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </WidgetSurface>
  );
}

KanbanWidget.propTypes = {
  widgetConfig: PropTypes.object,
  widgetID: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  data: PropTypes.array,
  widgetState: PropTypes.object,
  setWidgetState: PropTypes.func,
  fireWidgetEvent: PropTypes.func,
};

export default KanbanWidget;

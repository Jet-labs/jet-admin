import React, { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { ChevronRight, Search } from "lucide-react";
import { Input, Skeleton, WidgetEmpty, WidgetSurface, cn } from "@jet-admin/ui";
import { normalizeFieldBoolean } from "../_shared/fieldContracts";

export const ListWidget = ({ widgetConfig, fireWidgetEvent, widgetState, setWidgetState }) => {
  const emptyText = widgetConfig?.emptyText || "No items";
  const noResultsText = widgetConfig?.noResultsText || "No matching items";
  const layout = widgetConfig?.layout || "rows";
  const searchable = normalizeFieldBoolean(widgetConfig?.searchable, false);
  const dividers = widgetConfig?.dividers !== false;
  const titleKey = widgetConfig?.titleKey || "title";
  const subtitleKey = widgetConfig?.subtitleKey || "subtitle";
  const avatarKey = widgetConfig?.avatarKey || "";
  const itemKey = widgetConfig?.itemKey || "id";
  const groupKey = widgetConfig?.groupKey || "";
  const metaKeys = Array.isArray(widgetConfig?.metaKeys) ? widgetConfig.metaKeys : [];
  const isLoading = normalizeFieldBoolean(widgetConfig?.isLoading, false);
  const density = widgetConfig?.properties?.density || "comfortable";
  const [filter, setFilter] = useState("");

  const items = useMemo(() => {
    const template = widgetConfig?.dataTemplate;
    if (Array.isArray(template)) return template;
    if (Array.isArray(widgetConfig?.items)) return widgetConfig.items;
    return [];
  }, [widgetConfig?.dataTemplate, widgetConfig?.items]);

  const visible = useMemo(() => {
    if (!filter) return items;
    const term = filter.toLowerCase();
    return items.filter((item) => JSON.stringify(item).toLowerCase().includes(term));
  }, [items, filter]);

  const groups = useMemo(() => {
    if (!groupKey) return [["", visible]];
    const map = new Map();
    for (const item of visible) {
      const key = String(item?.[groupKey] ?? "Ungrouped");
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    }
    return Array.from(map.entries());
  }, [visible, groupKey]);

  const selectedId = widgetState?.selectedItemId;
  const handleClick = (item, index) => {
    const id = item?.[itemKey] ?? index;
    if (setWidgetState) setWidgetState((prev) => ({ ...prev, selectedItemId: id, selectedItem: item }));
    if (fireWidgetEvent) fireWidgetEvent("onItemClick", { item, index, id });
  };

  if (isLoading) {
    return (
      <WidgetSurface density={density} className="flex h-full w-full flex-col gap-2">
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </WidgetSurface>
    );
  }

  return (
    <WidgetSurface density={density} className="flex h-full w-full min-h-0 flex-col gap-0">
      {searchable && (
        <div className="shrink-0 border-b border-border p-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/60" aria-hidden="true" />
            <Input value={filter} onChange={(event) => setFilter(event.target.value)} placeholder="Filter…" aria-label="Filter items" className="h-7 pl-8 text-xs" />
          </div>
        </div>
      )}
      <div className={cn("min-h-0 flex-1 overflow-auto", layout === "cards" ? "grid grid-cols-1 content-start gap-2 sm:grid-cols-2" : "flex flex-col")}>
        {items.length === 0 && <WidgetEmpty title={emptyText} />}
        {items.length > 0 && visible.length === 0 && <WidgetEmpty title={noResultsText} description="Try a different filter." />}
        {groups.map(([group, groupItems]) => (
          <div key={group || "__ungrouped"} className="min-w-0">
            {group && <p className="px-1 py-1 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">{group}</p>}
            {groupItems.map((item, index) => {
              const id = item?.[itemKey] ?? index;
              const selected = selectedId !== undefined ? String(selectedId) === String(id) : false;
              const title = item?.[titleKey] ?? item?.name ?? item?.title ?? `Item ${index + 1}`;
              const subtitle = item?.[subtitleKey] ?? item?.description ?? "";
              const avatar = avatarKey ? item?.[avatarKey] : null;
              return (
                <button
                  key={String(id)}
                  type="button"
                  onClick={() => handleClick(item, index)}
                  aria-pressed={selected}
                  className={cn(
                    "w-full min-w-0 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary/40",
                    layout === "cards" ? "rounded-card border p-2" : "px-2 py-1.5",
                    dividers && layout !== "cards" && "border-b border-border/60 last:border-b-0",
                    selected ? "border-primary bg-primary/5" : "border-border bg-card hover:bg-muted/30"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {avatar && <img src={String(avatar)} alt="" className="h-7 w-7 shrink-0 rounded-full border border-border object-cover" />}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-medium text-foreground">{String(title)}</span>
                      {subtitle && <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">{String(subtitle)}</span>}
                    </span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </div>
                  {metaKeys.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {metaKeys.map((key) => (
                        <span key={key} className="max-w-full truncate rounded-control border border-border bg-muted/50 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground">
                          {key}: {String(item?.[key] ?? "—")}
                        </span>
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </WidgetSurface>
  );
};

ListWidget.propTypes = {
  widgetConfig: PropTypes.object,
  fireWidgetEvent: PropTypes.func,
  widgetState: PropTypes.object,
  setWidgetState: PropTypes.func,
};

export default ListWidget;

import { WIDGETS_MAP } from "@jet-admin/widgets-ui";
import {
  ExternalLink,
  GripVertical,
  Plus,
  Edit2,
  Search,
  Grid2X2,
  Box,
  Rows,
  Layers,
  LayoutTemplate,
  Star,
  Clock,
} from 'lucide-react';
import PropTypes from "prop-types";
import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CONSTANTS } from "../../../../constants";
import { useEntityItems } from "../../../../logic/hooks/useEntityItems";
import { WidgetSelectionTree } from "./widgetSelectionTree";
import { NoEntityUI } from "../../ui/noEntityUI";
import { ReactQueryLoadingErrorWrapper } from "../../ui/reactQueryLoadingErrorWrapper";
import { Button, Input } from "@jet-admin/ui";
import { WidgetIdeModal } from "./widgetIdeModal";
import { useDebounce } from "@uidotdev/usehooks";
import { createWidgetInstanceKey, parseWidgetKey } from "./appPageLayoutUtils";
import { getWidgetDisplayName, isInternalEntityName } from "../../../../utils/widgetDisplay";
import { beginCanvasDrag } from "../layout/editor/canvasDragStore";
import { SECTION_TEMPLATES } from "../layout/editor/sectionTemplates";

const readStoredList = (key) => {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const AppPageWidgetList = ({
  tenantID,
  placedWidgets,
  onAddWidget,
  appPageEditorForm,
}) => {
  const favoritesKey = `jet-admin:widget-palette:favorites:${tenantID}`;
  const recentsKey = `jet-admin:widget-palette:recents:${tenantID}`;
  const [isIdeOpen, setIsIdeOpen] = useState(false);
  const [selectedWidgetID, setSelectedWidgetID] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [favoriteIDs, setFavoriteIDs] = useState(() => readStoredList(favoritesKey));
  const [recentIDs, setRecentIDs] = useState(() => readStoredList(recentsKey));
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const persistFavorites = (next) => {
    setFavoriteIDs(next);
    try {
      window.localStorage.setItem(favoritesKey, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  };

  const persistRecents = (next) => {
    setRecentIDs(next);
    try {
      window.localStorage.setItem(recentsKey, JSON.stringify(next));
    } catch {
      /* storage unavailable */
    }
  };

  const toggleFavorite = (widgetID) => {
    const exists = favoriteIDs.includes(widgetID);
    persistFavorites(
      exists
        ? favoriteIDs.filter((id) => id !== widgetID)
        : [widgetID, ...favoriteIDs]
    );
  };

  const recordRecent = (widgetID) => {
    const next = [widgetID, ...recentIDs.filter((id) => id !== widgetID)].slice(0, 6);
    persistRecents(next);
  };

  const {
    items: widgets,
    isLoading: isLoadingWidgets,
    error: loadWidgetsError,
  } = useEntityItems({
    tenantID,
    entityType: "widget",
    search: debouncedSearchQuery,
  });

  const _handleWidgetDragStart = (event, widget, displayName) => {
    if (event.target?.closest?.("button, a, input, textarea, select")) return;
    recordRecent(widget.widgetID);
    // Extract the widget ID and create a unique instance key
    const widgetKey = `widget_${widget.widgetID}`;
    const widgetID = parseWidgetKey(widgetKey);
    const instanceKey = createWidgetInstanceKey(widgetID, placedWidgets || []);
    beginCanvasDrag({
      payload: { kind: "widget", widgetKey: instanceKey },
      label: displayName || "Widget",
      event,
    });
  };

  const _handleLayoutDragStart = (event, type, label) => {
    beginCanvasDrag({
      payload: { kind: "layout", layoutType: type },
      label: label || `${type.toUpperCase()} layout`,
      event,
    });
  };

  const _handleTemplateDragStart = (event, template) => {
    beginCanvasDrag({
      payload: { kind: "template", templateId: template.id },
      label: template.label,
      event,
    });
  };

  const _handleSnippetDragStart = (event, snippet) => {
    beginCanvasDrag({
      payload: { kind: "snippet", tree: snippet.tree },
      label: snippet.label,
      event,
    });
  };

  const _insertTemplate = (template) => {
    window.dispatchEvent(
      new CustomEvent("craft-insert-template", {
        detail: { templateId: template.id },
      })
    );
  };

  const _insertSnippet = (snippet) => {
    window.dispatchEvent(
      new CustomEvent("craft-insert-snippet", {
        detail: { tree: snippet.tree },
      })
    );
  };

  const snippetWidgets = useMemo(
    () => (widgets || []).filter((widget) => widget.widgetType === "layout-snippet"),
    [widgets]
  );
  const widgetItems = useMemo(
    () => (widgets || []).filter((widget) => widget.widgetType !== "layout-snippet"),
    [widgets]
  );
  const userSnippets = useMemo(
    () =>
      snippetWidgets
        .map((widget) => ({
          id: widget.widgetID,
          label: widget.widgetTitle || "Saved section",
          description:
            widget.widgetDescription ||
            widget.widgetConfig?.snippet?.description ||
            "Saved section",
          tree: widget.widgetConfig?.snippet?.layout || null,
          isUser: true,
        }))
        .filter((snippet) => snippet.tree),
    [snippetWidgets]
  );
  const sectionSnippets = useMemo(
    () => [
      ...SECTION_TEMPLATES.map((template) => ({ ...template, isUser: false })),
      ...userSnippets,
    ],
    [userSnippets]
  );

  const widgetCategories = useMemo(() => {
    const counts = new Map();
    widgetItems.forEach((widget) => {
      const type = widget.widgetType || "custom";
      counts.set(type, (counts.get(type) || 0) + 1);
    });
    return Array.from(counts.entries())
      .map(([type, count]) => ({
        type,
        count,
        label: WIDGETS_MAP[type]?.label || type,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [widgetItems]);

  const visibleWidgets = useMemo(() => {
    if (!category || category === "all") return widgetItems;
    if (category === "favorites") {
      return widgetItems.filter((widget) => favoriteIDs.includes(widget.widgetID));
    }
    return widgetItems.filter((widget) => widget.widgetType === category);
  }, [widgetItems, category, favoriteIDs]);

  const widgetsByID = useMemo(() => {
    const map = new Map();
    widgetItems.forEach((widget) => map.set(widget.widgetID, widget));
    return map;
  }, [widgetItems]);

  const recentWidgets = useMemo(
    () => recentIDs.map((id) => widgetsByID.get(id)).filter(Boolean),
    [recentIDs, widgetsByID]
  );

  const _renderWidgetIcon = (widgetType) => {
    const widgetConfig = WIDGETS_MAP[widgetType];
    if (!widgetConfig || !widgetConfig.icon) {
      return (
        <span className="text-xs text-muted-foreground select-none shrink-0">
          📊
        </span>
      );
    }

    return widgetConfig.icon({
      className: "h-3.5 w-3.5 text-foreground shrink-0",
    });
  };

  const _renderWidgetEditIcon = (widgetID) => {
    return (
      <Button
        type="button"
        variant="ghost"
        size="sm"
        square
        className="shrink-0 text-muted-foreground hover:text-foreground"
        onClick={() => {
          setSelectedWidgetID(widgetID);
          setIsIdeOpen(true);
        }}
      >
        <Edit2 className="h-4 w-4" />
      </Button>
    );
  };

  const _renderWidgetLinkIcon = (widgetID) => {
    return (
      <Button
        asChild
        type="button"
        variant="ghost"
        size="sm"
        square
        className="shrink-0 text-muted-foreground hover:text-foreground"
      >
        <Link
          to={CONSTANTS.ROUTES.UPDATE_WIDGET_BY_ID.path(tenantID, widgetID)}
          target="_blank"
        >
          <ExternalLink className="h-4 w-4" />
        </Link>
      </Button>
    );
  };

  const _renderWidgetCard = (widget) => {
    const key = `widget_${widget.widgetID}`;
    const widgetLabel = WIDGETS_MAP[widget.widgetType]?.label || widget.widgetType;
    const widgetDesc = WIDGETS_MAP[widget.widgetType]?.description || "Custom component";
    const displayName = getWidgetDisplayName({
      widgetTitle: widget.widgetTitle,
      widgetTypeLabel: widgetLabel,
    });
    const titleIsInternal = isInternalEntityName(widget.widgetTitle);
    const isFavorite = favoriteIDs.includes(widget.widgetID);

    return (
      <div
        key={key}
        id={key}
        className="flex items-center justify-between gap-2 rounded border border-border bg-card p-2 shadow-sm hover:border-border/80 transition-all duration-200 group"
      >
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <div
            onPointerDown={(event) => _handleWidgetDragStart(event, widget, displayName)}
            className="cursor-grab text-muted-foreground/30 hover:text-foreground active:cursor-grabbing shrink-0"
            style={{ touchAction: "none" }}
            title={`Drag ${displayName} onto the canvas`}
          >
            <GripVertical className="h-4 w-4" />
          </div>

          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-muted border border-border/50 shadow-inner">
            {_renderWidgetIcon(widget.widgetType)}
          </div>

          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium text-foreground">
              {displayName}
            </span>
            <div className="flex items-center gap-2">
              {!titleIsInternal && (
                <>
                  <span className="shrink-0 font-mono text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                    {widgetLabel}
                  </span>
                  <span className="shrink-0 select-none text-[9px] text-muted-foreground/30">•</span>
                </>
              )}
              <span className="truncate text-[9px] text-muted-foreground">
                {widgetDesc}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              toggleFavorite(widget.widgetID);
            }}
            className={`rounded p-1 transition-colors ${
              isFavorite
                ? "text-amber-400"
                : "text-muted-foreground/40 hover:text-amber-400"
            }`}
            title={isFavorite ? "Remove from favorites" : "Add to favorites"}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Star className={`h-3.5 w-3.5 ${isFavorite ? "fill-current" : ""}`} />
          </button>
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
            {_renderWidgetEditIcon(widget.widgetID)}
            {_renderWidgetLinkIcon(widget.widgetID)}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-2 bg-background overflow-hidden">
      <div className="flex items-center justify-between p-2 pb-0">
        <span className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          {CONSTANTS.STRINGS.APP_PAGE_WIDGET_LIST_WIDGETS_TITLE}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-2 border-border/50 font-medium"
          onClick={() => {
            setSelectedWidgetID(null);
            setIsIdeOpen(true);
          }}
        >
          <Plus className="h-3.5 w-3.5 text-primary" />
          Create widget
        </Button>
      </div>

      <div className="px-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50 z-10" />
          <Input
            type="text"
            size="sm"
            placeholder="Search widgets..."
            className="pl-8 w-full border-border/50 focus:border-primary/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {!searchQuery && (widgetCategories.length > 1 || favoriteIDs.length > 0) && (
        <div className="flex gap-1 overflow-x-auto px-2 pb-1">
          <button
            type="button"
            onClick={() => setCategory("all")}
            className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-medium transition-colors ${
              category === "all"
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-background text-muted-foreground hover:text-foreground"
            }`}
          >
            All
          </button>
          {favoriteIDs.length > 0 && (
            <button
              type="button"
              onClick={() => setCategory("favorites")}
              className={`flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-medium transition-colors ${
                category === "favorites"
                  ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              <Star className="h-2.5 w-2.5 fill-current" />
              Favorites
            </button>
          )}
          {widgetCategories.map((item) => (
            <button
              key={item.type}
              type="button"
              onClick={() => setCategory(item.type)}
              className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-medium transition-colors ${
                category === item.type
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label} · {item.count}
            </button>
          ))}
        </div>
      )}

      {!searchQuery && recentWidgets.length > 0 && (
        <div className="flex flex-col gap-1 px-2 pb-1">
          <span className="flex items-center gap-1 font-mono text-[8px] font-semibold uppercase tracking-wider text-muted-foreground/60">
            <Clock className="h-2.5 w-2.5" /> Recent
          </span>
          <div className="flex flex-wrap gap-1">
            {recentWidgets.map((widget) => {
              const widgetLabel = WIDGETS_MAP[widget.widgetType]?.label || widget.widgetType;
              const displayName = getWidgetDisplayName({
                widgetTitle: widget.widgetTitle,
                widgetTypeLabel: widgetLabel,
              });
              return (
                <div
                  key={widget.widgetID}
                  onPointerDown={(event) =>
                    _handleWidgetDragStart(event, widget, displayName)
                  }
                  className="flex max-w-[130px] cursor-grab items-center gap-1 rounded border border-border/60 bg-card px-1.5 py-0.5 text-[9px] text-muted-foreground hover:border-primary/40 hover:text-foreground active:cursor-grabbing"
                  style={{ touchAction: "none" }}
                  title={`Drag ${displayName} onto the canvas`}
                >
                  <GripVertical className="h-2.5 w-2.5 shrink-0 opacity-40" />
                  <span className="truncate">{displayName}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!searchQuery && (
        <div className="flex flex-col gap-1.5 border-b border-border/30 px-2 pb-2">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60">
              Section snippets
            </span>
            <span className="flex items-center gap-1 text-[8px] text-muted-foreground/50">
              {userSnippets.length > 0 ? `${userSnippets.length} saved` : "built-in + saved"}
              <LayoutTemplate className="h-3 w-3" />
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {sectionSnippets.map((snippet) => (
              <div
                key={`${snippet.isUser ? "saved" : "builtin"}-${snippet.id}`}
                onPointerDown={(event) =>
                  snippet.isUser
                    ? _handleSnippetDragStart(event, snippet)
                    : _handleTemplateDragStart(event, snippet)
                }
                className="group relative flex cursor-grab flex-col gap-0.5 rounded border border-border/60 bg-card/70 p-1.5 pr-6 hover:border-primary/50 hover:bg-muted/10 active:cursor-grabbing"
                style={{ touchAction: "none" }}
                title={`${snippet.description} — drag onto the canvas or click + to insert`}
              >
                <span className="truncate text-[10px] font-semibold text-foreground">
                  {snippet.label}
                  {snippet.isUser && (
                    <span className="ml-1 rounded bg-primary/10 px-1 py-0.5 text-[7px] font-medium uppercase tracking-wider text-primary">
                      saved
                    </span>
                  )}
                </span>
                <span className="line-clamp-2 text-[8px] leading-tight text-muted-foreground">
                  {snippet.description}
                </span>
                <button
                  type="button"
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={() =>
                    snippet.isUser
                      ? _insertSnippet(snippet)
                      : _insertTemplate(snippet)
                  }
                  className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded border border-border/60 bg-background text-muted-foreground opacity-0 transition-opacity hover:text-primary group-hover:opacity-100"
                  title={`Insert ${snippet.label}`}
                  aria-label={`Insert ${snippet.label}`}
                >
                  <Plus className="h-2.5 w-2.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex w-full min-h-0 flex-1 flex-col gap-2 p-2 pt-0">
        {(() => {
          const layoutItems = [
            { type: "row", label: "Grid Row", desc: "12-column grid row", icon: <Grid2X2 className="h-4 w-4 text-muted-foreground" /> },
            { type: "container", label: "Container", desc: "Styled grouping card", icon: <Box className="h-4 w-4 text-muted-foreground" /> },
            { type: "stack", label: "Flex Stack", desc: "Align components vertically/horizontally", icon: <Rows className="h-4 w-4 text-muted-foreground" /> },
            { type: "z-stack", label: "Z-Stack Layer", desc: "Overlap elements on top of each other", icon: <Layers className="h-4 w-4 text-muted-foreground" /> }
          ];

          const filtered = layoutItems.filter(item =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.desc.toLowerCase().includes(searchQuery.toLowerCase())
          );

          if (filtered.length === 0) return null;

          return (
            <div className="flex flex-col gap-2 pb-2 border-b border-border/30">
              <span className="font-mono text-[9px] font-semibold uppercase tracking-wider text-muted-foreground/60 p-0">
                Layout Elements
              </span>
              <div className="grid grid-cols-2 gap-2">
                {filtered.map((layoutItem) => (
                  <div
                    key={layoutItem.type}
                    onPointerDown={(event) => _handleLayoutDragStart(event, layoutItem.type, layoutItem.label)}
                    className="flex items-center gap-2 rounded border border-border/60 bg-card/65 p-2 shadow-sm hover:border-primary/50 cursor-grab active:cursor-grabbing hover:bg-muted/10 transition-all select-none"
                    style={{ touchAction: "none" }}
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded bg-muted/50 border border-border/30">
                      {layoutItem.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="truncate text-[11px] font-semibold text-foreground block">
                        {layoutItem.label}
                      </span>
                      <span className="text-[8px] text-muted-foreground truncate block">
                        {layoutItem.desc}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        <ReactQueryLoadingErrorWrapper
          isLoading={isLoadingWidgets}
          error={loadWidgetsError}
        >
          {debouncedSearchQuery ? (
            visibleWidgets.length > 0 ? (
              <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-2">
                {visibleWidgets.map((widget) =>
                  _renderWidgetCard(widget)
                )}
              </div>
            ) : (
              <div className="flex flex-1 items-center justify-center">
                <NoEntityUI message="No matching widgets found" />
              </div>
            )
          ) : visibleWidgets.length > 0 ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pb-2">
              <WidgetSelectionTree
                tenantID={tenantID}
                entityType="widget"
                items={visibleWidgets}
                renderItemRow={(widget) => _renderWidgetCard(widget)}
                onItemDragStart={(e, widget) => {
                  const widgetLabel = WIDGETS_MAP[widget.widgetType]?.label || widget.widgetType;
                  const displayName = getWidgetDisplayName({
                    widgetTitle: widget.widgetTitle,
                    widgetTypeLabel: widgetLabel,
                  });
                  _handleWidgetDragStart(e, widget, displayName);
                }}
              />
            </div>
          ) : category === "favorites" ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-1 p-3 text-center">
              <Star className="h-5 w-5 text-muted-foreground/30" />
              <span className="text-[10px] text-muted-foreground">
                Star widgets to keep them here.
              </span>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center">
              <NoEntityUI
                message={
                  category !== "all"
                    ? "No widgets in this category"
                    : CONSTANTS.STRINGS.WIDGET_DRAWER_LIST_NO_WIDGET
                }
              />
            </div>
          )}
        </ReactQueryLoadingErrorWrapper>
      </div>

      <WidgetIdeModal
        isOpen={isIdeOpen}
        onClose={() => setIsIdeOpen(false)}
        tenantID={tenantID}
        widgetID={selectedWidgetID}
        appPageEditorForm={appPageEditorForm}
        onAddWidget={onAddWidget}
      />
    </div>
  );
};

AppPageWidgetList.propTypes = {
  tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  placedWidgets: PropTypes.array,
  onAddWidget: PropTypes.func,
  appPageEditorForm: PropTypes.object.isRequired,
};

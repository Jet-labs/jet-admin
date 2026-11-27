import React, { useEffect, useRef } from "react";
import {
  Check,
  Copy,
  MoreHorizontal,
  Redo2,
  RotateCcw,
  Search,
  Trash2,
  Undo2,
} from "lucide-react";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
  cn,
} from "@jet-admin/ui";
import {
  ConfigEditorProvider,
  useConfigEditor,
} from "./configEditorContext";

const TABS = [
  { value: "content", label: "Content" },
  { value: "style", label: "Style" },
  { value: "behavior", label: "Behavior" },
  { value: "advanced", label: "Advanced" },
];

const ShellInner = ({
  widgetLabel,
  widgetIcon: WidgetIcon,
  widgetID,
  slots = {},
  children,
  onDuplicate,
  onDelete,
  headerActions,
  allowEmptySearchState = true,
}) => {
  const context = useConfigEditor();
  const {
    widgetEditorForm,
    activeTab,
    setActiveTab,
    query,
    setQuery,
    showChanged,
    setShowChanged,
    changedCount,
    visibleFields,
    undo,
    redo,
    canUndo,
    canRedo,
    resetTab,
  } = context;
  const searchRef = useRef(null);
  const menuStatusTimeout = useRef(null);
  const [menuStatus, setMenuStatus] = React.useState("");

  useEffect(() => {
    const handleKeyDown = (event) => {
      const target = event.target;
      const editable =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable ||
          target.closest?.(".cm-editor"));

      if (event.key === "/" && !editable && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        searchRef.current?.focus();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && !editable && event.key.toLowerCase() === "z") {
        event.preventDefault();
        if (event.shiftKey) redo();
        else undo();
      }
    };
    const node = searchRef.current?.closest(".config-shell");
    node?.addEventListener("keydown", handleKeyDown);
    return () => {
      node?.removeEventListener("keydown", handleKeyDown);
      if (menuStatusTimeout.current) clearTimeout(menuStatusTimeout.current);
    };
  }, [undo, redo]);

  const flashStatus = (message) => {
    setMenuStatus(message);
    if (menuStatusTimeout.current) clearTimeout(menuStatusTimeout.current);
    menuStatusTimeout.current = setTimeout(() => setMenuStatus(""), 1800);
  };

  const copyConfig = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(widgetEditorForm.values.widgetConfig || {}, null, 2));
      flashStatus("Config copied");
    } catch {
      flashStatus("Clipboard unavailable");
    }
  };

  const pasteConfig = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const parsed = JSON.parse(text);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
      widgetEditorForm.setFieldValue("widgetConfig", parsed);
      flashStatus("Config pasted");
    } catch {
      flashStatus("Clipboard does not contain widget config");
    }
  };

  const title = widgetEditorForm.values.widgetTitle || "";

  return (
    <div className="config-shell flex w-full flex-col gap-2">
      <header className="rounded-card border border-border bg-card p-2">
        <div className="flex items-start gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control border border-border bg-muted/40 text-primary">
            {WidgetIcon ? <WidgetIcon className="h-4 w-4" /> : <span className="text-xs">W</span>}
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <label htmlFor="widget-config-title" className="sr-only">
              Widget name
            </label>
            <Input
              id="widget-config-title"
              value={title}
              onChange={(event) => widgetEditorForm.setFieldValue("widgetTitle", event.target.value)}
              placeholder={widgetLabel || "Widget name"}
              className="h-8 border-transparent bg-transparent px-1.5 text-sm font-medium hover:border-border focus-visible:border-border"
            />
            <div className="flex items-center gap-1.5">
              <span className="truncate text-[10px] text-muted-foreground">{widgetLabel || "Widget"}</span>
              <span className="text-muted-foreground/50">·</span>
              <button
                type="button"
                onClick={async () => {
                  if (!widgetID) return;
                  try {
                    await navigator.clipboard.writeText(String(widgetID));
                    flashStatus("Widget ID copied");
                  } catch {
                    flashStatus("Clipboard unavailable");
                  }
                }}
                disabled={!widgetID}
                className="inline-flex items-center gap-1 rounded-control border border-border/70 bg-muted/30 px-1.5 py-0.5 font-mono text-[9px] text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:cursor-default"
                title={widgetID ? "Copy widget ID for bindings" : "Widget ID is assigned after saving"}
              >
                <span className="max-w-[120px] truncate">{widgetID || "unsaved"}</span>
                {widgetID ? <Copy className="h-2.5 w-2.5" /> : null}
              </button>
              {menuStatus && <span className="text-[10px] text-primary">{menuStatus}</span>}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {headerActions}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="ghost" size="icon" className="h-7 w-7" aria-label="Widget config actions" title="Widget config actions">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">Config</DropdownMenuLabel>
                <DropdownMenuItem onSelect={copyConfig} className="gap-2 text-xs">
                  <Copy className="h-3.5 w-3.5" /> Copy config
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={pasteConfig} className="gap-2 text-xs">
                  <RotateCcw className="h-3.5 w-3.5" /> Paste config
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() => resetTab(activeTab)}
                  className="gap-2 text-xs"
                  disabled={visibleFields.length === 0}
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset this tab
                </DropdownMenuItem>
                {onDuplicate && (
                  <DropdownMenuItem onSelect={onDuplicate} className="gap-2 text-xs">
                    <Copy className="h-3.5 w-3.5" /> Duplicate widget
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={onDelete} className="gap-2 text-xs text-destructive focus:text-destructive">
                      <Trash2 className="h-3.5 w-3.5" /> Delete widget
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="relative mt-2">
          <Search className="pointer-events-none absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground/60" aria-hidden="true" />
          <Input
            ref={searchRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search settings…  ( / )"
            aria-label="Search widget settings"
            className="h-8 pl-8 text-xs"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-1.5 top-1.5 inline-flex h-5 items-center rounded-control px-1.5 text-[10px] text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              Clear
            </button>
          )}
        </div>
      </header>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="h-auto w-full justify-start gap-1 border-b-0 bg-transparent p-0">
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="h-7 px-2 text-[11px]">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {!query && slots[activeTab] && <div data-config-slot={activeTab}>{slots[activeTab]}</div>}

      <div className="space-y-2">
        {children}
        {query && allowEmptySearchState && visibleFields.length === 0 && (
          <div className="rounded-card border border-dashed border-border bg-muted/20 p-6 text-center">
            <p className="text-xs font-medium text-foreground">No settings match “{query}”</p>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Try a different term or clear the search.</p>
            <Button type="button" variant="outline" size="sm" className="mt-2 h-7 text-[11px]" onClick={() => setQuery("")}>
              Clear search
            </Button>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 z-10 -mx-1 flex items-center justify-between gap-2 border-t border-border bg-background/95 px-2 py-1.5 backdrop-blur">
        <div className="flex items-center gap-1">
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={undo} disabled={!canUndo} aria-label="Undo config change" title="Undo (Ctrl/Cmd+Z)">
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button type="button" variant="ghost" size="icon" className="h-7 w-7" onClick={redo} disabled={!canRedo} aria-label="Redo config change" title="Redo (Ctrl/Cmd+Shift+Z)">
            <Redo2 className="h-3.5 w-3.5" />
          </Button>
          <span className="ml-1 text-[10px] text-muted-foreground">
            {changedCount > 0 ? `${changedCount} changed` : "Defaults"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="config-show-changed" className="cursor-pointer text-[10px] text-muted-foreground">
            Changed only
          </label>
          <Switch
            id="config-show-changed"
            checked={showChanged}
            onCheckedChange={setShowChanged}
            className="h-[16px] w-[30px] [&>span]:h-3 [&>span]:w-3 data-[state=checked]:[&>span]:translate-x-3.5"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 gap-1 px-1.5 text-[10px]"
            onClick={() => resetTab(activeTab)}
            disabled={visibleFields.length === 0}
            title="Reset all fields in this tab to defaults"
          >
            {changedCount === 0 ? <Check className="h-3 w-3" /> : <RotateCcw className="h-3 w-3" />}
            Reset tab
          </Button>
        </div>
      </div>
    </div>
  );
};

/**
 * WidgetConfigShell — the shared four-tab configurator frame.
 * Type editors render <ConfigSection tab="…"> children; the shell keeps
 * search, undo/redo, modified tracking and a sticky footer.
 */
export const WidgetConfigShell = ({
  widgetType,
  widgetLabel,
  widgetIcon,
  widgetID,
  widgetEditorForm,
  defaultConfig,
  slots,
  children,
  onDuplicate,
  onDelete,
  headerActions,
  className,
  allowEmptySearchState = true,
}) => (
  <ConfigEditorProvider
    widgetType={widgetType}
    widgetEditorForm={widgetEditorForm}
    defaultConfig={defaultConfig}
  >
    <div className={cn("space-y-2", className)}>
      <ShellInner
        widgetLabel={widgetLabel}
        widgetIcon={widgetIcon}
        widgetID={widgetID}
        slots={slots}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
        headerActions={headerActions}
        allowEmptySearchState={allowEmptySearchState}
      >
        {children}
      </ShellInner>
    </div>
  </ConfigEditorProvider>
);

export default WidgetConfigShell;

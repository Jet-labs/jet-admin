import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ConfigSection,
  WIDGETS_MAP,
  WidgetConfigShell,
  WidgetStyleSection,
  WidgetAccessibilitySection,
  deletePath,
  setPath,
} from "@jet-admin/widgets-ui";
import { ErrorBoundary } from "@jet-admin/ui";
import "../index.css";
import "./widgetGallery.css";

const FIXTURES = {
  table: [
    { id: 1, name: "Ada Lovelace", status: "active", amount: 1250, due_date: "2026-11-20", paid: true },
    { id: 2, name: "Grace Hopper", status: "failed", amount: 980, due_date: "2026-11-21", paid: false },
    { id: 3, name: "Alan Turing", status: "pending", amount: 4200, due_date: "2026-11-23", paid: true },
  ],
  list: [
    { id: 1, title: "Ada Lovelace", subtitle: "Platform", status: "active" },
    { id: 2, title: "Grace Hopper", subtitle: "Data", status: "failed" },
  ],
  timeline: [
    { id: 1, title: "Deployment completed", time: "2026-11-22T10:00:00", description: "release 2.1.0", status: "success" },
    { id: 2, title: "Query failed", time: "2026-11-21T08:00:00", description: "orders refresh", status: "error" },
  ],
  kanban: [
    { id: 1, name: "Acme renewal", owner: "Ada", amount: "$12k", status: "open", due_date: "2026-11-30" },
    { id: 2, name: "Globex onboarding", owner: "Grace", amount: "$8k", status: "done", due_date: "2026-11-26" },
  ],
  calendar: [
    { id: 1, name: "Acme renewal", due_date: "2026-11-30", owner: "Ada", status: "open" },
    { id: 2, name: "Globex review", due_date: "2026-11-26", owner: "Grace", status: "done" },
  ],
  "key-value": { Name: "Ada Lovelace", Role: "Platform", Active: true, Notes: "First programmer" },
  "json-viewer": { order: { id: 42, total: 1250, lines: [{ sku: "A-1", qty: 2 }] } },
};

const hydrate = (type, config) => {
  if (!FIXTURES[type]) return config;
  const next = { ...config };
  if (["table", "kanban", "calendar", "timeline", "list"].includes(type)) next.dataArrayTemplate = FIXTURES[type];
  if (type === "list") next.dataTemplate = FIXTURES[type];
  if (type === "timeline") next.dataTemplate = FIXTURES[type];
  if (type === "key-value") next.dataTemplate = FIXTURES[type];
  if (type === "json-viewer") next.dataTemplate = FIXTURES[type];
  if (type === "table") {
    if (!Array.isArray(next.columns) || next.columns.length === 0) {
      next.columns = [
        { key: "id", label: "ID", type: "number", width: 64, sortable: true },
        { key: "name", label: "Customer", type: "text", sortable: true, filterable: true },
        { key: "status", label: "Status", type: "badge", filterable: true },
        { key: "amount", label: "Amount", type: "currency", currency: "USD", decimals: 0, align: "right" },
        { key: "due_date", label: "Due", type: "date", align: "right" },
        { key: "paid", label: "Paid", type: "boolean", align: "center" },
      ];
    }
    if (!next.search) next.search = { enabled: true, serverSide: false, placeholder: "Search people…" };
    if (!next.multiSelect) next.multiSelect = { enabled: true, showSelectAll: true, actions: [{ label: "Archive", actionKey: "archive", variant: "outline" }] };
    if (!next.export) next.export = { enabled: true, format: "csv", serverSide: false, buttonLabel: "Export", scope: "filtered" };
    next.hoverHighlight = true;
    next.striped = true;
  }
  return next;
};

const App = () => {
  const types = useMemo(() => Object.keys(WIDGETS_MAP), []);
  const [type, setType] = useState("stat");
  const [theme, setTheme] = useState("dark");
  const [density, setDensity] = useState("comfortable");
  const [values, setValues] = useState(() => ({
    widgetTitle: "Demo widget",
    widgetType: "stat",
    widgetConfig: { ...WIDGETS_MAP.stat.sampleConfig, properties: { showHeader: true, density: "comfortable" } },
  }));
  const [widgetState, setWidgetState] = useState({});
  const [eventLog, setEventLog] = useState([]);

  const form = useMemo(
    () => ({
      values,
      setFieldValue: (path, value) => {
        setValues((prev) => {
          if (path === "widgetTitle" || path === "widgetType") return { ...prev, [path]: value };
          if (path.startsWith("widgetConfig.")) {
            const sub = path.slice("widgetConfig.".length);
            const nextConfig = value === undefined ? deletePath(prev.widgetConfig, sub) : setPath(prev.widgetConfig, sub, value);
            return { ...prev, widgetConfig: nextConfig };
          }
          return prev;
        });
      },
    }),
    [values]
  );

  const selectType = (nextType) => {
    setType(nextType);
    setWidgetState({});
    setValues({
      widgetTitle: `${WIDGETS_MAP[nextType].label} demo`,
      widgetType: nextType,
      widgetConfig: { ...WIDGETS_MAP[nextType].sampleConfig, properties: { showHeader: true, density } },
    });
  };

  const meta = WIDGETS_MAP[type];
  const Widget = meta?.component;
  const Editor = meta?.configEditor;
  const resolvedConfig = hydrate(type, values.widgetConfig);
  const fireWidgetEvent = (name, payload) => {
    setEventLog((prev) => [{ name, payload, at: new Date().toLocaleTimeString() }, ...prev].slice(0, 8));
    return Promise.resolve([]);
  };

  return (
    <div className={`min-h-screen bg-background text-foreground ${theme === "light" ? "theme-light" : ""}`}>
      <div className="mx-auto max-w-[1600px] space-y-3 p-4">
        <header className="flex flex-wrap items-center justify-between gap-2 rounded-card border border-border bg-card p-3">
          <div>
            <h1 className="text-lg font-medium">Widget gallery</h1>
            <p className="text-xs text-muted-foreground">Standalone dev harness — real editors and renderers, no auth.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={type}
              onChange={(event) => selectType(event.target.value)}
              className="h-8 rounded border border-border bg-background px-2 text-xs"
              aria-label="Widget type"
            >
              {types.map((item) => <option key={item} value={item}>{WIDGETS_MAP[item].label}</option>)}
            </select>
            <select
              value={theme}
              onChange={(event) => setTheme(event.target.value)}
              className="h-8 rounded border border-border bg-background px-2 text-xs"
              aria-label="Theme"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
            <select
              value={density}
              onChange={(event) => {
                setDensity(event.target.value);
                setValues((prev) => ({ ...prev, widgetConfig: { ...prev.widgetConfig, properties: { ...(prev.widgetConfig.properties || {}), density: event.target.value } } }));
              }}
              className="h-8 rounded border border-border bg-background px-2 text-xs"
              aria-label="Density"
            >
              <option value="compact">Compact</option>
              <option value="comfortable">Comfortable</option>
              <option value="spacious">Spacious</option>
            </select>
          </div>
        </header>

        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_420px]">
          <div className="space-y-3">
            <section className={`${`widget-density-${density}`} rounded-card border border-border bg-card p-3`}>
              <div className="mb-2 flex items-center justify-between">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preview</h2>
                <span className="font-mono text-[10px] text-muted-foreground">{meta?.label}</span>
              </div>
              <div className="h-[340px] overflow-hidden rounded-card border border-border bg-background">
                <ErrorBoundary title="Widget preview error">
                  {Widget ? (
                    <Widget
                      widgetID="demo-widget"
                      widgetTitle={values.widgetTitle}
                      widgetType={type}
                      widgetConfig={resolvedConfig}
                      data={FIXTURES[type]}
                      widgetState={widgetState}
                      setWidgetState={setWidgetState}
                      fireWidgetEvent={fireWidgetEvent}
                      onClick={async () => { fireWidgetEvent("onClick", { source: "gallery" }); }}
                      onWidgetInit={() => {}}
                      refreshData={() => {}}
                      isLoadingWorkflows={false}
                    />
                  ) : (
                    <div className="p-4 text-xs text-muted-foreground">No renderer registered.</div>
                  )}
                </ErrorBoundary>
              </div>
            </section>

            <section className="rounded-card border border-border bg-card p-3">
              <h2 className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Events</h2>
              {eventLog.length === 0 ? (
                <p className="text-[11px] text-muted-foreground">Interact with the preview to see events.</p>
              ) : (
                <ul className="space-y-1 font-mono text-[10px] text-muted-foreground">
                  {eventLog.map((entry, index) => (
                    <li key={index} className="truncate">
                      <span className="text-primary">{entry.name}</span> {JSON.stringify(entry.payload)}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          <div className="min-w-0">
            <div className="max-h-[calc(100vh-8rem)] overflow-y-auto rounded-card border border-border bg-background p-2">
              <ErrorBoundary title="Config editor error">
                {Editor ? (
                  <WidgetConfigShell
                    widgetType={type}
                    widgetLabel={meta.label}
                    widgetIcon={meta.icon}
                    widgetID="demo-widget"
                    widgetEditorForm={form}
                    defaultConfig={meta.sampleConfig}
                    slots={{
                      content: (
                        <ConfigSection id="gallery-content-note" title="Demo data" tab="content">
                          <p className="text-[11px] text-muted-foreground">Fixtures are injected for this preview. Real pages use page-level data sources.</p>
                        </ConfigSection>
                      ),
                      style: <WidgetStyleSection widgetType={type} />,
                      behavior: (
                        <ConfigSection id="gallery-behavior-note" title="Events" tab="behavior">
                          <p className="text-[11px] text-muted-foreground">The event editor is wired in the app shell; this harness logs renderer events.</p>
                        </ConfigSection>
                      ),
                      advanced: <WidgetAccessibilitySection />,
                    }}
                  >
                    <Editor widgetEditorForm={form} stateTree={{ queries: {}, variables: {} }} queryResults={{}} />
                  </WidgetConfigShell>
                ) : (
                  <p className="p-3 text-xs text-muted-foreground">No editor registered.</p>
                )}
              </ErrorBoundary>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

createRoot(document.getElementById("gallery-root")).render(<App />);

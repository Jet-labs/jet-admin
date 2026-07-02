/* eslint-disable react/prop-types */
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Bot,
  Brain,
  ChevronDown,
  ChevronRight,
  Loader2,
  Send,
  Sparkles,
  Trash2,
  Wrench,
  X,
  Maximize2,
  Minimize2,
  Database,
  Server,
  GitFork,
  Layout,
  Box,
  Play,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Command,
  Paperclip,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "../../../lib/utils";
import { useAIStore } from "../../../logic/stores/useAIStore";
import { streamChatWithAgentAPI, clearAISessionAPI } from "../../../data/apis/ai";
import { runDataQueryByIDAPI } from "../../../data/apis/dataQuery";
import { testDatasourceConnectionAPI } from "../../../data/apis/datasource";
import { executeWorkflowAPI } from "../../../data/apis/workflow";
import { AnimatedAIChat } from "../../../components/ui/animated-ai-chat";

// ─── Simple markdown renderer ─────────────────────────────────────────────────
function SimpleMarkdown({ text }) {
  if (!text) return null;
  return (
    <div className="text-[15px] leading-[1.65] space-y-3 text-foreground">
      {text.split("\n").map((line, i) => {
        const parts = line.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
        return (
          <p key={i} className={line === "" ? "h-1" : ""}>
            {parts.map((part, j) => {
              if (part.startsWith("**") && part.endsWith("**"))
                return <strong key={j} className="font-medium text-foreground">{part.slice(2, -2)}</strong>;
              if (part.startsWith("`") && part.endsWith("`"))
                return <code key={j} className="bg-muted/60 px-1.5 py-0.5 rounded border border-border/60 text-[13px] font-mono text-foreground">{part.slice(1, -1)}</code>;
              return <span key={j}>{part}</span>;
            })}
          </p>
        );
      })}
    </div>
  );
}

// ─── Thinking block ───────────────────────────────────────────────────────────
function ThinkingBlock({ content, isStreaming }) {
  const [expanded, setExpanded] = useState(false);
  if (!content) return null;
  return (
    <div className="rounded-md border border-border/60 bg-muted/20 overflow-hidden transition-colors">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/40 transition-colors"
      >
        <Brain className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
        <span className="flex-1 text-xs text-muted-foreground">
          {isStreaming ? "Thinking…" : "Thought process"}
        </span>
        {isStreaming ? (
          <Loader2 className="w-3 h-3 text-muted-foreground/70 animate-spin shrink-0" />
        ) : expanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
        )}
      </button>
      {expanded && !isStreaming && (
        <div className="border-t border-border/50 px-3 py-2.5 bg-background/60">
          <p className="text-[13px] text-muted-foreground leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
            {content}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Query Preview Card ────────────────────────────────────────────────────────
function QueryPreviewCard({ query, tenantID }) {
  const navigate = useNavigate();
  const [results, setResults] = useState(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(null);

  const queryID = query.dataQueryID || query.id;
  const title = query.title || query.dataQueryTitle || "Untitled Query";
  const type = query.datasourceType || "";
  const sql = query.options?.sql || (typeof query.options === "object" ? JSON.stringify(query.options) : "");

  const handleRun = async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await runDataQueryByIDAPI({ tenantID, dataQueryID: queryID });
      setResults(res);
    } catch (err) {
      setError(err?.message || "Failed to run query");
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="mt-2 rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <Database className="w-3.5 h-3.5 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{title}</p>
            <p className="text-[11px] text-muted-foreground">{type || "Query"}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/tenants/${tenantID}/queries/${queryID}`)}
          className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium shrink-0"
        >
          <span>Edit</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      <div className="p-3 space-y-2.5">
        {sql && (
          <pre className="text-xs font-mono bg-foreground text-background p-2.5 rounded-md overflow-x-auto max-h-24">
            {sql}
          </pre>
        )}

        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleRun}
            disabled={running}
            className="h-7 text-xs font-medium bg-primary hover:bg-primary/90 text-foreground px-3 rounded-md flex items-center gap-1.5 disabled:opacity-50 transition-colors"
          >
            {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            <span>Run query</span>
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-600 bg-red-50 p-2 rounded-md border border-red-200">{error}</p>
        )}

        {results && (
          <div className="border border-border rounded-md overflow-hidden max-h-48 overflow-y-auto">
            {Array.isArray(results) && results.length > 0 ? (
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    {Object.keys(results[0]).map((key) => (
                      <th key={key} className="px-2 py-1.5 font-medium text-foreground border-r border-border last:border-0">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-b border-border/60 last:border-0 bg-background hover:bg-muted/20">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="px-2 py-1.5 text-muted-foreground border-r border-border/60 last:border-0 truncate max-w-[120px]" title={String(val)}>
                          {val === null ? <span className="italic text-muted-foreground/50">null</span> : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-3 text-center text-muted-foreground text-xs">
                No rows returned, or the command completed successfully.
              </div>
            )}
            {Array.isArray(results) && results.length > 10 && (
              <div className="p-1.5 bg-muted/30 text-center text-[11px] text-muted-foreground border-t border-border">
                Showing first 10 of {results.length} rows
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Widget Preview Card ───────────────────────────────────────────────────────
function WidgetPreviewCard({ widget, tenantID }) {
  const navigate = useNavigate();
  const widgetID = widget.widgetID || widget.id;
  const title = widget.title || widget.widgetTitle || "Untitled Widget";
  const type = widget.type || widget.widgetType || "";
  const config = widget.config || widget.widgetConfig || {};

  return (
    <div className="mt-2 rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <Box className="w-3.5 h-3.5 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{title}</p>
            <p className="text-[11px] text-muted-foreground">Widget · {type}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/tenants/${tenantID}/widgets/${widgetID}`)}
          className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium shrink-0"
        >
          <span>Configure</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      <div className="p-3">
        <div className="bg-background border border-border rounded-md p-2.5 text-xs text-foreground">
          {type === "stat" && (
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">{config.label || "KPI Metric"}</span>
              <div className="text-lg font-medium tracking-tight text-primary">1,280</div>
              <span className="text-[11px] text-green-600 font-medium">↑ +12.3% from last month</span>
            </div>
          )}
          {type === "chart" && (
            <div className="space-y-2">
              <span className="text-[11px] text-muted-foreground">Chart preview ({config.chartType || "bar"})</span>
              <div className="h-12 flex items-end gap-1.5 pt-2">
                <div className="bg-primary/20 border border-primary/40 rounded-t w-full h-[30%]" />
                <div className="bg-primary border border-primary/80 rounded-t w-full h-[60%]" />
                <div className="bg-primary border border-primary/80 rounded-t w-full h-[45%]" />
                <div className="bg-primary/20 border border-primary/40 rounded-t w-full h-[90%]" />
                <div className="bg-primary/20 border border-primary/40 rounded-t w-full h-[75%]" />
              </div>
              <div className="flex justify-between text-[11px] text-muted-foreground border-t border-border/60 pt-1.5">
                <span>{config.xAxis || "X-axis"}</span>
                <span>{config.yAxis || "Y-axis"}</span>
              </div>
            </div>
          )}
          {type === "table" && (
            <div className="space-y-1.5">
              <span className="text-[11px] text-muted-foreground">Table columns</span>
              <div className="flex flex-wrap gap-1.5">
                {Array.isArray(config.columns) ? (
                  config.columns.map((col, idx) => (
                    <span key={idx} className="bg-muted/60 px-1.5 py-0.5 rounded border border-border/60 text-[11px] font-medium text-foreground">
                      {col.label || col.field}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">Default layout auto-generated</span>
                )}
              </div>
            </div>
          )}
          {type === "form" && (
            <div className="space-y-2">
              <span className="text-[11px] text-muted-foreground">Form fields</span>
              <div className="space-y-1">
                {Array.isArray(config.fields) ? (
                  config.fields.map((f, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs border-b border-border/40 py-1 last:border-0">
                      <span className="text-foreground">{f.label || f.name}</span>
                      <span className="text-muted-foreground text-[11px]">{f.type || "text"}</span>
                    </div>
                  ))
                ) : (
                  <span className="text-xs text-muted-foreground">Default fields auto-generated</span>
                )}
              </div>
            </div>
          )}
          {type !== "stat" && type !== "chart" && type !== "table" && type !== "form" && (
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Widget details</span>
              <pre className="text-[11px] font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap">
                {JSON.stringify(config, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Page Preview Card ─────────────────────────────────────────────────────────
function PagePreviewCard({ appPage, tenantID }) {
  const navigate = useNavigate();
  const pageID = appPage.appPageID || appPage.id;
  const title = appPage.title || appPage.appPageTitle || "Untitled Page";
  const desc = appPage.description || appPage.appPageDescription || "";
  const config = appPage.config || appPage.appPageConfig || {};
  const widgets = config.widgets || [];

  return (
    <div className="mt-2 rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <Layout className="w-3.5 h-3.5 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{title}</p>
            <p className="text-[11px] text-muted-foreground">App page</p>
          </div>
        </div>
        <div className="flex gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => navigate(`/tenants/${tenantID}/app-pages/${pageID}`)}
            className="text-xs text-foreground hover:text-foreground/80 flex items-center gap-1 font-medium bg-background border border-border px-2 py-1 rounded-md transition-colors"
          >
            <span>View</span>
          </button>
          <button
            type="button"
            onClick={() => navigate(`/tenants/${tenantID}/app-pages/${pageID}`)}
            className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium"
          >
            <span>Design</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      </div>

      <div className="p-3 space-y-2.5">
        {desc && <p className="text-xs text-muted-foreground">{desc}</p>}

        <div className="bg-background border border-border rounded-md p-2.5 space-y-1.5">
          <div className="flex justify-between items-center text-[11px] text-muted-foreground border-b border-border/60 pb-1.5">
            <span>Layout: {config.layout?.type || "Grid"}</span>
            <span>{widgets.length} widgets placed</span>
          </div>
          {widgets.length > 0 ? (
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {widgets.map((w, idx) => (
                <div key={idx} className="flex items-center justify-between py-1 border-b border-border/40 last:border-0 text-xs">
                  <span className="font-medium text-foreground">{w.alias || `Widget ${idx + 1}`}</span>
                  <span className="text-[11px] text-muted-foreground font-mono">{w.widgetID?.slice(0, 8)}...</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic text-center py-2">No widgets placed on this page yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Datasource Preview Card ───────────────────────────────────────────────────
function DatasourcePreviewCard({ datasource, tenantID }) {
  const navigate = useNavigate();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const dsID = datasource.datasourceID || datasource.id;
  const title = datasource.title || datasource.datasourceTitle || "Untitled Datasource";
  const type = datasource.type || datasource.datasourceType || "";

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testDatasourceConnectionAPI({
        tenantID,
        datasourceType: type,
        datasourceOptions: datasource.options || {}
      });
      setTestResult({ success: true, latency: res?.latency });
    } catch (err) {
      setTestResult({ success: false, error: err?.message || "Connection failed" });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="mt-2 rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <Server className="w-3.5 h-3.5 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{title}</p>
            <p className="text-[11px] text-muted-foreground">{type}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/tenants/${tenantID}/datasources/${dsID}`)}
          className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium shrink-0"
        >
          <span>Edit</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      <div className="p-3 flex items-center gap-2">
        <button
          type="button"
          onClick={handleTest}
          disabled={testing}
          className="h-7 text-xs font-medium bg-primary hover:bg-primary/90 text-foreground px-3 rounded-md flex items-center gap-1.5 disabled:opacity-50 transition-colors"
        >
          {testing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
          <span>Test connection</span>
        </button>

        {testResult && (
          testResult.success ? (
            <span className="text-[11px] text-green-700 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-md border border-green-200">
              <CheckCircle2 className="w-3 h-3 text-green-600" />
              <span>Connected {testResult.latency ? `(${testResult.latency}ms)` : ""}</span>
            </span>
          ) : (
            <span className="text-[11px] text-red-600 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md border border-red-200" title={testResult.error}>
              <AlertCircle className="w-3 h-3 text-red-500" />
              <span>Error</span>
            </span>
          )
        )}
      </div>
    </div>
  );
}

// ─── Workflow Preview Card ─────────────────────────────────────────────────────
function WorkflowPreviewCard({ workflow, tenantID }) {
  const navigate = useNavigate();
  const [running, setRunning] = useState(false);
  const [runResult, setRunResult] = useState(null);

  const wfID = workflow.workflowID || workflow.id;
  const title = workflow.title || workflow.workflowTitle || "Untitled Workflow";
  const desc = workflow.description || workflow.workflowDescription || "";
  const nodes = workflow.nodes || [];

  const handleRun = async () => {
    setRunning(true);
    setRunResult(null);
    try {
      const res = await executeWorkflowAPI({ tenantID, workflowID: wfID });
      setRunResult({ success: true, instanceID: res?.instanceID || res?.workflowInstanceID });
    } catch (err) {
      setRunResult({ success: false, error: err?.message || "Execution failed" });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="mt-2 rounded-lg border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2.5 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <GitFork className="w-3.5 h-3.5 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{title}</p>
            <p className="text-[11px] text-muted-foreground">Workflow</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/tenants/${tenantID}/workflows/${wfID}/editor`)}
          className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium shrink-0"
        >
          <span>Editor</span>
          <ExternalLink className="w-3 h-3" />
        </button>
      </div>

      <div className="p-3 space-y-2.5">
        {desc && <p className="text-xs text-muted-foreground">{desc}</p>}

        <div className="bg-background border border-border rounded-md p-2.5 space-y-1.5">
          <div className="flex justify-between items-center text-[11px] text-muted-foreground border-b border-border/60 pb-1.5">
            <span>DAG steps</span>
            <span>{nodes.length} nodes</span>
          </div>
          {nodes.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1 max-h-24 overflow-y-auto">
              {nodes.map((node, idx) => (
                <span key={idx} className="bg-muted/60 px-1.5 py-0.5 rounded border border-border/60 text-[11px] font-mono text-foreground font-medium">
                  {node.type || "step"}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic text-center py-2">No steps defined in this workflow.</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleRun}
            disabled={running}
            className="h-7 text-xs font-medium bg-primary hover:bg-primary/90 text-foreground px-3 rounded-md flex items-center gap-1.5 disabled:opacity-50 transition-colors"
          >
            {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            <span>Trigger run</span>
          </button>

          {runResult && (
            runResult.success ? (
              <span className="text-[11px] text-green-700 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-md border border-green-200 max-w-[150px] truncate" title={`Instance ID: ${runResult.instanceID}`}>
                <CheckCircle2 className="w-3 h-3 text-green-600" />
                <span>Running…</span>
              </span>
            ) : (
              <span className="text-[11px] text-red-600 flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md border border-red-200" title={runResult.error}>
                <AlertCircle className="w-3 h-3 text-red-500" />
                <span>Error</span>
              </span>
            )
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Central resource resolver ─────────────────────────────────────────────────
function ResourceRenderer({ toolName, result, tenantID }) {
  if (!result || typeof result !== "object") return null;

  if (toolName === "get_query" || toolName === "create_query" || toolName === "update_query") {
    const query = result.success ? {
      dataQueryID: result.dataQueryID,
      title: result.dataQueryTitle || result.title,
      datasourceType: result.datasourceType,
      datasourceID: result.datasourceID,
      options: result.dataQueryOptions || result.options
    } : result;
    if (!query.dataQueryID && !query.id) return null;
    return <QueryPreviewCard query={query} tenantID={tenantID} />;
  }

  if (toolName === "get_widget" || toolName === "create_widget" || toolName === "update_widget") {
    const widget = result;
    if (!widget.widgetID && !widget.id) return null;
    return <WidgetPreviewCard widget={widget} tenantID={tenantID} />;
  }

  if (toolName === "get_app_page" || toolName === "create_app_page" || toolName === "update_app_page") {
    const appPage = result;
    if (!appPage.appPageID && !appPage.id) return null;
    return <PagePreviewCard appPage={appPage} tenantID={tenantID} />;
  }

  if (toolName === "get_datasource" || toolName === "create_datasource" || toolName === "update_datasource") {
    const datasource = result;
    if (!datasource.datasourceID && !datasource.id) return null;
    return <DatasourcePreviewCard datasource={datasource} tenantID={tenantID} />;
  }

  if (toolName === "get_workflow" || toolName === "create_workflow" || toolName === "update_workflow") {
    const workflow = result;
    if (!workflow.workflowID && !workflow.id) return null;
    return <WorkflowPreviewCard workflow={workflow} tenantID={tenantID} />;
  }

  // Lists
  if (toolName === "list_widgets" && Array.isArray(result.widgets)) {
    return (
      <div className="mt-2 rounded-lg border border-border bg-card overflow-hidden">
        <p className="text-[11px] text-muted-foreground px-3 py-2 bg-muted/30 border-b border-border">Widgets · {result.widgets.length}</p>
        <div className="p-2 grid grid-cols-1 gap-1 max-h-36 overflow-y-auto">
          {result.widgets.map((w) => (
            <div key={w.widgetID} className="flex items-center justify-between px-2 py-1.5 rounded-md text-xs hover:bg-muted/30">
              <span className="font-medium text-foreground">{w.title}</span>
              <span className="text-[11px] bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded-full">{w.type}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (toolName === "list_app_pages" && Array.isArray(result.appPages)) {
    return (
      <div className="mt-2 rounded-lg border border-border bg-card overflow-hidden">
        <p className="text-[11px] text-muted-foreground px-3 py-2 bg-muted/30 border-b border-border">App pages · {result.appPages.length}</p>
        <div className="p-2 grid grid-cols-1 gap-1 max-h-36 overflow-y-auto">
          {result.appPages.map((p) => (
            <div key={p.appPageID} className="flex items-center justify-between px-2 py-1.5 rounded-md text-xs hover:bg-muted/30">
              <span className="font-medium text-foreground">{p.title}</span>
              <span className="text-[11px] text-muted-foreground font-mono truncate max-w-[120px]">{p.appPageID}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (toolName === "list_queries" && Array.isArray(result.queries)) {
    return (
      <div className="mt-2 rounded-lg border border-border bg-card overflow-hidden">
        <p className="text-[11px] text-muted-foreground px-3 py-2 bg-muted/30 border-b border-border">Queries · {result.queries.length}</p>
        <div className="p-2 grid grid-cols-1 gap-1 max-h-36 overflow-y-auto">
          {result.queries.map((q) => (
            <div key={q.dataQueryID} className="flex items-center justify-between px-2 py-1.5 rounded-md text-xs hover:bg-muted/30">
              <span className="font-medium text-foreground">{q.title}</span>
              <span className="text-[11px] bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded-full">{q.datasourceType}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (toolName === "list_datasources" && Array.isArray(result.datasources)) {
    return (
      <div className="mt-2 rounded-lg border border-border bg-card overflow-hidden">
        <p className="text-[11px] text-muted-foreground px-3 py-2 bg-muted/30 border-b border-border">Data sources · {result.datasources.length}</p>
        <div className="p-2 grid grid-cols-1 gap-1 max-h-36 overflow-y-auto">
          {result.datasources.map((ds) => (
            <div key={ds.datasourceID} className="flex items-center justify-between px-2 py-1.5 rounded-md text-xs hover:bg-muted/30">
              <span className="font-medium text-foreground">{ds.title}</span>
              <span className="text-[11px] bg-muted/60 text-muted-foreground px-1.5 py-0.5 rounded-full">{ds.type}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (toolName === "list_workflows" && Array.isArray(result.workflows)) {
    return (
      <div className="mt-2 rounded-lg border border-border bg-card overflow-hidden">
        <p className="text-[11px] text-muted-foreground px-3 py-2 bg-muted/30 border-b border-border">Workflows · {result.workflows.length}</p>
        <div className="p-2 grid grid-cols-1 gap-1 max-h-36 overflow-y-auto">
          {result.workflows.map((w) => (
            <div key={w.workflowID} className="flex items-center justify-between px-2 py-1.5 rounded-md text-xs hover:bg-muted/30">
              <span className="font-medium text-foreground">{w.title}</span>
              <span className={`text-[11px] px-1.5 py-0.5 rounded-full border ${w.status === "ACTIVE" ? "bg-green-50 text-green-700 border-green-200" : "bg-muted text-muted-foreground border-border"
                }`}>{w.status}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

// ─── Tool call step ───────────────────────────────────────────────────────────
function ToolCallStep({ step }) {
  const { tenantID } = useParams();
  const [expanded, setExpanded] = useState(false);
  const isPending = step.pending;
  const hasError = !!step.error;

  return (
    <div className={`rounded-md border overflow-hidden transition-colors ${hasError ? "border-red-200 bg-red-50/40"
        : isPending ? "border-primary/25 bg-primary/5"
          : "border-border/70 bg-muted/15"
      }`}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 text-left hover:bg-muted/30 transition-colors"
      >
        {isPending
          ? <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
          : <Wrench className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
        }
        <span className={`flex-1 truncate text-xs font-medium ${hasError ? "text-red-600" : "text-foreground/80"}`}>
          {step.toolName}
        </span>
        {isPending ? (
          <span className="text-[11px] text-primary/80 font-medium">running…</span>
        ) : expanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
        )}
      </button>

      {/* Inline visual Resource preview: rendered by default without expanding */}
      {!isPending && !hasError && step.result && (
        <div className="px-3 pb-3">
          <ResourceRenderer toolName={step.toolName} result={step.result} tenantID={tenantID} />
        </div>
      )}

      {expanded && !isPending && (
        <div className="border-t border-border/60 px-3 py-2.5 space-y-2.5 bg-background/60">
          {Object.keys(step.args || {}).length > 0 && (
            <div>
              <p className="text-[11px] text-muted-foreground/80 mb-1">Arguments</p>
              <pre className="text-[11px] text-foreground font-mono bg-muted/30 p-2 rounded-md border border-border/50 overflow-x-auto">
                {JSON.stringify(step.args, null, 2)}
              </pre>
            </div>
          )}
          <div>
            <p className="text-[11px] text-muted-foreground/80 mb-1">
              {hasError ? "Error" : "Raw result"}
            </p>
            <pre className={`text-[11px] font-mono bg-muted/30 p-2 rounded-md border border-border/50 overflow-x-auto max-h-40 overflow-y-auto ${hasError ? "text-red-600" : "text-foreground"}`}>
              {hasError ? step.error : JSON.stringify(step.result, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ message }) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  if (!isUser && !isAssistant) return null;

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-[82%] rounded-lg bg-muted/50 border border-border/60 px-3.5 py-2.5">
          <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-foreground">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-3">
      <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
        <Bot className="w-3.5 h-3.5 text-primary" />
      </div>
      <div className="flex-1 min-w-0 space-y-2.5">
        {message.thinking && <ThinkingBlock content={message.thinking} isStreaming={false} />}
        {message.toolCallSteps?.length > 0 && (
          <div className="space-y-1.5">
            {message.toolCallSteps.map((step, i) => <ToolCallStep key={i} step={step} />)}
          </div>
        )}
        {message.content && <SimpleMarkdown text={message.content} />}
      </div>
    </div>
  );
}

// ─── Streaming in-progress bubble ─────────────────────────────────────────────
function StreamingBubble({ thinking, text, toolCalls, isLoading }) {
  const hasAnything = thinking || text || toolCalls.length > 0;
  if (!hasAnything && !isLoading) return null;

  return (
    <div className="flex gap-3">
      <div className="w-6 h-6 rounded-md bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 mt-0.5">
        <Bot className="w-3.5 h-3.5 text-primary" />
      </div>
      <div className="flex-1 min-w-0 space-y-2.5">
        {thinking && <ThinkingBlock content={thinking} isStreaming={!text && toolCalls.length === 0} />}

        {toolCalls.length > 0 && (
          <div className="space-y-1.5">
            {toolCalls.map((step, i) => <ToolCallStep key={i} step={step} />)}
          </div>
        )}

        {text ? (
          <div className="text-[15px] leading-[1.65] text-foreground">
            <SimpleMarkdown text={text} />
            <span className="inline-block w-[2px] h-[15px] bg-primary/70 ml-0.5 animate-pulse align-middle" />
          </div>
        ) : !thinking && toolCalls.length === 0 && isLoading ? (
          <div className="flex items-center gap-1.5 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]" />
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 animate-bounce" />
          </div>
        ) : null}
      </div>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────
export const AIChatPanel = () => {
  const { tenantID } = useParams();
  const store = useAIStore();
  const {
    isOpen,
    messages,
    isLoading,
    isStreaming,
    currentThinking,
    currentText,
    currentToolCalls,
    appendMessage,
    setLoading,
    setStreaming,
    appendThinking,
    appendText,
    addToolCallStart,
    updateToolCallEnd,
    commitStreamingMessage,
    clearMessages,
  } = store;

  const [input, setInput] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, currentText, currentThinking, currentToolCalls, isLoading]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isLoading || isStreaming || !tenantID) return;

    setInput("");
    appendMessage({ role: "user", content: text });
    setLoading(true);
    setStreaming(false);

    try {
      await streamChatWithAgentAPI(
        { tenantID, message: text },
        {
          onThinking: (content) => {
            setLoading(false);
            setStreaming(true);
            appendThinking(content);
          },
          onText: (content) => {
            setLoading(false);
            setStreaming(true);
            appendText(content);
          },
          onToolStart: (toolName, args) => {
            setLoading(false);
            setStreaming(true);
            addToolCallStart(toolName, args);
          },
          onToolEnd: (toolName, result, error) => {
            updateToolCallEnd(toolName, result, error);
          },
          onDone: () => {
            commitStreamingMessage();
          },
          onError: (msg) => {
            appendMessage({
              role: "assistant",
              content: `⚠️ ${msg}`,
              toolCallSteps: [],
              thinking: null,
            });
            setLoading(false);
            setStreaming(false);
          },
        }
      );
    } catch (err) {
      const errMsg = err?.message || "Connection error. Please try again.";
      appendMessage({
        role: "assistant",
        content: `⚠️ ${errMsg}`,
        toolCallSteps: [],
        thinking: null,
      });
      setLoading(false);
      setStreaming(false);
    }
  }, [input, isLoading, isStreaming, tenantID, appendMessage, setLoading, setStreaming,
    appendThinking, appendText, addToolCallStart, updateToolCallEnd, commitStreamingMessage]);

  const handleClear = async () => {
    if (!tenantID) return;
    try {
      await clearAISessionAPI({ tenantID });
    } catch (err) {
      console.warn("Failed to clear AI session on server:", err);
    }
    clearMessages();
  };

  if (!isOpen) return null;

  const busy = isLoading || isStreaming;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-foreground/5 backdrop-blur-[1px] sm:hidden"
        onClick={() => useAIStore.getState().closePanel()}
      />

      {/* Main panel container */}
      <div
        className="fixed right-0 top-0 h-full z-50 flex flex-col bg-background border-l border-border shadow-lg transition-all duration-300 ease-in-out"
        style={{ width: isExpanded ? "900px" : "420px", maxWidth: "calc(100vw - 32px)" }}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-3.5 border-b border-border shrink-0">
          <div className="w-7 h-7 rounded-md bg-primary/10 flex items-center justify-center border border-primary/20">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">AI Agent</p>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? "bg-primary animate-pulse" : "bg-muted-foreground/40"}`} />
              {isStreaming ? "Responding…" : "46 tools available"}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title={isExpanded ? "Collapse view" : "Expand view"}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            type="button"
            onClick={handleClear}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Clear chat history"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => useAIStore.getState().closePanel()}
            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Close panel (Ctrl+K)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 min-h-0 bg-background">
          {messages.length === 0 && !busy ? (
            <div className="flex items-center justify-center min-h-full w-full">
              <AnimatedAIChat
                docked={false}
                value={input}
                onChange={setInput}
                onSend={sendMessage}
                busy={busy}
              />
            </div>
          ) : (
            <>
              {messages.map((msg, i) => <MessageBubble key={i} message={msg} />)}

              {busy && (
                <StreamingBubble
                  thinking={currentThinking}
                  text={currentText}
                  toolCalls={currentToolCalls}
                  isLoading={isLoading}
                />
              )}
            </>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input box */}
        {(messages.length > 0 || busy) && (
          <div className="shrink-0 border-t border-border p-2 bg-background relative">
            <AnimatedAIChat
              docked={true}
              value={input}
              onChange={setInput}
              onSend={sendMessage}
              busy={busy}
            />
            <p className="text-[10px] text-muted-foreground/60 mt-1.5 text-center">
              Enter to send · Shift+Enter for new line · Try typing / for suggestions
            </p>
          </div>
        )}
      </div>
    </>
  );
};
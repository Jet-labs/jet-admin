import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import {
  Bot,
  Brain,
  ChevronDown,
  ChevronRight,
  Loader2,
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
  Zap,
  BarChart3,
  GitBranch,
  Send,
  Copy,
} from 'lucide-react';

const TOOL_COLORS = {
  running: "text-primary border-primary/30 bg-primary/5",
  done: "text-foreground/70 border-border bg-muted/30",
  error: "text-destructive border-destructive/30 bg-destructive/5",
};

const CONTEXT_PILLS = [
  { icon: Database, label: "postgres-prod", color: "text-primary" },
  { icon: GitBranch, label: "sales-workflow", color: "text-muted-foreground" },
];

function WelcomeScreen({ onSuggestionClick }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-12">
      <div className="w-12 h-12 rounded bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 shadow-sm shadow-primary/5">
        <Zap className="w-6 h-6 text-primary" strokeWidth={2} />
      </div>
      <h2 className="text-lg font-medium text-foreground mb-1 tracking-tight">
        Jet AI Assistant
      </h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-xs leading-relaxed">
        Ask me to query your data sources, build automation workflows, or create dashboards.
      </p>
      <div className="grid grid-cols-2 gap-2 w-full max-w-sm">
        {[
          { icon: Database, text: "Show revenue by region for last 30 days" },
          { icon: GitBranch, text: "Build a workflow to notify Slack on new orders" },
          { icon: BarChart3, text: "Create a dashboard for user activity metrics" },
          { icon: Database, text: "Explore schema of the PostgreSQL datasource" },
        ].map(({ icon: Icon, text }, i) => (
          <div
            key={i}
            onClick={() => onSuggestionClick(text)}
            className="flex items-start gap-2 rounded border border-border bg-card p-2 text-left cursor-pointer hover:border-border/80 hover:bg-muted/30 transition-colors shadow-sm"
          >
            <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
            <span className="text-xs text-muted-foreground leading-snug">{text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChatInput({ onSend, disabled }) {
  const [value, setValue] = useState("");
  const textareaRef = useRef(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey || e.shiftKey) && e.key === "Enter") {
      // Shift+Enter should just be new line, wait no, let's make Enter send, Shift+Enter new line.
      if (e.shiftKey) return;
    }
    
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  return (
    <div className="border-t border-border bg-background p-2 shrink-0 relative">
      <div className="max-w-3xl mx-auto">


        <div className="relative rounded border border-border bg-card focus-within:border-primary/50 transition-colors shadow-sm">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask Jet AI anything — query data, build workflows, create dashboards…"
            rows={1}
            disabled={disabled}
            className="w-full px-3 pt-3 pb-1 focus:shadow-none text-sm bg-transparent text-foreground placeholder:text-muted-foreground/50 resize-none outline-none leading-relaxed min-h-[40px] max-h-40 disabled:opacity-50"
          />

          <div className="flex items-center justify-between px-2 pb-2 pt-1">
            <div className="flex items-center gap-1" />
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground/50 hidden sm:block">
                Enter to send
              </span>
              <button
                type="button"
                onClick={handleSend}
                disabled={!value.trim() || disabled}
                className="h-7 w-7 p-0 flex items-center justify-center rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-[10px] text-muted-foreground/50 mt-1.5">
          Jet AI may make mistakes. Verify critical queries before executing on production.
        </p>
      </div>
    </div>
  );
}
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAIStore } from '../../../logic/stores/useAIStore';
import { clearAISessionAPI, getAIBearerToken, getAIChatStreamURL } from '../../../data/apis/ai';
import { runDataQueryByIDAPI } from '../../../data/apis/dataQuery';
import { testDatasourceConnectionAPI } from '../../../data/apis/datasource';
import { executeWorkflowAPI } from '../../../data/apis/workflow';
import { AnimatedAIChat } from '../../../components/ui/animated-ai-chat';
import { A2UIRenderer } from './a2ui/A2UIRenderer';
import { A2UICard, A2UIConfirmCard, A2UIChoiceSelector, A2UISteps } from './a2ui/A2UICatalog';

// ─── Markdown renderer ────────────────────────────────────────────────────────
function SimpleMarkdown({ text }) {
  if (!text) return null;
  return (
    <div className="text-[14px] leading-[1.65] text-foreground space-y-2">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => <h1 className="text-base font-bold tracking-tight text-foreground my-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-sm font-semibold tracking-tight text-foreground my-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xs font-semibold tracking-tight text-foreground my-1">{children}</h3>,
          p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 space-y-1 my-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1 my-2">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed text-[14px]">{children}</li>,
          strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
          em: ({ children }) => <em className="italic text-foreground/90">{children}</em>,
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary/50 pl-3 my-2 text-muted-foreground italic bg-muted/20 py-1 rounded-r">
              {children}
            </blockquote>
          ),
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-2 hover:opacity-80 font-medium">
              {children}
            </a>
          ),
          hr: () => <hr className="my-3 border-border/50" />,
          table: ({ children }) => (
            <div className="my-2 border border-border rounded overflow-hidden overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">{children}</table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-muted/60 border-b border-border">{children}</thead>,
          th: ({ children }) => <th className="px-2.5 py-2 font-semibold text-foreground border-r border-border/60 last:border-r-0">{children}</th>,
          td: ({ children }) => <td className="px-2.5 py-2 border-b border-r border-border/40 text-muted-foreground last:border-r-0">{children}</td>,
          code: ({ className, children, ...props }) => {
            const isBlock = String(children).includes('\n') || (className && className.includes('language-'));
            if (isBlock) {
              const copy = () => navigator.clipboard.writeText(String(children));
              const lang = (className || '').replace('language-', '') || 'code';
              return (
                <div className="my-2 rounded bg-background border border-border overflow-hidden">
                  <div className="flex items-center justify-between px-2 py-1 border-b border-border bg-muted/20">
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                      {lang}
                    </span>
                    <button
                      onClick={copy}
                      className="flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      Copy
                    </button>
                  </div>
                  <pre className="px-3 py-2 font-mono text-xs text-foreground/90 leading-relaxed overflow-x-auto whitespace-pre">
                    <code>{children}</code>
                  </pre>
                </div>
              );
            }
            return (
              <code className="bg-muted/80 px-2 py-0.5 rounded border border-border/60 text-[13px] font-mono text-foreground font-normal" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

// ─── Thinking block ───────────────────────────────────────────────────────────
function ThinkingBlock({ content, isStreaming }) {
  const [expanded, setExpanded] = useState(isStreaming);

  useEffect(() => {
    if (isStreaming && content) {
      setExpanded(true);
    }
  }, [isStreaming, content]);

  if (!content) return null;

  return (
    <div className="rounded border border-border/50 bg-muted/10 hover:border-border/80 overflow-hidden transition-all duration-200 shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-2 px-2 py-2 text-left hover:bg-muted/30 transition-colors"
      >
        <Brain className={`w-3.5 h-3.5 shrink-0 drop-shadow-sm ${isStreaming ? 'text-primary animate-pulse' : 'text-primary/70'}`} />
        <span className="flex-1 text-xs text-muted-foreground flex items-center gap-2 font-medium">
          {isStreaming ? (
            <>
              <span className="text-primary font-mono text-[11px] uppercase tracking-wider font-semibold">Reasoning</span>
              <span className="text-muted-foreground font-normal">· {content.length} characters</span>
            </>
          ) : (
            'Thought process'
          )}
        </span>
        {isStreaming ? (
          <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
        ) : expanded ? (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/70 shrink-0" />
        )}
      </button>
      {expanded && (
        <div className="border-t border-border/50 px-2 py-2 bg-background/60">
          <p className="text-[13px] text-muted-foreground leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto font-mono">
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
  const title = query.title || query.dataQueryTitle || 'Untitled Query';
  const type = query.datasourceType || '';
  const sql = query.options?.sql || (typeof query.options === 'object' ? JSON.stringify(query.options) : '');

  const handleRun = async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await runDataQueryByIDAPI({ tenantID, dataQueryID: queryID });
      setResults(res);
    } catch (err) {
      setError(err?.message || 'Failed to run query');
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="mt-2 rounded border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-2 py-2 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <Database className="w-3.5 h-3.5 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{title}</p>
            <p className="text-[11px] text-muted-foreground">{type || 'Query'}</p>
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

      <div className="p-2 space-y-2">
        {sql && (
          <pre className="text-xs font-mono bg-zinc-950 text-zinc-100 border border-border/50 p-2 rounded overflow-x-auto max-h-24">
            {sql}
          </pre>
        )}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleRun}
            disabled={running}
            className="h-7 text-xs font-medium bg-primary hover:bg-primary/90 text-foreground px-2 rounded flex items-center gap-2 disabled:opacity-50 transition-colors"
          >
            {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
            <span>Run query</span>
          </button>
        </div>
        {error && <p className="text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">{error}</p>}
        {results && (
          <div className="border border-border rounded overflow-hidden max-h-48 overflow-y-auto">
            {Array.isArray(results) && results.length > 0 ? (
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    {Object.keys(results[0]).map((key) => (
                      <th key={key} className="px-2 py-2 font-medium text-foreground border-r border-border last:border-0">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.slice(0, 10).map((row, i) => (
                    <tr key={i} className="border-b border-border/60 last:border-0 bg-background hover:bg-muted/20">
                      {Object.values(row).map((val, j) => (
                        <td key={j} className="px-2 py-2 text-muted-foreground border-r border-border/60 last:border-0 truncate max-w-[120px]" title={String(val)}>
                          {val === null ? <span className="italic text-muted-foreground/50">null</span> : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-2 text-center text-muted-foreground text-xs">
                No rows returned, or the command completed successfully.
              </div>
            )}
            {Array.isArray(results) && results.length > 10 && (
              <div className="p-2 bg-muted/30 text-center text-[11px] text-muted-foreground border-t border-border">
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
  const title = widget.title || widget.widgetTitle || 'Untitled Widget';
  const type = widget.type || widget.widgetType || '';
  const config = widget.config || widget.widgetConfig || {};

  return (
    <div className="mt-2 rounded border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-2 py-2 bg-muted/30 border-b border-border">
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
      <div className="p-2">
        <div className="bg-background border border-border rounded p-2 text-xs text-foreground">
          {type === 'stat' && (
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">{config.label || 'KPI Metric'}</span>
              <div className="text-lg font-medium tracking-tight text-primary">1,280</div>
              <span className="text-[11px] text-green-600 font-medium">↑ +12.3% from last month</span>
            </div>
          )}
          {type === 'chart' && (
            <div className="space-y-2">
              <span className="text-[11px] text-muted-foreground">Chart preview ({config.chartType || 'bar'})</span>
              <div className="h-12 flex items-end gap-2 pt-2">
                <div className="bg-primary/20 border border-primary/40 rounded-t w-full h-[30%]" />
                <div className="bg-primary border border-primary/80 rounded-t w-full h-[60%]" />
                <div className="bg-primary border border-primary/80 rounded-t w-full h-[45%]" />
                <div className="bg-primary/20 border border-primary/40 rounded-t w-full h-[90%]" />
                <div className="bg-primary/20 border border-primary/40 rounded-t w-full h-[75%]" />
              </div>
            </div>
          )}
          {type !== 'stat' && type !== 'chart' && (
            <div className="space-y-1">
              <span className="text-[11px] text-muted-foreground">Widget · {type}</span>
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

// ─── Datasource Preview Card ───────────────────────────────────────────────────
function DatasourcePreviewCard({ datasource, tenantID }) {
  const navigate = useNavigate();
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const dsID = datasource.datasourceID || datasource.id;
  const title = datasource.title || datasource.datasourceTitle || 'Untitled Datasource';
  const type = datasource.type || datasource.datasourceType || '';

  const handleTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await testDatasourceConnectionAPI({ tenantID, datasourceType: type, datasourceOptions: datasource.options || {} });
      setTestResult({ success: true, latency: res?.latency });
    } catch (err) {
      setTestResult({ success: false, error: err?.message || 'Connection failed' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="mt-2 rounded border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-2 py-2 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <Server className="w-3.5 h-3.5 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{title}</p>
            <p className="text-[11px] text-muted-foreground">{type}</p>
          </div>
        </div>
        <button type="button" onClick={() => navigate(`/tenants/${tenantID}/datasources/${dsID}`)}
          className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium shrink-0">
          <span>Edit</span><ExternalLink className="w-3 h-3" />
        </button>
      </div>
      <div className="p-2 flex items-center gap-2">
        <button type="button" onClick={handleTest} disabled={testing}
          className="h-7 text-xs font-medium bg-primary hover:bg-primary/90 text-foreground px-2 rounded flex items-center gap-2 disabled:opacity-50 transition-colors">
          {testing ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
          <span>Test connection</span>
        </button>
        {testResult && (testResult.success ? (
          <span className="text-[11px] text-green-700 flex items-center gap-1 bg-green-50 px-2 py-1 rounded border border-green-200">
            <CheckCircle2 className="w-3 h-3 text-green-600" />
            <span>Connected {testResult.latency ? `(${testResult.latency}ms)` : ''}</span>
          </span>
        ) : (
            <span className="text-[11px] text-red-600 flex items-center gap-1 bg-red-50 px-2 py-1 rounded border border-red-200" title={testResult.error}>
            <AlertCircle className="w-3 h-3 text-red-500" /><span>Error</span>
          </span>
        ))}
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
  const title = workflow.title || workflow.workflowTitle || 'Untitled Workflow';
  const nodes = workflow.nodes || [];

  const handleRun = async () => {
    setRunning(true);
    setRunResult(null);
    try {
      const res = await executeWorkflowAPI({ tenantID, workflowID: wfID });
      setRunResult({ success: true, instanceID: res?.instanceID || res?.workflowInstanceID });
    } catch (err) {
      setRunResult({ success: false, error: err?.message || 'Execution failed' });
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="mt-2 rounded border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-2 py-2 bg-muted/30 border-b border-border">
        <div className="flex items-center gap-2 min-w-0">
          <GitFork className="w-3.5 h-3.5 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">{title}</p>
            <p className="text-[11px] text-muted-foreground">Workflow · {nodes.length} nodes</p>
          </div>
        </div>
        <button type="button" onClick={() => navigate(`/tenants/${tenantID}/workflows/${wfID}/editor`)}
          className="text-xs text-primary hover:text-primary/80 flex items-center gap-1 font-medium shrink-0">
          <span>Editor</span><ExternalLink className="w-3 h-3" />
        </button>
      </div>
      <div className="p-2 flex items-center gap-2">
        <button type="button" onClick={handleRun} disabled={running}
          className="h-7 text-xs font-medium bg-primary hover:bg-primary/90 text-foreground px-2 rounded flex items-center gap-2 disabled:opacity-50 transition-colors">
          {running ? <Loader2 className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3" />}
          <span>Trigger run</span>
        </button>
        {runResult && (runResult.success ? (
          <span className="text-[11px] text-green-700 flex items-center gap-1 bg-green-50 px-2 py-1 rounded border border-green-200">
            <CheckCircle2 className="w-3 h-3 text-green-600" /><span>Running…</span>
          </span>
        ) : (
            <span className="text-[11px] text-red-600 flex items-center gap-1 bg-red-50 px-2 py-1 rounded border border-red-200" title={runResult.error}>
            <AlertCircle className="w-3 h-3 text-red-500" /><span>Error</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Resource renderer ─────────────────────────────────────────────────────────
function ResourceRenderer({ toolName, result, tenantID }) {
  if (!result || typeof result !== 'object') return null;

  if (['get_query', 'create_query', 'update_query'].includes(toolName)) {
    const query = result.success ? {
      dataQueryID: result.dataQueryID, title: result.dataQueryTitle || result.title,
      datasourceType: result.datasourceType, datasourceID: result.datasourceID,
      options: result.dataQueryOptions || result.options,
    } : result;
    if (!query.dataQueryID && !query.id) return null;
    return <QueryPreviewCard query={query} tenantID={tenantID} />;
  }
  if (['get_widget', 'create_widget', 'update_widget'].includes(toolName)) {
    if (!result.widgetID && !result.id) return null;
    return <WidgetPreviewCard widget={result} tenantID={tenantID} />;
  }
  if (['get_app_page', 'create_app_page', 'update_app_page'].includes(toolName)) {
    if (!result.appPageID && !result.id) return null;
    // PagePreviewCard omitted for brevity — same pattern
  }
  if (['get_datasource', 'create_datasource', 'update_datasource'].includes(toolName)) {
    if (!result.datasourceID && !result.id) return null;
    return <DatasourcePreviewCard datasource={result} tenantID={tenantID} />;
  }
  if (['get_workflow', 'create_workflow', 'update_workflow'].includes(toolName)) {
    if (!result.workflowID && !result.id) return null;
    return <WorkflowPreviewCard workflow={result} tenantID={tenantID} />;
  }
  return null;
}

function getPlanTrackerSteps(planArgs, toolInvocations) {
  const steps = planArgs.steps || [];
  if (!Array.isArray(toolInvocations)) return steps;

  return steps.map(step => {
    const stepText = (step.title || "").toLowerCase();
    let matchedInv = null;

    if (stepText.includes("datasource") || stepText.includes("connection")) {
      matchedInv = toolInvocations.find(inv => inv.toolName?.includes("datasource") && inv.toolName !== 'createPlan' && inv.toolName !== 'askUser');
    } else if (stepText.includes("query") || stepText.includes("sql") || stepText.includes("select")) {
      matchedInv = toolInvocations.find(inv => inv.toolName?.includes("query") && inv.toolName !== 'createPlan' && inv.toolName !== 'askUser');
    } else if (stepText.includes("widget") || stepText.includes("chart") || stepText.includes("table")) {
      matchedInv = toolInvocations.find(inv => inv.toolName?.includes("widget") && inv.toolName !== 'createPlan' && inv.toolName !== 'askUser');
    } else if (stepText.includes("page") || stepText.includes("dashboard") || stepText.includes("layout")) {
      matchedInv = toolInvocations.find(inv => inv.toolName?.includes("page") && inv.toolName !== 'createPlan' && inv.toolName !== 'askUser');
    } else if (stepText.includes("workflow") || stepText.includes("trigger") || stepText.includes("execute")) {
      matchedInv = toolInvocations.find(inv => inv.toolName?.includes("workflow") && inv.toolName !== 'createPlan' && inv.toolName !== 'askUser');
    }

    if (matchedInv) {
      if (matchedInv.state === 'result') {
        let hasError = false;
        try {
          const res = typeof matchedInv.result === 'string' ? JSON.parse(matchedInv.result) : matchedInv.result;
          if (res?.error || res?.success === false) hasError = true;
        } catch (_) { }
        return { ...step, status: hasError ? 'failed' : 'completed' };
      }
      return { ...step, status: 'in_progress' };
    }

    return step;
  });
}

function CreatePlanToolStep({ invocation, allInvocations }) {
  const args = invocation.args || {};
  const steps = getPlanTrackerSteps(args, allInvocations);

  return (
    <A2UISteps
      title={args.title || "Execution Plan Checklist"}
      steps={steps}
    />
  );
}

function AskUserToolStep({ invocation, addToolResult }) {
  const [submitting, setSubmitting] = useState(false);
  const isPending = invocation.state === 'call' || invocation.state === 'partial-call';

  if (!isPending) {
    const result = invocation.result || {};
    const args = invocation.args || {};
    let recapText = "";
    if (args.kind === 'confirm') {
      recapText = result.confirmed ? "Approved" : "Cancelled";
    } else if (args.kind === 'choice') {
      const selectedChoice = args.choices?.find(c => c.value === result.selected);
      recapText = `Selected: ${selectedChoice?.label || result.selected || 'None'}`;
    } else if (args.kind === 'form') {
      recapText = `Submitted parameters: ${Object.entries(result.fields || {}).map(([k, v]) => `${k}=${v}`).join(', ')}`;
    }

    return (
      <div className="mt-2 p-3 rounded-xl border border-border bg-muted/20 text-xs text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
          <div>
            <span className="font-semibold text-foreground">{args.title || "Clarification Provided"}</span>
            <span className="ml-2 font-normal text-muted-foreground">({recapText})</span>
          </div>
        </div>
      </div>
    );
  }

  const args = invocation.args || {};
  const kind = args.kind || 'form';

  const handleAction = ({ action, params, actionLabel }) => {
    setSubmitting(true);
    let toolResult = {};
    if (kind === 'confirm') {
      toolResult = {
        confirmed: action === 'APPROVE_CONFIRMATION',
        targetTool: args.targetTool,
        targetParams: args.targetParams
      };
    } else if (kind === 'choice') {
      toolResult = {
        selected: params.option || params.value
      };
    } else if (kind === 'form') {
      toolResult = {
        fields: params
      };
    }

    addToolResult({
      toolCallId: invocation.toolCallId,
      result: toolResult
    });
  };

  if (kind === 'confirm') {
    return (
      <A2UIConfirmCard
        title={args.title}
        description={args.description}
        toolName={args.targetTool || 'action'}
        params={args.targetParams}
        onAction={handleAction}
        submitting={submitting}
      />
    );
  }

  if (kind === 'choice') {
    return (
      <A2UIChoiceSelector
        title={args.title}
        description={args.description}
        choices={args.choices || []}
        onAction={handleAction}
        submitting={submitting}
      />
    );
  }

  // Default: form
  return (
    <A2UICard
      title={args.title}
      description={args.description}
      fields={args.fields || []}
      actions={[{ label: "Submit & Proceed", action: "SUBMIT_FORM" }]}
      onAction={handleAction}
      submitting={submitting}
    />
  );
}

// ─── Tool invocation step (AI SDK useChat format) ─────────────────────────────
// message.toolInvocations[n] has: { state: 'call'|'result', toolName, toolCallId, args, result? }
function ToolCallStep({ invocation }) {
  const { tenantID } = useParams();
  const [expanded, setExpanded] = useState(false);

  const isPending = invocation.state === 'call' || invocation.state === 'partial-call';
  const hasResult = invocation.state === 'result';

  // Parse the result — tool handlers return JSON strings wrapped in content array
  let parsedResult = null;
  if (hasResult) {
    try {
      const raw = invocation.result;
      if (typeof raw === 'string') parsedResult = JSON.parse(raw);
      else if (Array.isArray(raw?.content)) parsedResult = JSON.parse(raw.content[0]?.text || '{}');
      else parsedResult = raw;
    } catch (_) {
      parsedResult = invocation.result;
    }
  }

  let ToolIcon = Wrench;
  const name = invocation.toolName?.toLowerCase() || '';
  if (name.includes('query')) ToolIcon = Database;
  else if (name.includes('datasource')) ToolIcon = Server;
  else if (name.includes('workflow')) ToolIcon = GitBranch;
  else if (name.includes('widget')) ToolIcon = Box;
  else if (name.includes('page')) ToolIcon = Layout;

  const status = isPending ? "running" : "done";

  return (
    <div
      className={`rounded border px-2 py-1.5 flex flex-col gap-2 text-xs transition-colors mb-1 ${TOOL_COLORS[status]}`}
    >
      <div className="flex items-start gap-2">
        <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
          {status === "running" ? (
            <Loader2 className="w-3 h-3 text-primary animate-spin" />
          ) : (
            <CheckCircle2 className="w-3 h-3 text-primary/70" />
          )}
          <ToolIcon className="w-3 h-3" />
        </div>
        
        <div className="flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="w-full flex items-center justify-between text-left"
          >
            <div>
              <p className="font-medium text-[11px] text-foreground">{invocation.toolName}</p>
              <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                {isPending ? "Executing..." : "Completed successfully"}
              </p>
            </div>
            {expanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/60 shrink-0" />
            )}
          </button>
        </div>
      </div>

      {hasResult && parsedResult && !expanded && (
        <div className="mt-1">
          <ResourceRenderer toolName={invocation.toolName} result={parsedResult} tenantID={tenantID} />
        </div>
      )}

      {expanded && hasResult && (
        <div className="border-t border-border/40 pt-2 pb-1 space-y-2">
          {Object.keys(invocation.args || {}).length > 0 && (
            <div>
              <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground/70 mb-1">Arguments</p>
              <pre className="text-[10px] text-foreground font-mono bg-background p-2 rounded border border-border/50 overflow-x-auto shadow-sm">
                {JSON.stringify(invocation.args, null, 2)}
              </pre>
            </div>
          )}
          <div>
            <p className="text-[10px] font-semibold tracking-wider uppercase text-muted-foreground/70 mb-1">Raw result</p>
            <pre className="text-[10px] font-mono bg-zinc-950 text-zinc-100 border border-border/50 p-2 rounded overflow-x-auto max-h-60 overflow-y-auto shadow-sm">
              {JSON.stringify(parsedResult, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Suggested actions chips ───────────────────────────────────────────────────
function SuggestedActions({ content, onAppend }) {
  const actions = React.useMemo(() => {
    if (!content) return [];
    const match = content.match(/```suggested_actions\s*([\s\S]*?)\s*```/);
    if (!match) return [];
    try { return JSON.parse(match[1]); } catch (_) { return []; }
  }, [content]);

  if (!actions.length) return null;

  return (
    <div className="flex flex-wrap gap-2 pt-1">
      {actions.map((action, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onAppend({ role: 'user', content: action.message })}
          className="flex items-center gap-2 text-[13px] px-2.5 py-2 rounded border border-border/60 bg-muted/10 hover:bg-primary/5 hover:border-primary/40 hover:text-primary text-foreground/80 transition-all duration-200 shadow-sm"
        >
          <Sparkles className="w-3 h-3 shrink-0 opacity-60" />
          {action.label}
        </button>
      ))}
    </div>
  );
}

// ─── Thinking content extractor ────────────────────────────────────────────────
function extractThinking(parts) {
  if (!Array.isArray(parts)) return null;
  const reasoningPart = parts.find((p) => p.type === 'reasoning');
  return reasoningPart?.reasoning || reasoningPart?.text || null;
}

function extractToolInvocations(message) {
  if (Array.isArray(message.toolInvocations) && message.toolInvocations.length > 0) {
    return message.toolInvocations;
  }
  if (!Array.isArray(message.parts)) return [];

  const map = new Map();
  for (const p of message.parts) {
    if (p.type === 'tool-invocation' && p.toolInvocation) {
      map.set(p.toolInvocation.toolCallId || p.toolInvocation.id, p.toolInvocation);
    } else if (p.toolCallId || (p.type && (p.type.startsWith('tool-') || p.type.startsWith('dynamic-tool-')))) {
      const id = p.toolCallId || p.id || p.toolName;
      const existing = map.get(id) || {
        toolCallId: id,
        toolName: p.toolName || p.name || 'tool',
        state: 'call',
        args: p.args || p.input || {},
      };
      if (p.type === 'tool-output-available' || p.type === 'dynamic-tool-output' || p.output !== undefined || p.result !== undefined) {
        existing.state = 'result';
        existing.result = p.output !== undefined ? p.output : p.result;
      }
      if (p.input || p.args) {
        existing.args = p.input || p.args;
      }
      map.set(id, existing);
    }
  }
  return Array.from(map.values());
}

function getAgentActiveStatus(lastMessage, isLoading) {
  if (!isLoading) return null;
  if (!lastMessage || lastMessage.role !== 'assistant') {
    return { type: 'submitting', label: 'Thinking & preparing response…', icon: Brain };
  }

  const toolInvocations = extractToolInvocations(lastMessage);
  const pendingTool = toolInvocations.find((inv) => inv.state === 'call' || inv.state === 'partial-call');
  if (pendingTool) {
    return {
      type: 'tool',
      label: `Executing tool: ${pendingTool.toolName}…`,
      toolName: pendingTool.toolName,
      icon: Wrench,
    };
  }

  const thinking = extractThinking(lastMessage.parts);
  if (thinking) {
    return { type: 'thinking', label: 'Reasoning & analyzing resources…', icon: Brain };
  }

  let rawContent = typeof lastMessage.content === 'string' ? lastMessage.content : '';
  if (!rawContent && Array.isArray(lastMessage.parts)) {
    rawContent = lastMessage.parts.filter((p) => p.type === 'text' && p.text).map((p) => p.text).join('');
  }

  if (rawContent) {
    return { type: 'generating', label: 'Synthesizing final response…', icon: Sparkles };
  }

  return { type: 'working', label: 'Processing agent workflow…', icon: Loader2 };
}

function AgentStatusBanner({ status }) {
  if (!status) return null;
  const Icon = status.icon || Loader2;
  const isLoader = Icon === Loader2 || status.type === 'working';

  return (
    <div className="flex items-center gap-2 px-2.5 py-2 rounded bg-primary/10 border border-primary/30 text-xs text-foreground animate-in fade-in slide-in-from-bottom-1 duration-200 shadow-sm">
      <div className="w-5 h-5 rounded bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0">
        <Icon className={`w-3 h-3 text-primary ${isLoader ? 'animate-spin' : 'animate-pulse'}`} />
      </div>
      <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
        <span className="font-medium text-foreground truncate">{status.label}</span>
        {status.toolName && (
          <span className="px-2 py-0.5 rounded bg-primary/20 border border-primary/40 text-[10px] font-mono text-foreground font-semibold shrink-0">
            {status.toolName}
          </span>
        )}
      </div>
    </div>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ message, onA2UIAction, onAppend, isStreaming, addToolResult }) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';
  if (!isUser && !isAssistant) return null;

  if (isUser) {
    return (
      <div className="flex justify-end mb-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <div className="max-w-[75%]">
          <div className="rounded bg-muted/50 border border-border px-3 py-2 text-sm text-foreground leading-relaxed">
            <p className="text-[15px] leading-relaxed whitespace-pre-wrap text-foreground">{message.content}</p>
          </div>
          <p className="text-[10px] text-muted-foreground text-right mt-1">
            {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
      </div>
    );
  }

  // Extract raw text from message.content or message.parts (AI SDK v4/v5 UI stream format)
  let rawContent = typeof message.content === 'string' ? message.content : '';
  if (!rawContent && Array.isArray(message.parts)) {
    rawContent = message.parts
      .filter((p) => p.type === 'text' && p.text)
      .map((p) => p.text)
      .join('');
  }

  // Pull reasoning (thinking) from message parts if available
  const thinking = extractThinking(message.parts);

  // Strip a2ui and suggested_actions code blocks from markdown display
  const cleanText = rawContent
    ? rawContent
        .replace(/```a2ui[\s\S]*?```/g, '')
        .replace(/```suggested_actions[\s\S]*?```/g, '')
        .trim()
    : '';

  // Extract tool invocations from message.toolInvocations or message.parts
  const toolInvocations = extractToolInvocations(message);

  return (
    <div className="flex gap-2 items-start mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="w-6 h-6 rounded bg-primary flex items-center justify-center shrink-0 mt-1 shadow-sm">
        <Zap className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2.5} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-foreground">Jet AI</span>
          <span className="text-[10px] text-muted-foreground">
            {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </span>
        </div>

        {thinking && <div className="mb-2"><ThinkingBlock content={thinking} isStreaming={isStreaming} /></div>}

        {/* Tool invocations — AI SDK provides these with full state tracking */}
        {toolInvocations?.length > 0 && (
          <div className="space-y-1 mb-2">
            {toolInvocations.map((inv) => {
              if (inv.toolName === 'askUser') {
                return (
                  <AskUserToolStep
                    key={inv.toolCallId || inv.id}
                    invocation={inv}
                    addToolResult={addToolResult}
                  />
                );
              }
              if (inv.toolName === 'createPlan') {
                return (
                  <CreatePlanToolStep
                    key={inv.toolCallId || inv.id}
                    invocation={inv}
                    allInvocations={toolInvocations}
                  />
                );
              }
              return <ToolCallStep key={inv.toolCallId || inv.id} invocation={inv} />;
            })}
          </div>
        )}

        {cleanText && (
          <div className="text-[15px] leading-[1.65] text-foreground">
            <SimpleMarkdown text={cleanText} />
            {isStreaming && (
              <span className="inline-block w-0.5 h-3.5 bg-primary ml-0.5 animate-pulse rounded align-middle" />
            )}
          </div>
        )}

        {/* A2UI interactive components parsed from content */}
        {rawContent && (
          <div className="mt-2">
            <A2UIRenderer schema={rawContent} onAction={onA2UIAction} />
          </div>
        )}

        {/* Suggested next-action chips */}
        <div className="mt-2">
          <SuggestedActions content={rawContent} onAppend={onAppend} />
        </div>
      </div>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────
export const AIChatPanel = () => {
  const { tenantID } = useParams();
  const { isOpen } = useAIStore();
  const [isExpanded, setIsExpanded] = useState(false);
  const bottomRef = useRef(null);

  const [inputText, setInputText] = useState('');
  
  // ── useChat — the AI SDK hook that manages everything ──────────────────
  const { messages, status, sendMessage: sdkSendMessage, setMessages, error, addToolResult } = useChat({
    transport: new DefaultChatTransport({
      api: getAIChatStreamURL(tenantID),
      // Use a fetch override so we always get a fresh Firebase token per request
      fetch: async (url, options) => {
        const token = await getAIBearerToken();
        return fetch(url, {
          ...options,
          headers: { ...options.headers, Authorization: `Bearer ${token}` },
        });
      },
    }),
    onError: (err) => {
      // useChat surfaces errors — we log but don't crash
      console.error('[AI] stream error:', err?.message);
    },
  });

  const isLoading = status === 'submitted' || status === 'streaming';

  // Auto-scroll on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ── A2UI button actions — append as user message to continue the chat ─
  const handleA2UIAction = useCallback(({ action, params, actionLabel }) => {
    const content = `[Action] ${actionLabel || action}${
      params && Object.keys(params).length > 0
        ? `\nParameters: ${JSON.stringify(params, null, 2)}`
        : ''
    }`;
    sdkSendMessage({ role: 'user', content });
  }, [sdkSendMessage]);

  // ── Clear chat ──────────────────────────────────────────────────────────
  const handleClear = async () => {
    setMessages([]);
    if (tenantID) {
      clearAISessionAPI({ tenantID }).catch(() => {
        // Server clear is best-effort — client state is already cleared
      });
    }
  };

  const handleSend = useCallback((text) => {
    console.log("SEND_MESSAGE CALLED WITH", text);
    if (!text?.trim() || isLoading) return;
    sdkSendMessage({ role: 'user', content: text.trim() });
    setInputText('');
  }, [sdkSendMessage, isLoading]);

  if (!isOpen) return null;

  const busy = isLoading;

  // The last message in an active stream — used to show streaming cursor
  const lastMessage = messages[messages.length - 1];
  const lastIsStreamingAssistant = busy && lastMessage?.role === 'assistant';
  const activeStatus = getAgentActiveStatus(lastMessage, busy);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-foreground/5 backdrop-blur-[1px] sm:hidden"
        onClick={() => useAIStore.getState().closePanel()}
      />

      {/* Main panel */}
      <div
        className="fixed right-0 top-0 h-full z-50 flex flex-col bg-background border-l border-border shadow-lg transition-all duration-300 ease-in-out"
        style={{ width: isExpanded ? '900px' : '420px', maxWidth: 'calc(100vw - 32px)' }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-2 py-2 border-b border-border/50 shrink-0 bg-background/80 backdrop-blur-md sticky top-0 z-10">
          <div className="w-7 h-7 rounded bg-gradient-to-br from-primary/10 to-primary/5 flex items-center justify-center border border-primary/20 shadow-sm shadow-primary/10">
            <Sparkles className="w-3.5 h-3.5 text-primary drop-shadow-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">AI Agent</p>
            <p className="text-xs text-muted-foreground flex items-center gap-2 min-w-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${busy ? 'bg-primary animate-pulse' : 'bg-muted-foreground/40'}`} />
              <span className="truncate font-medium">{activeStatus ? activeStatus.label : '46 tools available'}</span>
            </p>
          </div>

          <button type="button" onClick={() => setIsExpanded(!isExpanded)}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title={isExpanded ? 'Collapse view' : 'Expand view'}>
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          <button type="button" onClick={handleClear}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Clear chat history">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button type="button" onClick={() => useAIStore.getState().closePanel()}
            className="w-7 h-7 flex items-center justify-center rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            title="Close panel (Ctrl+K)">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Messages list */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2 min-h-0 bg-background">
          {messages.length === 0 && !busy ? (
            <div className="flex items-center justify-center min-h-full w-full">
              <WelcomeScreen onSuggestionClick={(text) => handleSend(text)} />
            </div>
          ) : (
            <>
              {messages.map((msg, i) => (
                <MessageBubble
                  key={msg.id || i}
                  message={msg}
                  onA2UIAction={handleA2UIAction}
                  onAppend={sdkSendMessage}
                  isStreaming={lastIsStreamingAssistant && i === messages.length - 1}
                  addToolResult={addToolResult}
                />
              ))}

              {/* Real-time active status banner (tool running, reasoning, synthesizing) */}
              {busy && (
                <div className="flex gap-2 animate-in fade-in duration-300">
                    <div className="w-6 h-6 rounded bg-primary flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Zap className="w-3.5 h-3.5 text-primary-foreground" strokeWidth={2.5} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <AgentStatusBanner status={activeStatus} />
                  </div>
                </div>
              )}

              {/* Error banner */}
              {error && (
                  <div className="text-xs text-red-600 bg-red-50 border border-red-200 px-2 py-2 rounded">
                  ⚠️ {error.message || 'An error occurred. Please try again.'}
                </div>
              )}
            </>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input box */}
        <div className="shrink-0 w-full">
          <ChatInput onSend={handleSend} disabled={busy} />
        </div>
      </div>
    </>
  );
};
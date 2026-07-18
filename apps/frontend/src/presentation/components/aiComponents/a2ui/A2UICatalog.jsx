/* eslint-disable react/prop-types */
import React, { useState } from "react";
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  Info,
  ArrowRight,
  Loader2,
  Copy,
  Check,
  ShieldAlert,
  BarChart3,
  PieChart as PieIcon,
  LineChart as LineIcon,
  Code2,
  Layers,
  ChevronRight,
} from "lucide-react";
import { cn } from "../../../../lib/utils";

// ─── 1. A2UI Card & Form Component (Enhanced) ──────────────────────────────────
export function A2UICard({ title, description, fields, actions, onAction, submitting }) {
  const [formState, setFormState] = useState(() => {
    const init = {};
    if (Array.isArray(fields)) {
      fields.forEach((f) => {
        if (f.name) init[f.name] = f.defaultValue ?? (f.type === "boolean" ? false : "");
      });
    }
    return init;
  });

  const handleFieldChange = (name, val) => {
    setFormState((prev) => ({ ...prev, [name]: val }));
  };

  const handleActionClick = (actionItem) => {
    const mergedParams = { ...(actionItem.params || {}), ...formState };
    onAction?.({
      action: actionItem.action || actionItem.label,
      params: mergedParams,
      actionLabel: actionItem.label,
    });
  };

  return (
    <div className="mt-2.5 rounded-xl border border-primary/20 bg-gradient-to-b from-card to-muted/20 p-4 shadow-sm space-y-3.5 text-foreground overflow-hidden">
      {title && (
        <div className="flex items-center justify-between border-b border-border/50 pb-2.5">
          <div className="flex items-center gap-2 min-w-0">
            <Sparkles className="w-4 h-4 text-primary shrink-0" />
            <h4 className="text-sm font-semibold truncate text-foreground">{title}</h4>
          </div>
        </div>
      )}

      {description && (
        <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
      )}

      {/* Render Fields */}
      {Array.isArray(fields) && fields.length > 0 && (
        <div className="space-y-3 pt-1">
          {fields.map((field, idx) => (
            <div key={idx} className="space-y-2 text-xs">
              {field.label && (
                <label className="font-medium text-foreground block">{field.label}</label>
              )}
              {field.type === "select" ? (
                <select
                  value={formState[field.name] || ""}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  className="w-full h-8 text-xs px-2.5 rounded border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {Array.isArray(field.options) ? (
                    field.options.map((opt, oIdx) => (
                      <option key={oIdx} value={typeof opt === "object" ? opt.value : opt}>
                        {typeof opt === "object" ? opt.label : opt}
                      </option>
                    ))
                  ) : (
                    <option value="">Select option</option>
                  )}
                </select>
              ) : field.type === "textarea" ? (
                <textarea
                  rows={2}
                  value={formState[field.name] || ""}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  placeholder={field.placeholder || ""}
                    className="w-full text-xs p-2 rounded border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              ) : field.type === "boolean" || field.type === "switch" ? (
                    <label className="flex items-center justify-between p-2 rounded border border-border bg-background cursor-pointer">
                  <span className="text-xs text-foreground font-medium">{field.description || field.label || "Enable option"}</span>
                  <input
                    type="checkbox"
                    checked={!!formState[field.name]}
                    onChange={(e) => handleFieldChange(field.name, e.target.checked)}
                    className="rounded border-border text-primary focus:ring-primary w-4 h-4"
                  />
                </label>
              ) : (
                <input
                  type={field.type === "password" || field.type === "secret" ? "password" : field.type || "text"}
                  value={formState[field.name] || ""}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  placeholder={field.placeholder || ""}
                        className="w-full h-8 text-xs px-2.5 rounded border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Render Actions */}
      {Array.isArray(actions) && actions.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border/40">
          {actions.map((act, idx) => {
            const isDanger = act.variant === "danger";
            const isOutline = act.variant === "outline" || act.variant === "secondary";

            return (
              <button
                key={idx}
                type="button"
                disabled={submitting}
                onClick={() => handleActionClick(act)}
                className={cn(
                  "h-8 px-3 text-xs font-medium rounded-lg flex items-center gap-2 transition-all disabled:opacity-50",
                  isDanger
                    ? "bg-red-600 hover:bg-red-700 text-white shadow-sm"
                    : isOutline
                    ? "bg-background border border-border hover:bg-muted text-foreground"
                    : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
                )}
              >
                {submitting ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <ArrowRight className="w-3 h-3" />
                )}
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── 2. A2UI Human-in-the-Loop Confirmation Card ──────────────────────────────
export function A2UIConfirmCard({ title, description, toolName, params, onAction, submitting }) {
  const [showDetails, setShowDetails] = useState(false);

  const handleApprove = () => {
    onAction?.({
      action: "APPROVE_CONFIRMATION",
      params: { toolName, params, approved: true },
      actionLabel: `Approved execution of ${toolName}`,
    });
  };

  const handleCancel = () => {
    onAction?.({
      action: "CANCEL_CONFIRMATION",
      params: { toolName, approved: false },
      actionLabel: `Cancelled execution of ${toolName}`,
    });
  };

  return (
    <div className="mt-2.5 rounded-xl border border-red-500/30 bg-gradient-to-b from-red-500/5 to-card p-4 shadow-sm space-y-3 text-foreground">
      <div className="flex items-center gap-2.5 border-b border-red-500/20 pb-2.5">
        <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
        <div>
          <h4 className="text-xs font-bold text-red-600 dark:text-red-400">
            {title || `Approval Required: ${toolName}`}
          </h4>
          <p className="text-[11px] text-muted-foreground">High-impact action detected</p>
        </div>
      </div>

      <p className="text-xs text-foreground leading-relaxed">
        {description || `The AI Agent requests your explicit permission before executing '${toolName}'.`}
      </p>

      {params && Object.keys(params).length > 0 && (
        <div className="space-y-1">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-[11px] text-primary hover:underline font-medium flex items-center gap-1"
          >
            <span>{showDetails ? "Hide" : "View"} Execution Parameters</span>
          </button>
          {showDetails && (
            <pre className="text-[11px] font-mono bg-muted/40 p-2.5 rounded border border-border/60 overflow-x-auto max-h-36">
              {JSON.stringify(params, null, 2)}
            </pre>
          )}
        </div>
      )}

      <div className="flex items-center gap-2 pt-2 border-t border-border/40">
        <button
          type="button"
          disabled={submitting}
          onClick={handleApprove}
          className="h-8 px-3.5 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-sm flex items-center gap-2 disabled:opacity-50 transition-all"
        >
          {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
          <span>Approve Execution</span>
        </button>

        <button
          type="button"
          disabled={submitting}
          onClick={handleCancel}
          className="h-8 px-3 text-xs font-medium rounded-lg bg-background border border-border hover:bg-muted text-foreground transition-all"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ─── 3. A2UI Readymade Multi-Choice Decision Selector ──────────────────────────
export function A2UIChoiceSelector({ title, description, choices = [], onAction, submitting }) {
  return (
    <div className="mt-2.5 rounded-xl border border-border bg-card p-4 space-y-3">
      {title && (
        <div className="flex items-center gap-2 border-b border-border/50 pb-2">
          <Layers className="w-4 h-4 text-primary shrink-0" />
          <h4 className="text-xs font-semibold text-foreground">{title}</h4>
        </div>
      )}
      {description && <p className="text-xs text-muted-foreground">{description}</p>}

      <div className="grid grid-cols-1 gap-2 pt-1">
        {choices.map((choice, idx) => (
          <button
            key={idx}
            type="button"
            disabled={submitting}
            onClick={() =>
              onAction?.({
                action: choice.action || "SELECT_OPTION",
                params: choice.params || { option: choice.value || choice.label },
                actionLabel: choice.label,
              })
            }
            className="w-full text-left p-3 rounded-lg border border-border/70 bg-background hover:bg-muted/40 hover:border-primary/40 transition-all flex items-start justify-between group disabled:opacity-50"
          >
            <div className="space-y-0.5 min-w-0 pr-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                  {choice.label}
                </span>
                {choice.badge && (
                  <span className="text-xs bg-primary/15 text-primary px-2 py-0.5 rounded font-medium">
                    {choice.badge}
                  </span>
                )}
              </div>
              {choice.description && (
                <p className="text-[11px] text-muted-foreground truncate">{choice.description}</p>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all shrink-0 mt-0.5" />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── 4. A2UI Interactive Code & SQL Preview Card ──────────────────────────────
export function A2UICodeView({ title, language = "sql", code, actions = [], onAction, submitting }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mt-2.5 rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b border-border">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-primary shrink-0" />
          <span className="text-xs font-medium text-foreground">{title || `${language.toUpperCase()} Snippet`}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      <pre className="p-3 text-xs font-mono bg-slate-950 text-slate-100 dark:bg-zinc-950 overflow-x-auto max-h-48">
        {code}
      </pre>

      {Array.isArray(actions) && actions.length > 0 && (
        <div className="p-2.5 bg-muted/20 border-t border-border flex gap-2">
          {actions.map((act, idx) => (
            <button
              key={idx}
              type="button"
              disabled={submitting}
              onClick={() =>
                onAction?.({
                  action: act.action || act.label,
                  params: { ...(act.params || {}), code },
                  actionLabel: act.label,
                })
              }
              className="h-7 px-2.5 text-xs font-medium rounded bg-primary hover:bg-primary/90 text-primary-foreground flex items-center gap-1 disabled:opacity-50"
            >
              <span>{act.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── 5. A2UI Interactive Chart Component (Bar / Line / Donut) ──────────────────
export function A2UIChart({ title, chartType = "bar", data = [] }) {
  const isPie = chartType === "pie" || chartType === "donut";

  return (
    <div className="mt-2.5 rounded-xl border border-border bg-card p-3.5 space-y-2">
      <div className="flex items-center justify-between border-b border-border/50 pb-2">
        <div className="flex items-center gap-2">
          {isPie ? (
            <PieIcon className="w-4 h-4 text-primary shrink-0" />
          ) : chartType === "line" ? (
            <LineIcon className="w-4 h-4 text-primary shrink-0" />
          ) : (
            <BarChart3 className="w-4 h-4 text-primary shrink-0" />
          )}
          <span className="text-xs font-semibold text-foreground">{title || "Data Visualization"}</span>
        </div>
        <span className="text-xs bg-muted px-2 py-0.5 rounded text-muted-foreground uppercase font-mono">
          {chartType}
        </span>
      </div>

      {Array.isArray(data) && data.length > 0 ? (
        <div className="pt-2 space-y-2">
          {data.map((item, idx) => {
            const label = item.label || item.name || `Metric ${idx + 1}`;
            const val = Number(item.value || item.val || 0);
            const max = Math.max(...data.map((d) => Number(d.value || d.val || 1)), 1);
            const pct = Math.min(100, Math.max(8, Math.round((val / max) * 100)));

            return (
              <div key={idx} className="space-y-1 text-xs">
                <div className="flex justify-between text-muted-foreground text-[11px]">
                  <span className="font-medium text-foreground truncate max-w-[150px]">{label}</span>
                  <span className="font-mono">{val.toLocaleString()}</span>
                </div>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-4 italic">No chart data points provided</p>
      )}
    </div>
  );
}

// ─── 6. A2UI Steps / Workflow Progress Tracker ─────────────────────────────────
export function A2UISteps({ title, steps = [] }) {
  return (
    <div className="mt-2.5 rounded-xl border border-border bg-card p-3.5 space-y-3">
      {title && (
        <h4 className="text-xs font-semibold text-foreground border-b border-border/50 pb-2">{title}</h4>
      )}
      <div className="space-y-2">
        {steps.map((step, idx) => {
          const isDone = step.status === "completed" || step.status === "done";
          const isCurrent = step.status === "in_progress" || step.status === "running";
          const isError = step.status === "failed" || step.status === "error";

          return (
            <div key={idx} className="flex items-start gap-2 text-xs">
              <div className="mt-0.5 shrink-0">
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                ) : isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 text-primary animate-spin" />
                ) : isError ? (
                  <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                ) : (
                  <div className="w-3.5 h-3.5 rounded-full border border-border bg-muted flex items-center justify-center text-[9px] text-muted-foreground">
                    {idx + 1}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn("font-medium", isDone ? "text-foreground" : isCurrent ? "text-primary" : "text-muted-foreground")}>
                  {step.title || step.label}
                </p>
                {step.description && (
                  <p className="text-[11px] text-muted-foreground">{step.description}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── 7. A2UI Stat Component ───────────────────────────────────────────────────
export function A2UIStat({ title, value, label, trend, change }) {
  return (
    <div className="mt-2.5 rounded-xl border border-border bg-card p-3.5 space-y-1">
      <span className="text-xs text-muted-foreground font-medium">{title || label || "Metric"}</span>
      <div className="text-xl font-bold text-foreground tracking-tight">{value || 0}</div>
      {change && (
        <span
          className={cn(
            "text-[11px] font-medium block",
            trend === "down" ? "text-red-500" : "text-emerald-600"
          )}
        >
          {trend === "down" ? "↓" : "↑"} {change}
        </span>
      )}
    </div>
  );
}

// ─── 8. A2UI Table Component ──────────────────────────────────────────────────
export function A2UITable({ title, columns = [], rows = [] }) {
  return (
    <div className="mt-2.5 rounded-xl border border-border bg-card overflow-hidden">
      {title && (
        <div className="px-3 py-2 bg-muted/40 border-b border-border text-xs font-semibold text-foreground">
          {title}
        </div>
      )}
      <div className="max-h-56 overflow-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-muted/60 border-b border-border">
              {columns.map((col, idx) => (
                <th key={idx} className="px-3 py-2 font-medium text-foreground border-r border-border/50 last:border-0">
                  {typeof col === "object" ? col.label || col.field : col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rIdx) => (
              <tr key={rIdx} className="border-b border-border/40 last:border-0 hover:bg-muted/20">
                {columns.map((col, cIdx) => {
                  const key = typeof col === "object" ? col.field : col;
                  const val = typeof row === "object" ? row[key] : row;
                  return (
                    <td key={cIdx} className="px-3 py-2 text-muted-foreground border-r border-border/40 last:border-0 truncate max-w-[150px]">
                      {val === null || val === undefined ? "-" : String(val)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── 9. A2UI Alert Component ──────────────────────────────────────────────────
export function A2UIAlert({ title, description, variant = "info" }) {
  const isWarning = variant === "warning";
  const isDanger = variant === "danger" || variant === "error";
  const isSuccess = variant === "success";

  return (
    <div
      className={cn(
        "mt-2.5 p-3 rounded-xl border flex gap-2.5 items-start text-xs",
        isDanger
          ? "bg-red-500/10 border-red-500/30 text-red-600"
          : isWarning
          ? "bg-amber-500/10 border-amber-500/30 text-amber-600"
          : isSuccess
          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600"
          : "bg-blue-500/10 border-blue-500/30 text-blue-600"
      )}
    >
      {isSuccess ? (
        <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
      ) : isDanger ? (
        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
      ) : isWarning ? (
        <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
      ) : (
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
      )}
      <div className="space-y-0.5">
        {title && <h5 className="font-semibold text-xs leading-none">{title}</h5>}
        {description && <p className="leading-relaxed opacity-90">{description}</p>}
      </div>
    </div>
  );
}

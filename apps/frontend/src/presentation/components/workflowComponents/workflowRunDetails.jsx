import { useQuery } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import React, { useMemo } from "react";
import { CONSTANTS } from "../../../constants";
import { getWorkflowRunStatusAPI } from "../../../data/apis/workflow";
import { ReactQueryLoadingErrorWrapper } from "../ui/reactQueryLoadingErrorWrapper";
import { WorkflowRunStatusBadge } from "./workflowRunsHistoryGrid";
import { Button, CodeEditor, Label } from "@jet-admin/ui";

// ─── Helpers ────────────────────────────────────────────────────────────────

function safeDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : parseISO(value);
  return isValid(d) ? d : null;
}

function formatDateTime(value) {
  const d = safeDate(value);
  return d ? format(d, "MMM d, yyyy · HH:mm:ss") : "—";
}

function formatDuration(startedAt, completedAt) {
  const start = safeDate(startedAt);
  const end = safeDate(completedAt);
  if (!start) return "—";
  const endMs = end ? end.getTime() : Date.now();
  const ms = Math.max(0, endMs - start.getTime());
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.round((ms % 60000) / 1000);
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

function safeJsonStringify(value) {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

const EVENT_DOT_CLASS = {
  NODE_COMPLETED: "bg-green-500",
  NODE_FAILED: "bg-destructive",
  NODE_DISPATCHED: "bg-muted-foreground/40",
  INPUT_SET: "bg-primary",
  SYSTEM_SET: "bg-muted-foreground/40",
  NODE_SUSPENDED: "bg-amber-500",
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const SummaryItem = ({ label, children }) => (
  <div className="flex min-w-0 flex-col gap-1">
    <span className="font-mono text-[9px] font-semibold uppercase tracking-widest text-muted-foreground/60">
      {label}
    </span>
    {children}
  </div>
);

SummaryItem.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node,
};

const LogPayloadViewer = ({ payload }) => {
  const entries = Object.entries(payload || {}).filter(
    ([key]) => !key.startsWith("__")
  );
  if (entries.length === 0) return null;
  return (
    <div className="mt-1 overflow-hidden rounded border border-border bg-background">
      <CodeEditor
        language="json"
        value={safeJsonStringify(Object.fromEntries(entries))}
        readOnly={true}
        height="160px"
        showHeader={false}
      />
    </div>
  );
};

LogPayloadViewer.propTypes = {
  payload: PropTypes.object,
};

// ─── Component ───────────────────────────────────────────────────────────────

export const WorkflowRunDetails = ({ tenantID, runID }) => {
  WorkflowRunDetails.propTypes = {
    tenantID: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
    runID: PropTypes.string.isRequired,
  };

  const navigate = useNavigate();

  const { isLoading, data: run, error: loadRunError } = useQuery({
    queryKey: [CONSTANTS.REACT_QUERY_KEYS.WORKFLOW_RUNS(tenantID), runID],
    queryFn: () => getWorkflowRunStatusAPI({ tenantID, instanceID: runID }),
    refetchOnWindowFocus: false,
    refetchInterval: (query) =>
      query.state.data?.status === "RUNNING" ||
      query.state.data?.status === "PENDING"
        ? 4000
        : false,
  });

  const inputValues = useMemo(() => {
    const inputLog = (run?.logs ?? []).find((l) => l.eventType === "INPUT_SET");
    return inputLog?.payload?.input ?? {};
  }, [run]);

  const isRunning = run?.status === "RUNNING" || run?.status === "PENDING";

  return (
    <ReactQueryLoadingErrorWrapper
      isLoading={isLoading}
      error={loadRunError}
      loadingContainerClass="flex-1"
    >
      <div className="flex h-full w-full flex-col overflow-hidden bg-background">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex flex-row justify-between items-center w-full p-2 border-b border-border">
          <div className="flex items-center gap-2 min-w-0">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              square
              aria-label="Back to run history"
              onClick={() =>
                navigate(CONSTANTS.ROUTES.VIEW_WORKFLOW_RUNS.path(tenantID))
              }
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0 flex flex-col justify-center items-start">
              <h1 className="text-lg font-medium leading-tight tracking-tight text-foreground truncate">
                {CONSTANTS.STRINGS.VIEW_WORKFLOW_RUN_DETAILS_TITLE}
                {run?.workflowTitle ? ` — ${run.workflowTitle}` : ""}
              </h1>
              <span className="font-mono text-xs text-primary">
                {`Run ID: ${runID}`}
              </span>
            </div>
          </div>
          {run && <WorkflowRunStatusBadge value={run.status} />}
        </div>

        {/* ── Body ────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
          {/* Summary strip */}
          <div className="rounded border border-border bg-card p-2 grid grid-cols-2 md:grid-cols-5 gap-2">
            <SummaryItem label="Type">
              <span
                className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-medium ${
                  run?.isTest
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border bg-muted/50 text-foreground"
                }`}
              >
                {run?.isTest ? "Test" : "Live"}
              </span>
            </SummaryItem>
            <SummaryItem label="Started At">
              <span className="font-mono text-xs text-foreground tabular-nums">
                {formatDateTime(run?.startedAt)}
              </span>
            </SummaryItem>
            <SummaryItem label="Completed At">
              <span className="font-mono text-xs text-foreground tabular-nums">
                {formatDateTime(run?.completedAt)}
              </span>
            </SummaryItem>
            <SummaryItem label="Duration">
              <span className="font-mono text-xs text-foreground tabular-nums">
                {isRunning && !run?.completedAt
                  ? `${formatDuration(run?.startedAt, null)} (running)`
                  : formatDuration(run?.startedAt, run?.completedAt)}
              </span>
            </SummaryItem>
            <SummaryItem label="Events">
              <span className="font-mono text-xs text-foreground tabular-nums">
                {run?.logs?.length ?? 0}
              </span>
            </SummaryItem>
          </div>

          {/* Inputs */}
          <div className="flex flex-col gap-2 rounded border border-border bg-card p-2">
            <Label className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Run Inputs
            </Label>
            <div className="overflow-hidden rounded border border-border bg-background">
              <CodeEditor
                language="json"
                value={safeJsonStringify(inputValues)}
                readOnly={true}
                height="140px"
                showHeader={false}
              />
            </div>
          </div>

          {/* Execution timeline */}
          <div className="flex flex-col gap-2 rounded border border-border bg-card p-2">
            <Label className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Execution Timeline
            </Label>
            {(run?.logs ?? []).length === 0 ? (
              <p className="text-xs italic text-muted-foreground">
                No execution events recorded.
              </p>
            ) : (
              <ol className="flex flex-col gap-0">
                {(run?.logs ?? []).map((log) => {
                  const dotClass =
                    EVENT_DOT_CLASS[log.eventType] ?? "bg-muted-foreground/40";
                  const isFailed = log.eventType === "NODE_FAILED";
                  return (
                    <li
                      key={log.logID}
                      className="relative flex gap-2 pb-2 last:pb-0"
                    >
                      {/* Timeline rail */}
                      <div className="flex flex-col items-center">
                        <span
                          className={`mt-1 h-2 w-2 shrink-0 rounded-full ${dotClass}`}
                        />
                        <span className="w-px flex-1 bg-border" />
                      </div>
                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-foreground">
                            {log.eventType.replace(/_/g, " ")}
                          </span>
                          {log.nodeID && (
                            <span className="font-mono text-[10px] text-muted-foreground">
                              node {String(log.nodeID).substring(0, 8)}
                            </span>
                          )}
                          {log.nodeAttempt != null && log.nodeAttempt > 1 && (
                            <span className="rounded border border-amber-500/30 bg-amber-500/15 px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none tracking-wider text-amber-600">
                              Attempt {log.nodeAttempt}
                            </span>
                          )}
                          <span className="ml-auto font-mono text-[10px] text-muted-foreground/70 tabular-nums">
                            {formatDateTime(log.createdAt)}
                          </span>
                        </div>
                        {isFailed && log.errorMessage && (
                          <p className="mt-1 rounded border border-destructive/30 bg-destructive/10 p-2 font-mono text-[11px] text-destructive break-words">
                            {log.errorMessage}
                          </p>
                        )}
                        {log.eventType === "NODE_COMPLETED" && (
                          <LogPayloadViewer payload={log.payload} />
                        )}
                      </div>
                    </li>
                  );
                })}
              </ol>
            )}
          </div>

          {/* Final context */}
          <div className="flex flex-col gap-2 rounded border border-border bg-card p-2">
            <Label className="font-mono text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Final Context
            </Label>
            <div className="overflow-hidden rounded border border-border bg-background">
              <CodeEditor
                language="json"
                value={safeJsonStringify(run?.contextData ?? {})}
                readOnly={true}
                height="260px"
                showHeader={false}
              />
            </div>
          </div>
        </div>
      </div>
    </ReactQueryLoadingErrorWrapper>
  );
};

import React from "react";
import { AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { format, parseISO, isValid } from "date-fns";
import ReactJson from "react-json-view";

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Safely parse a date value (string or Date) into a JS Date, or return null. */
function safeDate(value) {
  if (!value) return null;
  const d = value instanceof Date ? value : parseISO(value);
  return isValid(d) ? d : null;
}

/** Format a date for display: "Mar 28, 2026 · 14:03:00" */
function formatDateTime(value) {
  const d = safeDate(value);
  return d ? format(d, "MMM d, yyyy · HH:mm:ss") : "—";
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  success: { icon: CheckCircle, className: "text-green-600 dark:text-green-400", bg: "bg-green-950/40  dark:bg-green-950/40  border-green-200  dark:border-green-800" },
  failed: { icon: AlertCircle, className: "text-red-600   dark:text-red-400", bg: "bg-red-950/40    dark:bg-red-950/40    border-red-200    dark:border-red-800" },
  error: { icon: AlertCircle, className: "text-red-600   dark:text-red-400", bg: "bg-red-950/40    dark:bg-red-950/40    border-red-200    dark:border-red-800" },
  running: { icon: Clock, className: "text-blue-600  dark:text-blue-400", bg: "bg-blue-950/40   dark:bg-blue-950/40   border-blue-200   dark:border-blue-800" },
  pending: { icon: Clock, className: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50  dark:bg-amber-950/40  border-amber-200  dark:border-amber-800" },
  cancelled: { icon: XCircle, className: "text-muted-foreground/70  dark:text-muted-foreground/70", bg: "bg-background   dark:bg-background/40   border-border   dark:border-border" },
};

function StatusBadge({ value }) {
  const key = (value ?? "").toLowerCase();
  const config = STATUS_CONFIG[key] ?? {
    icon: Clock,
    className: "text-muted-foreground",
    bg: "bg-muted border-border",
  };
  const Icon = config.icon;

  return (
    <div className="flex h-full items-center">
      <span
        className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[11px] font-medium capitalize ${config.bg} ${config.className}`}
      >
        <Icon className="h-3.5 w-3.5 flex-shrink-0" />
        {value ?? "—"}
      </span>
    </div>
  );
}

function DateCell({ value }) {
  return (
    <div className="flex h-full items-center">
      <span className="font-mono text-xs text-foreground tabular-nums">
        {formatDateTime(value)}
      </span>
    </div>
  );
}

function JsonCell({ value }) {
  if (!value) {
    return (
      <div className="flex h-full items-center">
        <span className="text-xs text-muted-foreground">—</span>
      </div>
    );
  }
  return (
    <div className="max-h-28 w-full overflow-auto rounded border border-border bg-muted/30 p-1.5 text-foreground">
      <ReactJson
        src={value}
        theme="rjv-default"
        displayDataTypes={false}
        collapsed={1}
        enableClipboard={false}
        style={{ backgroundColor: "transparent", fontSize: "11px" }}
      />
    </div>
  );
}

// ─── Column definitions ──────────────────────────────────────────────────────

export const getFormattedCronJobHistoryColumns = () => {
  try {
    return [
      {
        field: "cronJobHistoryID",
        headerName: "History ID",
        width: 120,
        editable: false,
        sortable: true,
        type: "number",
        headerAlign: "left",
        align: "left",
        renderCell: ({ value }) => (
          <div className="flex h-full items-center font-mono text-xs tabular-nums text-foreground">
            {value}
          </div>
        ),
      },
      {
        field: "cronJobID",
        headerName: "Job ID",
        width: 100,
        editable: false,
        sortable: true,
        type: "number",
        headerAlign: "left",
        align: "left",
        renderCell: ({ value }) => (
          <div className="flex h-full items-center font-mono text-xs tabular-nums text-foreground">
            {value}
          </div>
        ),
      },
      {
        field: "status",
        headerName: "Status",
        width: 140,
        editable: false,
        sortable: true,
        type: "string",
        headerAlign: "left",
        align: "left",
        renderCell: ({ value }) => <StatusBadge value={value} />,
      },
      {
        field: "scheduledAt",
        headerName: "Scheduled At",
        width: 230,
        editable: false,
        sortable: true,
        type: "dateTime",
        headerAlign: "left",
        align: "left",
        valueGetter: (value) => safeDate(value),
        renderCell: ({ value }) => <DateCell value={value} />,
      },
      {
        field: "startTime",
        headerName: "Start Time",
        width: 230,
        editable: false,
        sortable: true,
        type: "dateTime",
        headerAlign: "left",
        align: "left",
        valueGetter: (value) => safeDate(value),
        renderCell: ({ value }) => <DateCell value={value} />,
      },
      {
        field: "endTime",
        headerName: "End Time",
        width: 230,
        editable: false,
        sortable: true,
        type: "dateTime",
        headerAlign: "left",
        align: "left",
        valueGetter: (value) => safeDate(value),
        renderCell: ({ value }) => <DateCell value={value} />,
      },
      {
        field: "result",
        headerName: "Result",
        width: 480,
        editable: false,
        sortable: false,
        headerAlign: "left",
        align: "left",
        valueGetter: (value) => {
          if (!value) return null;
          if (typeof value === "object") return value;
          try {
            return JSON.parse(value);
          } catch {
            return { error: "Invalid JSON", raw: value };
          }
        },
        renderCell: ({ value }) => <JsonCell value={value} />,
      },
    ];
  } catch (error) {
    console.error("Error in getFormattedCronJobHistoryColumns:", error);
    return [];
  }
};
import React, { useState, useCallback, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Label, Checkbox } from "@jet-admin/ui";

// ─── Constants ──────────────────────────────────────────────────────────────

const PERIODS = [
  { value: "minute", label: "Minute", shorthand: "MIN" },
  { value: "hour", label: "Hour", shorthand: "HR" },
  { value: "day", label: "Day", shorthand: "DAY" },
  { value: "week", label: "Week", shorthand: "WK" },
  { value: "month", label: "Month", shorthand: "MO" },
  { value: "year", label: "Year", shorthand: "YR" },
];

const WEEKDAYS = [
  { value: 0, label: "Sun", full: "Sunday" },
  { value: 1, label: "Mon", full: "Monday" },
  { value: 2, label: "Tue", full: "Tuesday" },
  { value: 3, label: "Wed", full: "Wednesday" },
  { value: 4, label: "Thu", full: "Thursday" },
  { value: 5, label: "Fri", full: "Friday" },
  { value: 6, label: "Sat", full: "Saturday" },
];

const MONTHS = [
  { value: 1, label: "Jan", full: "January" },
  { value: 2, label: "Feb", full: "February" },
  { value: 3, label: "Mar", full: "March" },
  { value: 4, label: "Apr", full: "April" },
  { value: 5, label: "May", full: "May" },
  { value: 6, label: "Jun", full: "June" },
  { value: 7, label: "Jul", full: "July" },
  { value: 8, label: "Aug", full: "August" },
  { value: 9, label: "Sep", full: "September" },
  { value: 10, label: "Oct", full: "October" },
  { value: 11, label: "Nov", full: "November" },
  { value: 12, label: "Dec", full: "December" },
];

// ─── Cron Parsing Helpers ────────────────────────────────────────────────────

/** Parse a cron field that may contain wildcards, single values, or comma-separated lists. */
function parseCronField(field, min, max) {
  if (field === "*") return null; // wildcard
  const values = field.split(",").map(Number).filter((n) => !isNaN(n) && n >= min && n <= max);
  return values.length > 0 ? values : null;
}

/** Derive a structured state from a raw cron string. Returns null on failure. */
function parseCron(raw) {
  if (!raw || typeof raw !== "string") return null;
  const parts = raw.trim().split(/\s+/);
  if (parts.length !== 5) return null;

  const [minuteF, hourF, domF, monthF, dowF] = parts;

  const minute = minuteF === "*" ? 0 : parseInt(minuteF, 10);
  const hour = hourF === "*" ? 0 : parseInt(hourF, 10);
  const dom = domF === "*" ? 1 : parseInt(domF, 10);
  const months = parseCronField(monthF, 1, 12);
  const dows = parseCronField(dowF, 0, 6);

  // Detect period
  let period = "minute";
  if (minuteF !== "*" && hourF === "*") period = "hour";  // e.g. "30 * * * *" → every hour at :30
  if (minuteF !== "*" && hourF !== "*" && domF === "*" && monthF === "*" && dowF === "*") period = "day";
  if (minuteF !== "*" && hourF !== "*" && domF === "*" && monthF === "*" && dowF !== "*") period = "week";
  if (minuteF !== "*" && hourF !== "*" && domF !== "*" && monthF === "*" && dowF === "*") period = "month";
  if (minuteF !== "*" && hourF !== "*" && domF !== "*" && monthF !== "*" && dowF === "*") period = "year";
  if (minuteF === "*" && hourF === "*" && domF === "*" && monthF === "*" && dowF === "*") period = "minute";

  return {
    period,
    minute: isNaN(minute) ? 0 : Math.min(59, Math.max(0, minute)),
    hour: isNaN(hour) ? 0 : Math.min(23, Math.max(0, hour)),
    dom: isNaN(dom) ? 1 : Math.min(31, Math.max(1, dom)),
    months: months ?? [1],
    dows: dows ?? [1],
  };
}

/** Build a cron expression string from structured state. */
function buildCron({ period, minute, hour, dom, months, dows }) {
  const m = String(minute).padStart(2, "0");
  const h = String(hour).padStart(2, "0");
  const d = String(dom);
  const mo = months.length === 12 ? "*" : [...months].sort((a, b) => a - b).join(",");
  const dw = dows.length === 7 ? "*" : [...dows].sort((a, b) => a - b).join(",");

  switch (period) {
    case "minute": return "* * * * *";
    case "hour": return `${m} * * * *`;
    case "day": return `${m} ${h} * * *`;
    case "week": return `${m} ${h} * * ${dw}`;
    case "month": return `${m} ${h} ${d} * *`;
    case "year": return `${m} ${h} ${d} ${mo} *`;
    default: return "* * * * *";
  }
}

/** Human-readable description of a cron expression. */
function humanize({ period, minute, hour, dom, months, dows }) {
  const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;

  switch (period) {
    case "minute":
      return "Every minute";
    case "hour":
      return `Every hour at :${String(minute).padStart(2, "0")}`;
    case "day":
      return `Every day at ${timeStr}`;
    case "week": {
      const dayNames = dows.map((d) => WEEKDAYS[d]?.label).join(", ");
      return `Every week on ${dayNames} at ${timeStr}`;
    }
    case "month":
      return `Monthly on day ${dom} at ${timeStr}`;
    case "year": {
      const monthNames = months
        .sort((a, b) => a - b)
        .map((m) => MONTHS[m - 1]?.label)
        .join(", ");
      return `Yearly on ${monthNames} ${dom} at ${timeStr}`;
    }
    default:
      return "";
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ToggleChip({ label, selected, onClick, size = "sm" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "inline-flex items-center justify-center rounded font-mono transition-all duration-150 select-none",
        "border focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        size === "xs"
          ? "h-7 min-w-[2.25rem] px-1.5 text-[11px]"
          : "h-8 min-w-[2.75rem] px-2 text-xs",
        selected
          ? "border-primary bg-primary text-primary-foreground font-semibold shadow-sm"
          : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground",
      ].join(" ")}
    >
      {label}
    </button>
  );
}

function NumberField({ label, value, onChange, min, max, className = "" }) {
  return (
    <div className={`space-y-1 ${className}`}>
      <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
      <Input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (!isNaN(v) && v >= min && v <= max) onChange(v);
        }}
        className="h-8 w-full font-mono text-sm tabular-nums"
      />
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="mb-2 text-[10px] font-mono font-semibold uppercase tracking-widest text-muted-foreground">
      {children}
    </p>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export const CronJobScheduler = ({
  value,
  handleChange,
  readOnly = false,
  disabled = false,
  onError,
}) => {
  CronJobScheduler.propTypes = {
    value: PropTypes.string,
    handleChange: PropTypes.func,
    readOnly: PropTypes.bool,
    disabled: PropTypes.bool,
    onError: PropTypes.func,
  };

  // Initialise state from incoming cron string (or defaults)
  const initState = useMemo(
    () =>
      parseCron(value) ?? {
        period: "day",
        minute: 0,
        hour: 9,
        dom: 1,
        months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        dows: [1, 2, 3, 4, 5], // Mon–Fri
      },
    // Only run once on mount; subsequent changes come from UI interactions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [state, setState] = useState(initState);
  const [rawInput, setRawInput] = useState(value ?? "");
  const [rawError, setRawError] = useState(false);
  const [showRaw, setShowRaw] = useState(false);

  // Sync raw input whenever state changes
  useEffect(() => {
    const expr = buildCron(state);
    setRawInput(expr);
    handleChange?.(expr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  const update = useCallback((patch) => {
    if (disabled || readOnly) return;
    setState((prev) => ({ ...prev, ...patch }));
  }, [disabled, readOnly]);

  const toggleMulti = useCallback((field, val, list) => {
    const next = list.includes(val)
      ? list.filter((v) => v !== val)
      : [...list, val];
    if (next.length > 0) update({ [field]: next });
  }, [update]);

  // Handle raw cron input
  const handleRawChange = useCallback((raw) => {
    setRawInput(raw);
    const parsed = parseCron(raw);
    if (parsed) {
      setRawError(false);
      setState(parsed);
      handleChange?.(raw);
    } else {
      setRawError(raw.length > 0);
      if (onError) onError(raw.length > 0 ? new Error("Invalid cron expression") : null);
    }
  }, [handleChange, onError]);

  const description = humanize(state);
  const expression = buildCron(state);

  return (
    <div className={`w-full space-y-4 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>

      {/* ── Period selector ─────────────────────────────────────────────── */}
      <div>
        <SectionLabel>Repeat every</SectionLabel>
        <div className="flex flex-wrap gap-1.5">
          {PERIODS.map((p) => (
            <ToggleChip
              key={p.value}
              label={p.label}
              selected={state.period === p.value}
              onClick={() => update({ period: p.value })}
            />
          ))}
        </div>
      </div>

      {/* ── Conditional fields ──────────────────────────────────────────── */}

      {/* MINUTE – no extra fields */}
      {state.period === "minute" && (
        <p className="text-xs text-muted-foreground italic">
          Runs on every minute tick — no further configuration needed.
        </p>
      )}

      {/* HOUR – minute offset */}
      {state.period === "hour" && (
        <div className="grid grid-cols-2 gap-3">
          <NumberField
            label="At minute"
            value={state.minute}
            min={0}
            max={59}
            onChange={(v) => update({ minute: v })}
          />
        </div>
      )}

      {/* DAY – time of day */}
      {state.period === "day" && (
        <div className="grid grid-cols-2 gap-3">
          <NumberField label="Hour (0–23)" value={state.hour} min={0} max={23} onChange={(v) => update({ hour: v })} />
          <NumberField label="Minute (0–59)" value={state.minute} min={0} max={59} onChange={(v) => update({ minute: v })} />
        </div>
      )}

      {/* WEEK – day-of-week toggles + time */}
      {state.period === "week" && (
        <div className="space-y-3">
          <div>
            <SectionLabel>On days</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {WEEKDAYS.map((d) => (
                <ToggleChip
                  key={d.value}
                  label={d.label}
                  size="xs"
                  selected={state.dows.includes(d.value)}
                  onClick={() => toggleMulti("dows", d.value, state.dows)}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <NumberField label="Hour (0–23)" value={state.hour} min={0} max={23} onChange={(v) => update({ hour: v })} />
            <NumberField label="Minute (0–59)" value={state.minute} min={0} max={59} onChange={(v) => update({ minute: v })} />
          </div>
        </div>
      )}

      {/* MONTH – day-of-month + time */}
      {state.period === "month" && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <NumberField label="Day (1–31)" value={state.dom} min={1} max={31} onChange={(v) => update({ dom: v })} />
            <NumberField label="Hour (0–23)" value={state.hour} min={0} max={23} onChange={(v) => update({ hour: v })} />
            <NumberField label="Minute (0–59)" value={state.minute} min={0} max={59} onChange={(v) => update({ minute: v })} />
          </div>
        </div>
      )}

      {/* YEAR – month toggles + day + time */}
      {state.period === "year" && (
        <div className="space-y-3">
          <div>
            <SectionLabel>In months</SectionLabel>
            <div className="flex flex-wrap gap-1.5">
              {MONTHS.map((m) => (
                <ToggleChip
                  key={m.value}
                  label={m.label}
                  size="xs"
                  selected={state.months.includes(m.value)}
                  onClick={() => toggleMulti("months", m.value, state.months)}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <NumberField label="Day (1–31)" value={state.dom} min={1} max={31} onChange={(v) => update({ dom: v })} />
            <NumberField label="Hour (0–23)" value={state.hour} min={0} max={23} onChange={(v) => update({ hour: v })} />
            <NumberField label="Minute (0–59)" value={state.minute} min={0} max={59} onChange={(v) => update({ minute: v })} />
          </div>
        </div>
      )}

      {/* ── Expression preview ──────────────────────────────────────────── */}
      <div className="rounded-md border border-border bg-muted/40 px-3 py-2.5 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <code className="font-mono text-sm font-semibold tracking-wider text-foreground">
            {expression}
          </code>
          <span className="shrink-0 rounded-sm bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-primary">
            cron
          </span>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>

      {/* ── Raw input (collapsible) ──────────────────────────────────────── */}
      <div className="border-t border-border/60 pt-3">
        <button
          type="button"
          onClick={() => setShowRaw((v) => !v)}
          className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            className={`h-3 w-3 transition-transform ${showRaw ? "rotate-90" : ""}`}
          >
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Edit raw cron expression
        </button>

        {showRaw && (
          <div className="mt-2 space-y-1">
            <Input
              type="text"
              value={rawInput}
              onChange={(e) => handleRawChange(e.target.value)}
              placeholder="* * * * *"
              readOnly={readOnly}
              className={[
                "w-full font-mono text-sm",
                rawError ? "border-destructive focus-visible:ring-destructive" : "",
              ].join(" ")}
              spellCheck={false}
            />
            {rawError && (
              <p className="text-[11px] text-destructive">
                Invalid cron expression — use 5-field format: minute hour dom month dow
              </p>
            )}
            <p className="text-[11px] text-muted-foreground font-mono">
              Format: &lt;min&gt; &lt;hour&gt; &lt;dom&gt; &lt;month&gt; &lt;dow&gt; — use * for wildcard
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
import React, { useState, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import { Input, Label } from "@jet-admin/ui";

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

const DEFAULT_PARSED = {
  period: "day",
  minute: 0,
  hour: 9,
  dom: 1,
  months: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  dows: [1, 2, 3, 4, 5], // Mon–Fri
};

// ─── Cron Parsing & Building ─────────────────────────────────────────────────

function parseCronField(field, min, max) {
  if (field === "*") return null;
  const values = field
    .split(",")
    .map(Number)
    .filter((n) => !isNaN(n) && n >= min && n <= max);
  return values.length > 0 ? values : null;
}

/**
 * Parse a raw 5-field cron expression into a structured object.
 * Returns null if the string is invalid.
 */
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

  // Detect period from pattern
  let period = "minute";
  if (minuteF === "*" && hourF === "*" && domF === "*" && monthF === "*" && dowF === "*") period = "minute";
  else if (minuteF !== "*" && hourF === "*" && domF === "*" && monthF === "*" && dowF === "*") period = "hour";
  else if (minuteF !== "*" && hourF !== "*" && domF === "*" && monthF === "*" && dowF === "*") period = "day";
  else if (minuteF !== "*" && hourF !== "*" && domF === "*" && monthF === "*" && dowF !== "*") period = "week";
  else if (minuteF !== "*" && hourF !== "*" && domF !== "*" && monthF === "*" && dowF === "*") period = "month";
  else if (minuteF !== "*" && hourF !== "*" && domF !== "*" && monthF !== "*" && dowF === "*") period = "year";

  return {
    period,
    minute: isNaN(minute) ? 0 : Math.min(59, Math.max(0, minute)),
    hour: isNaN(hour) ? 0 : Math.min(23, Math.max(0, hour)),
    dom: isNaN(dom) ? 1 : Math.min(31, Math.max(1, dom)),
    months: months ?? [1],
    dows: dows ?? [1],
  };
}

/**
 * Build a cron expression string from a structured state object.
 */
function buildCron({ period, minute, hour, dom, months, dows }) {
  const m = String(minute);
  const h = String(hour);
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

/** Human-readable summary of the schedule. */
function humanize({ period, minute, hour, dom, months, dows }) {
  const timeStr = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
  switch (period) {
    case "minute": return "Every minute";
    case "hour": return `Every hour at :${String(minute).padStart(2, "0")}`;
    case "day": return `Every day at ${timeStr}`;
    case "week": {
      const dayNames = dows.map((d) => WEEKDAYS[d]?.label).join(", ");
      return `Every week on ${dayNames} at ${timeStr}`;
    }
    case "month": return `Monthly on day ${dom} at ${timeStr}`;
    case "year": {
      const monthNames = [...months]
        .sort((a, b) => a - b)
        .map((m) => MONTHS[m - 1]?.label)
        .join(", ");
      return `Yearly on ${monthNames} ${dom} at ${timeStr}`;
    }
    default: return "";
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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
      <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
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

// ─── Main Component (fully controlled) ───────────────────────────────────────

/**
 * CronJobScheduler
 *
 * A **fully controlled** cron expression builder.
 * The external `value` prop is always the single source of truth.
 * Every user interaction derives a new cron string and calls `handleChange`
 * with it — Formik (or any other controller) then feeds the new string back
 * as the updated `value` prop on the next render.
 *
 * There is NO internal state that mirrors `value`. This means:
 *  - No sync races between Formik and local state.
 *  - No need for effects that watch `value` and try to reconcile.
 *  - Loading an existing cron job "just works" because we always render
 *    from whatever `value` the parent gives us.
 */
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

  // ── Derive display state from external value (no useState mirror) ──────────
  const parsed = useMemo(() => parseCron(value) ?? DEFAULT_PARSED, [value]);

  // Raw cron input state: only needed for the "Edit raw" text field.
  // We keep it as local UI state because typing intermediate invalid values
  // (e.g. "30 9 * *") should not propagate upstream until valid.
  const [showRaw, setShowRaw] = useState(false);
  const [rawInput, setRawInput] = useState(value ?? "");
  const [rawError, setRawError] = useState(false);

  // Keep rawInput in sync when value changes externally (e.g. on load)
  // We compare by value to avoid overwriting what the user is actively typing.
  const syncedRaw = useMemo(() => value ?? "", [value]);
  // Only sync rawInput when the panel is closed (not being actively edited)
  const effectivRaw = showRaw ? rawInput : syncedRaw;

  // ── Emit a patched cron string ──────────────────────────────────────────────
  const emit = useCallback(
    (patch) => {
      if (disabled || readOnly) return;
      const next = buildCron({ ...parsed, ...patch });
      handleChange?.(next);
    },
    [parsed, handleChange, disabled, readOnly]
  );

  const toggleMulti = useCallback(
    (field, val, list) => {
      const next = list.includes(val)
        ? list.filter((v) => v !== val)
        : [...list, val];
      if (next.length > 0) emit({ [field]: next });
    },
    [emit]
  );

  // ── Raw input handling ──────────────────────────────────────────────────────
  const handleRawChange = useCallback(
    (raw) => {
      setRawInput(raw);
      const p = parseCron(raw);
      if (p) {
        setRawError(false);
        handleChange?.(raw);
        onError?.(null);
      } else {
        const hasContent = raw.length > 0;
        setRawError(hasContent);
        onError?.(hasContent ? new Error("Invalid cron expression") : null);
      }
    },
    [handleChange, onError]
  );

  const handleShowRawToggle = useCallback(() => {
    setShowRaw((v) => {
      if (!v) {
        // Opening — seed raw input from current value
        setRawInput(value ?? "");
        setRawError(false);
      }
      return !v;
    });
  }, [value]);

  // ── Render ──────────────────────────────────────────────────────────────────
  const expression = buildCron(parsed);
  const description = humanize(parsed);

  return (
    <div className={`w-full space-y-2 ${disabled ? "opacity-50 pointer-events-none" : ""}`}>

      {/* ── Period selector ─────────────────────────────────────────────── */}
      <div className="space-y-1">
        <Label>Repeat every</Label>
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <ToggleChip
              key={p.value}
              label={p.label}
              selected={parsed.period === p.value}
              onClick={() => emit({ period: p.value })}
            />
          ))}
        </div>
      </div>

      {/* ── Conditional fields ──────────────────────────────────────────── */}

      {/* MINUTE – no extra fields */}
      {parsed.period === "minute" && (
        <p className="text-xs text-muted-foreground italic">
          Runs on every minute tick — no further configuration needed.
        </p>
      )}

      {/* HOUR – minute offset */}
      {parsed.period === "hour" && (
        <div className="grid grid-cols-2 gap-2">
          <NumberField
            label="At minute"
            value={parsed.minute}
            min={0}
            max={59}
            onChange={(v) => emit({ minute: v })}
          />
        </div>
      )}

      {/* DAY – time of day */}
      {parsed.period === "day" && (
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="Hour (0–23)" value={parsed.hour} min={0} max={23} onChange={(v) => emit({ hour: v })} />
          <NumberField label="Minute (0–59)" value={parsed.minute} min={0} max={59} onChange={(v) => emit({ minute: v })} />
        </div>
      )}

      {/* WEEK – day-of-week toggles + time */}
      {parsed.period === "week" && (
        <div className="space-y-2">
          <div className="space-y-1">
            <Label>On days</Label>
            <div className="flex flex-wrap gap-2">
              {WEEKDAYS.map((d) => (
                <ToggleChip
                  key={d.value}
                  label={d.label}
                  size="xs"
                  selected={parsed.dows.includes(d.value)}
                  onClick={() => toggleMulti("dows", d.value, parsed.dows)}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="Hour (0–23)" value={parsed.hour} min={0} max={23} onChange={(v) => emit({ hour: v })} />
            <NumberField label="Minute (0–59)" value={parsed.minute} min={0} max={59} onChange={(v) => emit({ minute: v })} />
          </div>
        </div>
      )}

      {/* MONTH – day-of-month + time */}
      {parsed.period === "month" && (
        <div className="space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <NumberField label="Day (1–31)" value={parsed.dom} min={1} max={31} onChange={(v) => emit({ dom: v })} />
            <NumberField label="Hour (0–23)" value={parsed.hour} min={0} max={23} onChange={(v) => emit({ hour: v })} />
            <NumberField label="Minute (0–59)" value={parsed.minute} min={0} max={59} onChange={(v) => emit({ minute: v })} />
          </div>
        </div>
      )}

      {/* YEAR – month toggles + day + time */}
      {parsed.period === "year" && (
        <div className="space-y-2">
          <div className="space-y-1">
            <Label>In months</Label>
            <div className="flex flex-wrap gap-2">
              {MONTHS.map((m) => (
                <ToggleChip
                  key={m.value}
                  label={m.label}
                  size="xs"
                  selected={parsed.months.includes(m.value)}
                  onClick={() => toggleMulti("months", m.value, parsed.months)}
                />
              ))}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <NumberField label="Day (1–31)" value={parsed.dom} min={1} max={31} onChange={(v) => emit({ dom: v })} />
            <NumberField label="Hour (0–23)" value={parsed.hour} min={0} max={23} onChange={(v) => emit({ hour: v })} />
            <NumberField label="Minute (0–59)" value={parsed.minute} min={0} max={59} onChange={(v) => emit({ minute: v })} />
          </div>
        </div>
      )}

      {/* ── Expression preview ──────────────────────────────────────────── */}
      <div className="rounded border border-border bg-muted/40 p-2 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <code className="font-mono text-sm font-semibold tracking-wider text-foreground">
            {expression}
          </code>
          <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 font-mono text-xs uppercase tracking-widest text-primary">
            cron
          </span>
        </div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
      </div>

      {/* ── Raw input (collapsible) ──────────────────────────────────────── */}
      <div>
        <button
          type="button"
          onClick={handleShowRawToggle}
          className="flex items-center gap-2 text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors"
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
              value={effectivRaw}
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
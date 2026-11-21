/**
 * dateContracts — canonical date/range parsing, validation and preset logic
 * (E11/E12, F05). Pure + dependency-free (no date-fns) so renderers, editors
 * and jest share one implementation.
 *
 * Timezone/wall-time semantics (explicit, documented):
 * - Date-only mode (enableTime=false): values are calendar dates "YYYY-MM-DD".
 *   They carry NO timezone and NO time. Parsing constructs a LOCAL date at
 *   noon to avoid DST/UTC midnight shifts; formatting emits the calendar date.
 *   Round-trip is guaranteed: format(parse("2026-02-29")) === "2026-02-29"
 *   (invalid dates return null instead of shifting).
 * - Datetime mode (enableTime=true): values are LOCAL wall time
 *   "YYYY-MM-DDTHH:mm:ss" with NO offset suffix (no "Z"). They represent the
 *   wall clock the user saw, not an instant. Do NOT append "Z" or reinterpret
 *   legacy offset-free strings as UTC. When a legacy string carries an offset
 *   ("Z" or ±HH:mm), it is parsed as that instant then rendered back as local
 *   wall time (documented migration, no silent day shift for date-only).
 */

const DATE_ONLY_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATETIME_LOCAL_RE = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2}))?$/;

const pad = (n) => String(n).padStart(2, "0");

const daysInMonth = (y, m) => new Date(y, m, 0).getDate();

const isValidParts = (y, mo, d, h = 0, mi = 0, s = 0) => {
  if (!Number.isInteger(y) || !Number.isInteger(mo) || !Number.isInteger(d)) return false;
  if (mo < 1 || mo > 12) return false;
  if (d < 1 || d > daysInMonth(y, mo)) return false;
  if (h < 0 || h > 23 || mi < 0 || mi > 59 || s < 0 || s > 59) return false;
  return true;
};

/**
 * Parse an ISO-ish string to a local Date, or null when invalid.
 * Accepts "YYYY-MM-DD", "YYYY-MM-DDTHH:mm:ss" (local wall time), full ISO
 * with offset (Date constructor fallback), and Date instances.
 */
export const parseDateSafe = (input) => {
  if (input === null || input === undefined || input === "") return null;
  if (input instanceof Date) return Number.isNaN(input.getTime()) ? null : new Date(input.getTime());
  if (typeof input !== "string") return null;
  const s = input.trim();
  if (!s) return null;
  let m = s.match(DATE_ONLY_RE);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    if (!isValidParts(y, mo, d)) return null;
    return new Date(y, mo - 1, d, 12, 0, 0, 0);
  }
  m = s.match(DATETIME_LOCAL_RE);
  if (m) {
    const y = Number(m[1]);
    const mo = Number(m[2]);
    const d = Number(m[3]);
    const h = Number(m[4]);
    const mi = Number(m[5]);
    const se = m[6] !== undefined ? Number(m[6]) : 0;
    if (!isValidParts(y, mo, d, h, mi, se)) return null;
    return new Date(y, mo - 1, d, h, mi, se, 0);
  }
  const t = new Date(s);
  return Number.isNaN(t.getTime()) ? null : t;
};

/** Calendar-date key "YYYY-MM-DD" for a Date (local). */
export const toDateKey = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

/** Local wall-time key "YYYY-MM-DDTHH:mm:ss". */
export const toDateTimeKey = (date) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  return `${toDateKey(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
};

/** Display helpers (locale-aware, no timezone conversion). */
export const toDisplayDate = (date, locale) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  try {
    return date.toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return toDateKey(date);
  }
};

export const toDisplayDateTime = (date, locale) => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return "";
  try {
    return `${toDisplayDate(date, locale)} · ${date.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" })}`;
  } catch {
    return toDateTimeKey(date);
  }
};

/** Strip time to a local noon date for date-only comparisons. */
export const startOfDayLocal = (date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0, 0, 0);

const toTime = (v) => {
  const d = v instanceof Date ? v : parseDateSafe(v);
  return d ? d.getTime() : null;
};

/**
 * Check a single date against min/max/disabledDates.
 * @param {Date|null} date
 * @param {{ minDate?: string, maxDate?: string, disabledDates?: string[], enableTime?: boolean }} opts
 * @returns {string|null} error or null
 */
export const validateDateConstraints = (date, opts = {}) => {
  if (!date) return null;
  const min = opts.minDate ? parseDateSafe(opts.minDate) : null;
  const max = opts.maxDate ? parseDateSafe(opts.maxDate) : null;
  if (opts.minDate && !min) return null;
  if (opts.maxDate && !max) return null;
  const cmp = opts.enableTime
    ? (a, b) => a.getTime() - b.getTime()
    : (a, b) => startOfDayLocal(a).getTime() - startOfDayLocal(b).getTime();
  if (min && cmp(date, min) < 0) return `Date must be on or after ${toDateKey(min)}.`;
  if (max && cmp(date, max) > 0) return `Date must be on or before ${toDateKey(max)}.`;
  if (Array.isArray(opts.disabledDates) && opts.disabledDates.length > 0) {
    const key = toDateKey(date);
    if (opts.disabledDates.includes(key)) return `This date is disabled. Choose another date.`;
  }
  if (typeof opts.isDateDisabled === "function" && opts.isDateDisabled(date)) {
    return `This date is disabled. Choose another date.`;
  }
  return null;
};

/**
 * Full single-date validation (required + constraints + invalid).
 */
export const validateDateValue = (raw, opts = {}) => {
  const { required = false } = opts;
  if (raw === undefined || raw === null || raw === "") {
    return required ? "A date is required." : null;
  }
  const d = raw instanceof Date ? raw : parseDateSafe(raw);
  if (!d) return "Enter a valid date (YYYY-MM-DD).";
  return validateDateConstraints(d, opts);
};

/**
 * Range validation including same-day inverted times and partial ranges.
 * @returns {{ error: string|null, code: string|null }}
 * codes: required-start|required-end|invalid-start|invalid-end|inverted|constraint
 */
export const validateRangeValues = (startRaw, endRaw, opts = {}) => {
  const { required = false } = opts;
  const hasStart = !(startRaw === undefined || startRaw === null || startRaw === "");
  const hasEnd = !(endRaw === undefined || endRaw === null || endRaw === "");
  if (!hasStart && !hasEnd) {
    return required ? { error: "A date range is required.", code: "required-start" } : { error: null, code: null };
  }
  if (!hasStart || !hasEnd) {
    // Partial range is a valid draft (not an error) unless required demands both.
    if (required) {
      return !hasStart
        ? { error: "Start date is required.", code: "required-start" }
        : { error: "End date is required.", code: "required-end" };
    }
    // Validate whichever side exists.
    if (hasStart) {
      const s = parseDateSafe(startRaw);
      if (!s) return { error: "Enter a valid start date.", code: "invalid-start" };
      const c = validateDateConstraints(s, opts);
      if (c) return { error: c, code: "constraint" };
    }
    if (hasEnd) {
      const e = parseDateSafe(endRaw);
      if (!e) return { error: "Enter a valid end date.", code: "invalid-end" };
      const c = validateDateConstraints(e, opts);
      if (c) return { error: c, code: "constraint" };
    }
    return { error: null, code: "partial" };
  }
  const s = startRaw instanceof Date ? startRaw : parseDateSafe(startRaw);
  const e = endRaw instanceof Date ? endRaw : parseDateSafe(endRaw);
  if (!s) return { error: "Enter a valid start date.", code: "invalid-start" };
  if (!e) return { error: "Enter a valid end date.", code: "invalid-end" };
  const sc = validateDateConstraints(s, opts);
  if (sc) return { error: `Start: ${sc}`, code: "constraint" };
  const ec = validateDateConstraints(e, opts);
  if (ec) return { error: `End: ${ec}`, code: "constraint" };
  if (e.getTime() < s.getTime()) {
    if (toDateKey(s) === toDateKey(e)) {
      return { error: "End time must be at or after start time on the same day.", code: "inverted" };
    }
    return { error: "End date must be on or after start date.", code: "inverted" };
  }
  return { error: null, code: null };
};

/** True when a candidate date is selectable (used to disable calendar days). */
export const isDateSelectable = (date, opts = {}) => validateDateConstraints(date, opts) === null;

/**
 * Resolve a range preset to { start, end } Dates.
 * Supports BOTH shapes (dual-read, canonical write is { label, start, end }):
 * - canonical: { label, start: ISO, end: ISO }
 * - legacy renderer: { label, startOffset: number|"startOfMonth"|"startOfYear",
 *   endOffset: number|"endOfMonth"|"endOfYear" }
 * Offsets are days relative to `now` (default new Date()).
 */
export const resolvePresetRange = (preset = {}, now = new Date()) => {
  if (preset.start !== undefined || preset.end !== undefined) {
    return { start: parseDateSafe(preset.start), end: parseDateSafe(preset.end) };
  }
  const base = now instanceof Date ? now : new Date();
  const atNoon = new Date(base.getFullYear(), base.getMonth(), base.getDate(), 12, 0, 0, 0);
  const resolveOffset = (off, isEnd) => {
    if (off === "startOfMonth") return new Date(atNoon.getFullYear(), atNoon.getMonth(), 1, 12, 0, 0, 0);
    if (off === "endOfMonth") {
      const last = new Date(atNoon.getFullYear(), atNoon.getMonth() + 1, 0).getDate();
      return new Date(atNoon.getFullYear(), atNoon.getMonth(), last, 12, 0, 0, 0);
    }
    if (off === "startOfYear") return new Date(atNoon.getFullYear(), 0, 1, 12, 0, 0, 0);
    if (off === "endOfYear") return new Date(atNoon.getFullYear(), 11, 31, 12, 0, 0, 0);
    if (typeof off === "number" && Number.isFinite(off)) {
      const d = new Date(atNoon);
      d.setDate(d.getDate() + off);
      return d;
    }
    if (typeof off === "string" && off !== "") return parseDateSafe(off);
    return isEnd ? new Date(atNoon) : new Date(atNoon);
  };
  return {
    start: resolveOffset(preset.startOffset ?? 0, false),
    end: resolveOffset(preset.endOffset ?? 0, true),
  };
};

/**
 * Normalize placeholder aliases (dual-read, canonical write placeholderStart/End).
 * Canonical wins on conflict.
 */
export const normalizeRangePlaceholders = (config = {}) => {
  const start = config.placeholderStart ?? config.startPlaceholder ?? "Start date";
  const end = config.placeholderEnd ?? config.endPlaceholder ?? "End date";
  return { placeholderStart: start, placeholderEnd: end };
};

/** Serialize a Date to the widget value shape for the given mode. */
export const serializeDateValue = (date, enableTime) => {
  if (!date) return "";
  return enableTime ? toDateTimeKey(date) : toDateKey(date);
};

export const __private = { DATE_ONLY_RE, DATETIME_LOCAL_RE, toTime };

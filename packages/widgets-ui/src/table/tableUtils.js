/**
 * Table Widget Utilities — pure functions, no React/DOM dependencies.
 * Shared by TableWidget and unit tests.
 */

/**
 * Resolve a dotted / bracket path against a row object.
 * Supports "user.name", "orders[0].total", "a.b.c".
 */
export const getNestedValue = (row, path) => {
  if (row === null || row === undefined || !path) return undefined;
  const key = String(path);
  if (Object.prototype.hasOwnProperty.call(row, key)) return row[key];
  const normalized = key.replace(/\[(\d+)\]/g, ".$1");
  const parts = normalized.split(".");
  let current = row;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== "object") return undefined;
    current = current[part];
  }
  return current;
};

const normKey = (v) => (v === null || v === undefined ? "" : String(v).toLowerCase());

/**
 * Normalize a raw column definition into canonical shape.
 * Accepts legacy schema keys (field/title) and current keys (key/id/label).
 */
export const normalizeColumn = (col = {}) => {
  const key = col.key ?? col.id ?? col.field ?? col.accessor ?? "";
  const label = col.label ?? col.title ?? col.header ?? String(key);
  return {
    key: String(key),
    id: String(col.id ?? key),
    label: String(label),
    title: String(col.title ?? label),
    field: String(col.field ?? key),
    type: col.type || "text",
    width: col.width,
    sortable: col.sortable !== false,
    filterable: !!col.filterable,
    editable: col.editable === true || col.editable === "true",
    hidden: col.hidden === true || col.hidden === "true",
    format: col.format,
  };
};

/**
 * Merge builder/resolved columns with user-configured columns (case-insensitive),
 * fall back to inferring from first row, and drop hidden columns.
 */
export const normalizeColumns = (resolvedCols, widgetCols, rows) => {
  const list = Array.isArray(resolvedCols) && resolvedCols.length
    ? resolvedCols
    : Array.isArray(widgetCols) && widgetCols.length
      ? widgetCols
      : [];

  const userByKey = new Map();
  (Array.isArray(widgetCols) ? widgetCols : []).forEach((c) => {
    const k = c.key ?? c.id ?? c.field;
    if (k !== undefined && k !== "") userByKey.set(normKey(k), c);
  });

  let merged = list.map((col) => {
    const k = col.key ?? col.id ?? col.field ?? "";
    const userCol = userByKey.get(normKey(k));
    const base = { key: k, id: k, ...(col || {}) };
    const out = userCol ? { ...base, ...userCol } : base;
    return normalizeColumn(out);
  });

  if (merged.length === 0 && Array.isArray(rows) && rows.length > 0 && typeof rows[0] === "object" && rows[0] !== null) {
    merged = Object.keys(rows[0]).map((k) => {
      const userCol = userByKey.get(normKey(k));
      return normalizeColumn({ key: k, id: k, label: k, ...(userCol || {}) });
    });
  }

  return merged.filter((c) => !c.hidden && c.key !== "");
};

/**
 * Format scalar cell values for text/number/boolean/date column types.
 */
export const formatCellValue = (value, col = {}) => {
  if (value === null || value === undefined || value === "") return "—";
  const type = col.type || "text";
  if (type === "number") {
    const n = Number(value);
    if (Number.isNaN(n)) return String(value);
    return n.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  if (type === "boolean") {
    if (value === true || value === "true" || value === 1 || value === "1") return "Yes";
    if (value === false || value === "false" || value === 0 || value === "0") return "No";
    return String(value);
  }
  if (type === "date") {
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    try {
      return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: d.getHours() || d.getMinutes() ? "short" : undefined });
    } catch {
      return d.toISOString();
    }
  }
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

/**
 * Build CSV string (pure — no Blob / DOM). Handles quoting + nested paths.
 */
export const buildCSVContent = (columns, rows) => {
  const esc = (v) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const exportType = (t) => (t === "link" || t === "image" || t === "badge" ? "text" : t);
  const headers = columns.map((c) => esc(c.label || c.key || c.id)).join(",");
  const body = rows.map((r) =>
    columns.map((c) => {
      const raw = getNestedValue(r, c.key || c.id);
      if (raw === null || raw === undefined || raw === "") return esc("");
      const formatted = formatCellValue(raw, { ...c, type: exportType(c.type) });
      return esc(formatted === "—" ? "" : formatted);
    }).join(",")
  ).join("\n");
  return headers + (body ? "\n" + body : "");
};

/**
 * Build JSON export string (pure).
 */
export const buildJSONContent = (columns, rows) => {
  const keys = columns.map((c) => c.key || c.id);
  const data = rows.map((r) => {
    const obj = {};
    keys.forEach((k) => { obj[k] = getNestedValue(r, k) ?? null; });
    return obj;
  });
  return JSON.stringify(data, null, 2);
};

export const coerceTotalRows = (raw, fallback = 0) => {
  if (raw === null || raw === undefined || raw === "") return fallback;
  const n = Number(raw);
  if (Number.isNaN(n) || n < 0) return fallback;
  return Math.floor(n);
};

export const resolvePageSize = (...candidates) => {
  for (const c of candidates) {
    const n = Number(c);
    if (Number.isInteger(n) && n > 0 && n <= 500) return n;
  }
  return 10;
};

/**
 * Diff a draft row against the original to produce a changes object.
 * Normalizes null/undefined/"" so untouched empties don't count as changes.
 */
export const diffRowChanges = (originalRow = {}, draftRow = {}, columns = []) => {
  const norm = (v) => (v === undefined || v === null ? "" : v);
  const changes = {};
  columns.forEach((c) => {
    if (!c.editable) return;
    const k = c.key;
    if (String(norm(originalRow[k])) !== String(norm(draftRow[k]))) {
      changes[k] = draftRow[k];
    }
  });
  return changes;
};

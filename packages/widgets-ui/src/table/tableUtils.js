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
  const pinned = col.pinned === "left" || col.pinned === "right" ? col.pinned : "";
  return {
    key: String(key),
    id: String(col.id ?? key),
    label: String(label),
    title: String(col.title ?? label),
    field: String(col.field ?? key),
    type: col.type || "text",
    width: col.width,
    minWidth: col.minWidth,
    maxWidth: col.maxWidth,
    pinned,
    sortable: col.sortable !== false,
    filterable: !!col.filterable,
    editable: col.editable === true || col.editable === "true",
    hidden: col.hidden === true || col.hidden === "true",
    format: col.format,
    align: col.align || "",
    decimals: col.decimals,
    currency: col.currency,
    conditionalStyles: col.conditionalStyles || null,
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
    const decimals = col.decimals === undefined ? 2 : Math.max(0, Math.min(6, Number(col.decimals)));
    return n.toLocaleString(undefined, { maximumFractionDigits: decimals });
  }
  if (type === "boolean") {
    if (value === true || value === "true" || value === 1 || value === "1") return "Yes";
    if (value === false || value === "false" || value === 0 || value === "0") return "No";
    return String(value);
  }
  if (type === "date") {
    const raw = String(value);
    const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(raw);
    const d = value instanceof Date ? value : dateOnly ? new Date(`${raw}T00:00:00`) : new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    try {
      return d.toLocaleString(undefined, {
        dateStyle: "medium",
        ...(dateOnly ? {} : { timeStyle: d.getHours() || d.getMinutes() ? "short" : undefined }),
      });
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

// ── XLSX export (store-only ZIP + SpreadsheetML) ──
// Avoids adding a spreadsheet dependency: an XLSX file is a ZIP of OOXML
// parts. Storing entries uncompressed keeps this dependency-free and fast for
// the row counts a widget export realistically handles.

const CRC_TABLE = (() => {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
})();

const crc32 = (bytes) => {
  let crc = 0xffffffff;
  for (let index = 0; index < bytes.length; index += 1) {
    crc = CRC_TABLE[(crc ^ bytes[index]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
};

const xmlEscape = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/\u0000/g, "");

const columnLetter = (index) => {
  let value = index + 1;
  let label = "";
  while (value > 0) {
    const mod = (value - 1) % 26;
    label = String.fromCharCode(65 + mod) + label;
    value = Math.floor((value - 1) / 26);
  }
  return label;
};

const sheetCell = (value, col, colIndex, rowIndex) => {
  const ref = `${columnLetter(colIndex)}${rowIndex}`;
  const type = col?.type || "text";
  if (value === null || value === undefined || value === "") {
    return `<c r="${ref}" s="0"/>`;
  }
  const rawType = typeof value;
  const numericTypes = new Set(["number", "currency", "progress"]);
  if (numericTypes.has(type) || (rawType === "number" && type !== "text")) {
    const number = Number(value);
    if (Number.isFinite(number)) return `<c r="${ref}" s="0"><v>${number}</v></c>`;
  }
  if (type === "boolean" || rawType === "boolean") {
    const truthy = value === true || value === "true" || value === 1 || value === "1";
    const falsy = value === false || value === "false" || value === 0 || value === "0";
    if (truthy || falsy) return `<c r="${ref}" t="b" s="0"><v>${truthy ? 1 : 0}</v></c>`;
  }
  return `<c r="${ref}" t="inlineStr" s="0"><is><t xml:space="preserve">${xmlEscape(value)}</t></is></c>`;
};

const buildSheetXML = (columns, rows) => {
  const cols = columns
    .map((column, index) => {
      const width = Number(column.width);
      const charWidth = Number.isFinite(width) && width > 0 ? Math.max(8, Math.round(width / 7)) : Math.max(10, String(column.label || column.key || "").length + 2);
      return `<col min="${index + 1}" max="${index + 1}" width="${Math.min(60, charWidth)}" customWidth="1"/>`;
    })
    .join("");

  const header = columns
    .map((column, index) => `<c r="${columnLetter(index)}1" t="inlineStr" s="1"><is><t>${xmlEscape(column.label || column.key)}</t></is></c>`)
    .join("");

  const body = rows
    .map((row, rowIndex) => {
      const cells = columns
        .map((column, colIndex) => sheetCell(getNestedValue(row, column.key || column.id), column, colIndex, rowIndex + 2))
        .join("");
      return `<row r="${rowIndex + 2}">${cells}</row>`;
    })
    .join("");

  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  ${cols ? `<cols>${cols}</cols>` : ""}
  <sheetData><row r="1">${header}</row>${body}</sheetData>
</worksheet>`;
};

const buildWorkbookParts = (columns, rows) => ({
  "[Content_Types].xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
</Types>`,
  "_rels/.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>`,
  "xl/workbook.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets><sheet name="Data" sheetId="1" r:id="rId1"/></sheets>
</workbook>`,
  "xl/_rels/workbook.xml.rels": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`,
  "xl/styles.xml": `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FFF1F5F9"/><bgColor indexed="64"/></patternFill></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs>
</styleSheet>`,
  "xl/worksheets/sheet1.xml": buildSheetXML(columns, rows),
});

const u16 = (view, offset, value) => view.setUint16(offset, value, true);
const u32 = (view, offset, value) => view.setUint32(offset, value >>> 0, true);

/**
 * Build a valid .xlsx byte array (store-only ZIP). Pure: no DOM, no deps.
 * Returns Uint8Array.
 */
export const buildXLSXBytes = (columns, rows = []) => {
  const encoder = new TextEncoder();
  const entries = Object.entries(buildWorkbookParts(columns, rows)).map(([name, xml]) => ({
    nameBytes: encoder.encode(name),
    dataBytes: encoder.encode(xml),
  }));

  let offset = 0;
  const localParts = [];
  const centralParts = [];

  for (const entry of entries) {
    const crc = crc32(entry.dataBytes);
    const local = new Uint8Array(30 + entry.nameBytes.length);
    const localView = new DataView(local.buffer);
    u32(localView, 0, 0x04034b50);
    u16(localView, 4, 20);
    u16(localView, 6, 0x0800);
    u16(localView, 8, 0);
    u16(localView, 10, 0);
    u16(localView, 12, 0x21);
    u32(localView, 14, crc);
    u32(localView, 18, entry.dataBytes.length);
    u32(localView, 22, entry.dataBytes.length);
    u16(localView, 26, entry.nameBytes.length);
    u16(localView, 28, 0);
    local.set(entry.nameBytes, 30);
    localParts.push(local, entry.dataBytes);

    const central = new Uint8Array(46 + entry.nameBytes.length);
    const centralView = new DataView(central.buffer);
    u32(centralView, 0, 0x02014b50);
    u16(centralView, 4, 20);
    u16(centralView, 6, 20);
    u16(centralView, 8, 0x0800);
    u16(centralView, 10, 0);
    u16(centralView, 12, 0);
    u16(centralView, 14, 0x21);
    u32(centralView, 16, crc);
    u32(centralView, 20, entry.dataBytes.length);
    u32(centralView, 24, entry.dataBytes.length);
    u16(centralView, 28, entry.nameBytes.length);
    u16(centralView, 30, 0);
    u16(centralView, 32, 0);
    u16(centralView, 34, 0);
    u16(centralView, 36, 0);
    u32(centralView, 38, 0);
    u32(centralView, 42, offset);
    central.set(entry.nameBytes, 46);
    centralParts.push(central);

    offset += local.length + entry.dataBytes.length;
  }

  const centralSize = centralParts.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  u32(endView, 0, 0x06054b50);
  u16(endView, 4, 0);
  u16(endView, 6, 0);
  u16(endView, 8, entries.length);
  u16(endView, 10, entries.length);
  u32(endView, 12, centralSize);
  u32(endView, 16, offset);
  u16(endView, 20, 0);

  const total = offset + centralSize + end.length;
  const output = new Uint8Array(total);
  let cursor = 0;
  for (const part of localParts) {
    output.set(part, cursor);
    cursor += part.length;
  }
  for (const part of centralParts) {
    output.set(part, cursor);
    cursor += part.length;
  }
  output.set(end, cursor);
  return output;
};

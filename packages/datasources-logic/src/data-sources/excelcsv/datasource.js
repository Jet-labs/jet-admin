/**
 * datasource.js
 *
 * ExcelCSVDataSource — fetches an Excel (.xlsx) or CSV file and returns
 * its rows as an array of plain objects keyed by column headers.
 *
 * File I/O (S3, Supabase client, plain HTTP) is fully delegated to
 * fileStorage.util.js; this file owns only parsing and caching logic.
 *
 * Visual-query post-processing (column projection, filtering, sorting) is
 * applied in-memory after the raw rows are fetched, so the parse cache
 * stores only raw rows — cheap re-runs never re-fetch the file.
 */

import ExcelJS from "exceljs";
import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

// ─── Parse cache ──────────────────────────────────────────────────────────────

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const parseCache = new Map();

/**
 * Builds a collision-safe cache key from the query parameters.
 * JSON.stringify avoids separator-collision bugs that arise from string
 * concatenation when any parameter value contains the separator character.
 */
function buildCacheKey(parts) {
  return JSON.stringify(parts);
}

function cacheGet(key) {
  const entry = parseCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp >= CACHE_TTL_MS) {
    parseCache.delete(key);
    return null;
  }
  return entry.data;
}

function cacheSet(key, data) {
  // Evict all stale entries before inserting to keep Map memory bounded
  const now = Date.now();
  for (const [k, v] of parseCache) {
    if (now - v.timestamp >= CACHE_TTL_MS) parseCache.delete(k);
  }
  parseCache.set(key, { timestamp: now, data });
}

// ─── CSV detection ────────────────────────────────────────────────────────────

/**
 * Returns true if the file should be parsed as CSV rather than XLSX.
 * Uses URL pathname (stripping query-string and hash) for the extension check.
 *
 * @param {string}  fileUrl
 * @param {string=} fileType  MIME type or extension hint from datasource config
 */
function isCsvFile(fileUrl, fileType) {
  if (fileType && /csv/i.test(fileType)) return true;
  try {
    return new URL(fileUrl).pathname.toLowerCase().endsWith(".csv");
  } catch {
    // Fallback for relative or malformed URLs
    return fileUrl.split("?")[0].split("#")[0].toLowerCase().endsWith(".csv");
  }
}

// ─── Worksheet helpers ────────────────────────────────────────────────────────

/**
 * Extracts column headers from the designated header row.
 *
 * ExcelJS uses 1-based column numbers, so the returned array is also 1-based
 * (index 0 is intentionally unused) — callers can use colNumber directly as
 * an index without any offset adjustment.
 *
 * @param {import("exceljs").Row} headerRowObj
 * @returns {string[]}
 */
function extractHeaders(headerRowObj) {
  const headers = []; // sparse; index 0 unused
  headerRowObj.eachCell({ includeEmpty: true }, (cell, colNumber) => {
    const raw = cell.value;
    headers[colNumber] =
      raw !== null && raw !== undefined ? String(raw).trim() : `Column_${colNumber}`;
  });
  return headers;
}

/**
 * Unwraps formula results, rich-text arrays, and hyperlink objects from an
 * ExcelJS cell value, returning a plain scalar (or null).
 *
 * @param {import("exceljs").CellValue} cellValue
 * @returns {*}
 */
function resolveCellValue(cellValue) {
  if (cellValue === null || cellValue === undefined) return null;
  if (typeof cellValue !== "object") return cellValue; // scalar fast-path

  if (cellValue.result !== undefined) return cellValue.result;
  if (cellValue.text !== undefined) return cellValue.text;
  if (Array.isArray(cellValue.richText)) {
    return cellValue.richText.map((t) => t.text).join("");
  }

  return cellValue; // Date objects and other non-formula objects pass through
}

/**
 * Parses the optional A1-notation range string and returns the last permitted
 * row number, or Infinity when no upper bound is specified.
 *
 * @param {string|undefined} range  e.g. "A1:Z100"
 * @returns {number}
 */
function parseRangeEndRow(range) {
  if (!range) return Infinity;
  const digits = range.match(/\d+/g);
  // A1 range has two digit groups: start-row and end-row
  return digits && digits.length >= 2 ? parseInt(digits[1], 10) : Infinity;
}

// ─── Visual-query post-processing helpers ────────────────────────────────────

/**
 * Evaluates a single filter condition against a cell value.
 *
 * Numeric operators (gt, gte, lt, lte) attempt a float parse and fall back
 * to lexicographic comparison so they work on both number and string columns.
 * String operators are case-insensitive.
 *
 * @param {*}      cellValue   Raw value from the parsed row
 * @param {string} operator    One of the FILTER_OPERATORS values
 * @param {string} filterValue The right-hand side entered in the query builder
 * @returns {boolean}
 */
function evaluateCondition(cellValue, operator, filterValue) {
  const strCell = cellValue !== null && cellValue !== undefined ? String(cellValue) : "";
  const strFilter = filterValue !== null && filterValue !== undefined ? String(filterValue) : "";
  const numCell = parseFloat(cellValue);
  const numFilter = parseFloat(filterValue);
  const bothNum = !isNaN(numCell) && !isNaN(numFilter);

  switch (operator) {
    case "eq": return strCell === strFilter;
    case "neq": return strCell !== strFilter;
    case "gt": return bothNum ? numCell > numFilter : strCell > strFilter;
    case "gte": return bothNum ? numCell >= numFilter : strCell >= strFilter;
    case "lt": return bothNum ? numCell < numFilter : strCell < strFilter;
    case "lte": return bothNum ? numCell <= numFilter : strCell <= strFilter;
    case "contains": return strCell.toLowerCase().includes(strFilter.toLowerCase());
    case "not_contains": return !strCell.toLowerCase().includes(strFilter.toLowerCase());
    case "starts_with": return strCell.toLowerCase().startsWith(strFilter.toLowerCase());
    case "ends_with": return strCell.toLowerCase().endsWith(strFilter.toLowerCase());
    case "is_empty": return cellValue === null || cellValue === undefined || strCell === "";
    case "is_not_empty": return cellValue !== null && cellValue !== undefined && strCell !== "";
    default: return true;
  }
}

/**
 * Filters rows using the visual-query `filters` array.
 *
 * Conditions are evaluated left-to-right; the `logic` field on each filter
 * (from index 1 onward) controls how it combines with the accumulated result:
 *   result = eval(filters[0])
 *   for i ≥ 1: result = (logic === "OR") ? result || eval(filters[i])
 *                                         : result && eval(filters[i])
 *
 * Filters with an empty `column` are skipped so partially-filled builder
 * rows do not silently discard all data.
 *
 * @param {object[]} rows
 * @param {Array<{column:string, operator:string, value:string, logic:string}>} filters
 * @returns {object[]}
 */
function applyFilters(rows, filters) {
  if (!Array.isArray(filters) || filters.length === 0) return rows;

  // Skip builder rows that have no column set yet
  const active = filters.filter((f) => f.column && f.column.trim());
  if (active.length === 0) return rows;

  return rows.filter((row) => {
    let result = evaluateCondition(row[active[0].column], active[0].operator, active[0].value);

    for (let i = 1; i < active.length; i++) {
      const { column, operator, value, logic } = active[i];
      const cond = evaluateCondition(row[column], operator, value);
      result = logic === "OR" ? result || cond : result && cond;
    }

    return result;
  });
}

/**
 * Sorts rows using the visual-query `sort` array.
 *
 * Rules are applied in order (first rule = primary sort key). Each rule
 * attempts a numeric comparison and falls back to localeCompare so mixed
 * columns sort sensibly.
 *
 * @param {object[]} rows
 * @param {Array<{column:string, direction:"asc"|"desc"}>} sort
 * @returns {object[]}
 */
function applySort(rows, sort) {
  if (!Array.isArray(sort) || sort.length === 0) return rows;

  const active = sort.filter((s) => s.column && s.column.trim());
  if (active.length === 0) return rows;

  return [...rows].sort((a, b) => {
    for (const { column, direction } of active) {
      const aVal = a[column];
      const bVal = b[column];
      const aNum = parseFloat(aVal);
      const bNum = parseFloat(bVal);

      let cmp;
      if (!isNaN(aNum) && !isNaN(bNum)) {
        cmp = aNum - bNum;
      } else {
        const aStr = aVal !== null && aVal !== undefined ? String(aVal) : "";
        const bStr = bVal !== null && bVal !== undefined ? String(bVal) : "";
        cmp = aStr.localeCompare(bStr);
      }

      if (cmp !== 0) return direction === "desc" ? -cmp : cmp;
    }
    return 0;
  });
}

/**
 * Projects and aliases rows using the visual-query `columns` array.
 *
 * Only columns with `enabled !== false` and a non-empty `sourceName` are
 * included. The output key is `alias` when set, otherwise `sourceName`.
 *
 * If `columns` is empty or contains no enabled entries, all columns are
 * returned as-is (the "include everything" default).
 *
 * Projection is intentionally applied AFTER filtering and sorting so that
 * filter/sort expressions can safely reference original spreadsheet column
 * names regardless of any aliasing the user configured.
 *
 * The UI-generated `id` field on each column descriptor is ignored.
 *
 * @param {object[]} rows
 * @param {Array<{sourceName:string, alias?:string, enabled?:boolean}>} columns
 * @returns {object[]}
 */
function applyColumnProjection(rows, columns) {
  if (!Array.isArray(columns) || columns.length === 0) return rows;

  const enabled = columns.filter((c) => c.enabled !== false && c.sourceName && c.sourceName.trim());
  if (enabled.length === 0) return rows;

  return rows.map((row) => {
    const out = {};
    for (const col of enabled) {
      const outKey = col.alias && col.alias.trim() ? col.alias.trim() : col.sourceName;
      out[outKey] = Object.prototype.hasOwnProperty.call(row, col.sourceName)
        ? row[col.sourceName]
        : null;
    }
    return out;
  });
}

// ─── DataSource ───────────────────────────────────────────────────────────────

export default class ExcelCSVDataSource extends DataSource {
  /**
   * Fetches and parses the configured Excel or CSV file, then applies the
   * full visual-query pipeline produced by ExcelCSVQueryBuilder.
   *
   * Pipeline (in order):
   *   1. Fetch raw bytes        — via helpers.fileStorage
   *   2. Parse into rows        — ExcelJS; result cached by file+sheet+header+range
   *   3. Apply filters          — columns.filter via AND/OR chain
   *   4. Apply sort             — multi-key, numeric-aware
   *   5. Apply column projection — select + alias; referencing original names
   *   6. Apply row limit        — rows.slice(0, limit)
   *
   * @param {object}   dataQueryOptions
   * @param {string=}  dataQueryOptions.sheetName  Target sheet/tab name
   * @param {number=}  dataQueryOptions.headerRow  Header row index, 1-based (default 1)
   * @param {string=}  dataQueryOptions.range      A1-notation upper-bound row filter
   * @param {number=}  dataQueryOptions.limit      Maximum rows to return (applied last)
   * @param {Array=}   dataQueryOptions.columns    Column projection/alias rules from builder
   * @param {Array=}   dataQueryOptions.filters    Filter conditions from builder
   * @param {Array=}   dataQueryOptions.sort       Sort rules from builder
   * @param {object}   context
   * @param {object}   helpers
   * @returns {Promise<object[]>}
   */
  async execute(dataQueryOptions, context, helpers) {
    const {
      sheetName,
      headerRow = 1,
      range,
      limit,
      columns = [],
      filters = [],
      sort = [],
    } = dataQueryOptions || {};

    const fileInfo = this.config.datasourceOptions?.fileInfo || {};
    const fileUrl = this.config.datasourceOptions?.fileUrl || fileInfo.fileUrl;
    const fileType = this.config.datasourceOptions?.fileType || fileInfo.fileType;

    Logger.log("info", {
      message: "excelcsv:ExcelCSVDataSource:execute:params",
      params: {
        fileUrl, sheetName, headerRow, range, limit,
        columnCount: columns.length,
        filterCount: filters.length,
        sortCount: sort.length,
      },
    });

    if (!fileUrl) {
      throw new Error("No Excel or CSV file URL configured for this data source.");
    }

    // Clamp to minimum 1; avoids parseInt("0") || 1 returning 1 incorrectly
    const targetHeaderRow = Math.max(1, parseInt(headerRow, 10) || 1);

    // Cache key covers only the file-fetch / parse parameters.
    // Post-processing (columns, filters, sort, limit) is cheap in-memory JS and
    // is applied after the cache read, so different query configs on the same
    // file/sheet/header/range never trigger a redundant file fetch.
    const cacheKey = buildCacheKey({ fileUrl, sheetName, targetHeaderRow, range });

    let rawRows = cacheGet(cacheKey);

    if (rawRows) {
      Logger.log("info", {
        message: "excelcsv:ExcelCSVDataSource:execute:cacheHit",
        params: { fileUrl },
      });
    } else {
      try {
        // ── 1. Fetch raw bytes via helpers.fileStorage ─────────────────────
        let buffer;
        if (helpers && helpers.fileStorage && typeof helpers.fileStorage.getFileBuffer === "function") {
          buffer = await helpers.fileStorage.getFileBuffer(fileUrl);
        } else {
          throw new Error("Missing fileStorage helper for ExcelCSV execution.");
        }

        // ── 2. Load into ExcelJS ───────────────────────────────────────────
        const workbook = new ExcelJS.Workbook();

        if (isCsvFile(fileUrl, fileType)) {
          const { Readable } = await import("stream");
          await workbook.csv.read(Readable.from(buffer));
        } else {
          await workbook.xlsx.load(buffer);
        }

        // ── 3. Resolve worksheet ───────────────────────────────────────────
        const worksheet = sheetName
          ? workbook.getWorksheet(sheetName)
          : workbook.worksheets[0];

        if (!worksheet) {
          throw new Error(
            `Worksheet "${sheetName || "(first sheet)"}" not found in the spreadsheet.`
          );
        }

        // ── 4. Extract headers ─────────────────────────────────────────────
        const headers = extractHeaders(worksheet.getRow(targetHeaderRow));
        const rangeEndRow = parseRangeEndRow(range);

        // ── 5. Parse data rows ─────────────────────────────────────────────
        rawRows = [];

        worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
          if (rowNumber <= targetHeaderRow) return; // skip header row(s)
          if (rowNumber > rangeEndRow) return;       // honour range upper bound

          const rowData = {};
          let hasValues = false;

          row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
            const header = headers[colNumber] || `Column_${colNumber}`;
            const value = resolveCellValue(cell.value);
            rowData[header] = value;
            if (value !== null && value !== undefined) hasValues = true;
          });

          if (hasValues) rawRows.push(rowData);
        });

        // Cache raw rows keyed only by file-fetch params
        cacheSet(cacheKey, rawRows);

        Logger.log("info", {
          message: "excelcsv:ExcelCSVDataSource:execute:parsed",
          params: { fileUrl, rawRowCount: rawRows.length },
        });

      } catch (err) {
        Logger.log("error", {
          message: "excelcsv:ExcelCSVDataSource:execute:error",
          params: { error: err.message || err },
        });
        throw new Error(`Failed to execute Excel/CSV query: ${err.message}`);
      }
    }

    // ── 6. Apply visual-query post-processing (in-memory, never cached) ──────
    //
    // Order matters:
    //   filter → sort → project → limit
    //
    // Filtering and sorting must happen before projection because filter/sort
    // expressions reference original spreadsheet column names; projection
    // renames them to aliases, after which the originals are gone.

    let result = applyFilters(rawRows, filters);

    Logger.log("info", {
      message: "excelcsv:ExcelCSVDataSource:execute:postFilters",
      params: { rowCount: result.length },
    });

    result = applySort(result, sort);
    result = applyColumnProjection(result, columns);

    if (limit) {
      result = result.slice(0, parseInt(limit, 10));
    }

    Logger.log("info", {
      message: "excelcsv:ExcelCSVDataSource:execute:done",
      params: { finalRowCount: result.length },
    });

    return result;
  }
}
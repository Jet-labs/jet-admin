import { Logger } from "../../utils/logger.js";
import DataSource from "../datasource.js";

function buildBaseUrl(options) {
  return String(options.baseUrl || "http://localhost:8086").replace(/\/+$/, "");
}

// Minimal CSV parser for Flux CSV responses (quoted fields, commas).
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i += 1;
      row.push(field);
      field = "";
      rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.length > 0 && !r.every((c) => c === ""));
}

function isHeaderRow(row) {
  if (!row || row.length === 0) return false;
  const joined = row.join(",").toLowerCase();
  return joined.includes("_time") || joined.includes("_value") || joined.includes("result,table");
}

function rowToObject(headers, cells) {
  const obj = {};
  headers.forEach((header, index) => {
    const value = cells[index] ?? "";
    if (value === "") {
      obj[header] = value;
      return;
    }
    const num = Number(value);
    obj[header] = Number.isFinite(num) && !/^\d{4}-\d{2}/.test(value) ? num : value;
  });
  return obj;
}

function csvToObjects(text) {
  const rows = parseCsv(text);
  const objects = [];
  let headers = null;

  const finishTable = () => {
    headers = null;
  };

  for (const row of rows) {
    // Annotated-CSV annotation rows start a new table boundary.
    if (String(row[0] || "").startsWith("#")) {
      if (String(row[0]).startsWith("#group") && headers) finishTable();
      continue;
    }
    if (isHeaderRow(row)) {
      headers = row.map((h) => String(h).trim());
      continue;
    }
    if (!headers) {
      headers = row.map((h) => String(h).trim());
      continue;
    }
    if (row.every((c) => c === "")) continue;
    objects.push(rowToObject(headers, row));
  }
  return objects;
}

function assertNoLineBreaks(value, field) {
  if (value !== undefined && value !== null && /[\r\n]/.test(String(value))) {
    throw new Error(`${field} must not contain line breaks.`);
  }
}

function escapeLine(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/([",= ])/g, "\\$1");
}

function toUnixNs(timestamp) {
  if (timestamp === undefined || timestamp === null || timestamp === "") return "";
  const raw = String(timestamp).trim();
  if (/^\d{1,20}$/.test(raw)) return raw; // integer nanoseconds
  const ms = Date.parse(raw);
  if (Number.isNaN(ms)) {
    throw new Error("timestamp must be RFC3339 or integer nanoseconds.");
  }
  return String(ms * 1000000);
}

function toLineProtocol({ measurement, tags, fields, timestamp }) {
  assertNoLineBreaks(measurement, "measurement");
  for (const [k, v] of Object.entries(tags || {})) {
    assertNoLineBreaks(k, "tag name");
    assertNoLineBreaks(v, `tag ${k}`);
  }
  for (const [k, v] of Object.entries(fields || {})) {
    assertNoLineBreaks(k, "field name");
    if (typeof v === "string") assertNoLineBreaks(v, `field ${k}`);
  }

  const tagParts = Object.entries(tags || {})
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${escapeLine(k)}=${escapeLine(v)}`)
    .join(",");

  const fieldParts = Object.entries(fields || {})
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => {
      if (typeof v === "number") return `${escapeLine(k)}=${v}`;
      if (typeof v === "boolean") return `${escapeLine(k)}=${v}`;
      return `${escapeLine(k)}="${String(v).replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
    })
    .join(",");

  if (!measurement || !fieldParts) {
    throw new Error("measurement and at least one field are required for an InfluxDB write.");
  }

  const head = tagParts ? `${escapeLine(measurement)},${tagParts}` : escapeLine(measurement);
  const ns = toUnixNs(timestamp);
  return ns ? `${head} ${fieldParts} ${ns}` : `${head} ${fieldParts}`;
}

async function request({ options, method, path, body, contentType }) {
  const url = new URL(path, `${buildBaseUrl(options)}/`);
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    Math.max(1, Number(options.timeout) || 15) * 1000
  );

  try {
    const response = await fetch(url, {
      method,
      signal: controller.signal,
      headers: {
        Authorization: `Token ${options.token || ""}`,
        ...(contentType ? { "Content-Type": contentType } : {}),
        Accept: "text/csv, application/json",
      },
      body,
    });
    const text = await response.text();

    if (!response.ok) {
      throw new Error(`InfluxDB HTTP ${response.status}: ${text.trim().slice(0, 300)}`);
    }
    return { text, status: response.status };
  } finally {
    clearTimeout(timer);
  }
}

async function runFluxQuery({ options, flux, org, bucket }) {
  if (!flux || !String(flux).trim()) {
    throw new Error("Flux query is required.");
  }
  const resolvedOrg = org || options.org || "";
  const path = `/api/v2/query?org=${encodeURIComponent(resolvedOrg)}&type=csv`;
  void bucket; // bucket is selected inside Flux (from(bucket: ...)).
  const { text } = await request({
    options,
    method: "POST",
    path,
    body: String(flux),
    contentType: "application/vnd.flux",
  });
  return csvToObjects(text);
}

async function writePoints({ options, org, bucket, line }) {
  const resolvedOrg = org || options.org || "";
  const resolvedBucket = bucket || options.bucket || "";
  if (!resolvedBucket) throw new Error("bucket is required for an InfluxDB write.");
  const path = `/api/v2/write?org=${encodeURIComponent(resolvedOrg)}&bucket=${encodeURIComponent(resolvedBucket)}&precision=ns`;
  await request({ options, method: "POST", path, body: line, contentType: "text/plain; charset=utf-8" });
  return { success: true, bucket: resolvedBucket };
}

export default class InfluxDBDataSource extends DataSource {
  async execute(dataQueryOptions) {
    const options = this.config.datasourceOptions || {};
    const operation = String(dataQueryOptions?.operation || "query");

    Logger.log("info", {
      message: "influxdb:InfluxDBDataSource:execute:params",
      params: { operation },
    });

    try {
      if (operation === "query") {
        return await runFluxQuery({
          options,
          flux: dataQueryOptions.flux,
          org: dataQueryOptions.org,
          bucket: dataQueryOptions.bucket,
        });
      }

      if (operation === "write") {
        const line = toLineProtocol({
          measurement: dataQueryOptions.measurement,
          tags: dataQueryOptions.tags,
          fields: dataQueryOptions.fields,
          timestamp: dataQueryOptions.timestamp || undefined,
        });
        return await writePoints({
          options,
          org: dataQueryOptions.org,
          bucket: dataQueryOptions.bucket,
          line,
        });
      }

      throw new Error(`Unsupported InfluxDB operation: ${operation}`);
    } catch (error) {
      Logger.log("error", {
        message: "influxdb:InfluxDBDataSource:execute:catch",
        params: { error: error.message || String(error) },
      });
      throw new Error(`InfluxDB query failed: ${error.message || String(error)}`);
    }
  }
}

export { buildBaseUrl, parseCsv, csvToObjects, toLineProtocol, runFluxQuery, writePoints };
